import { create } from 'zustand';
import { authApi, cartApi, userApi } from './api';
import toast from 'react-hot-toast';
import { playChime } from './utils/effects';

// Load initial guest cart from localStorage
const loadLocalCart = () => {
  try {
    const saved = localStorage.getItem('minimart_local_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items) => {
  try {
    localStorage.setItem('minimart_local_cart', JSON.stringify(items));
  } catch {}
};

const loadLocalWishlist = () => {
  try {
    const saved = localStorage.getItem('minimart_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const useStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('minimart_token') || null,
  isAuthenticated: !!localStorage.getItem('minimart_token'),
  cart: loadLocalCart(),
  wishlist: loadLocalWishlist(),
  searchQuery: '',
  activeCategory: 'all',
  activeFilter: 'all', // 'all' | 'organic' | 'under5' | 'deals' | 'topRated'
  
  // Delivery Location
  deliveryLocation: {
    id: null,
    label: 'Home',
    address: '742 Evergreen Terrace, Apt 4B',
    city: 'Springfield',
    zip: '62704',
    eta: '12 - 15 mins'
  },

  // Modals & Tracking
  isAuthModalOpen: false,
  isCartOpen: false,
  isCheckoutOpen: false,
  isLocationModalOpen: false,
  selectedProduct: null,
  activeOrderForTracking: null,
  
  // Setters
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setDeliveryLocation: (loc) => set({ deliveryLocation: loc, isLocationModalOpen: false }),
  setIsLocationModalOpen: (open) => set({ isLocationModalOpen: open }),
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setIsCartOpen: (open) => set({ isCartOpen: open }),
  setIsCheckoutOpen: (open) => set({ isCheckoutOpen: open }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setActiveOrderForTracking: (order) => set({ activeOrderForTracking: order }),

  // Auth methods
  initializeAuth: async () => {
    const token = localStorage.getItem('minimart_token');
    if (token) {
      try {
        const res = await authApi.getMe();
        set({ user: res.data, isAuthenticated: true });
        // Sync cart & wishlist from backend
        await get().syncCartFromBackend();
        await get().syncWishlistFromBackend();
      } catch (err) {
        localStorage.removeItem('minimart_token');
        localStorage.removeItem('minimart_refresh_token');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },

  login: async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      return await get()._completeAuthSession(res.data, 'Welcome back');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
      return false;
    }
  },

  register: async (userData) => {
    try {
      const res = await authApi.register(userData);
      return await get()._completeAuthSession(res.data, 'Welcome to MiniMart');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
      return false;
    }
  },

  googleLogin: async (credential) => {
    try {
      const res = await authApi.googleLogin(credential);
      return await get()._completeAuthSession(res.data, 'Signed in as');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Google Sign-In failed');
      return false;
    }
  },

  _completeAuthSession: async (tokenData, welcomePrefix) => {
    const token = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    localStorage.setItem('minimart_token', token);
    if (refreshToken) {
      localStorage.setItem('minimart_refresh_token', refreshToken);
    }
    set({ token, isAuthenticated: true, isAuthModalOpen: false });

    const userRes = await authApi.getMe();
    set({ user: userRes.data });
    toast.success(`${welcomePrefix}, ${userRes.data.full_name}!`);

    // Merge guest items if any
    const currentLocalCart = get().cart;
    if (currentLocalCart.length > 0) {
      try {
        await cartApi.merge(currentLocalCart.map(i => ({
          product_id: i.productId || i.id,
          quantity: i.quantity
        })));
      } catch (mergeErr) {
        console.error('Cart merge error after auth:', mergeErr);
      }
    }

    await get().syncCartFromBackend();
    await get().syncWishlistFromBackend();
    return true;
  },

  logout: () => {
    localStorage.removeItem('minimart_token');
    localStorage.removeItem('minimart_refresh_token');
    set({ user: null, token: null, isAuthenticated: false, cart: [], wishlist: [] });
    saveLocalCart([]);
    try {
      localStorage.removeItem('minimart_wishlist');
    } catch {}
    toast.success('Logged out successfully');
  },

  quickDemoLogin: async (role = 'customer') => {
    const creds = role === 'admin' 
      ? { email: 'admin@minimart.com', pass: 'admin123' }
      : { email: 'demo@minimart.com', pass: 'customer123' };
    return await get().login(creds.email, creds.pass);
  },

  // Cart methods
  syncCartFromBackend: async () => {
    if (!get().isAuthenticated) return;
    try {
      const res = await cartApi.get();
      const backendItems = res.data.map(item => ({
        id: item.id, // CartItem database ID
        cartItemId: item.id,
        productId: item.product_id,
        name: item.product.name,
        price: item.product.price,
        original_price: item.product.original_price,
        unit: item.product.unit,
        image_url: item.product.image_url,
        quantity: item.quantity,
      }));
      set({ cart: backendItems });
      saveLocalCart(backendItems);
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  },

  addToCart: async (product, quantity = 1) => {
    const { cart, isAuthenticated } = get();
    const existingIndex = cart.findIndex(item => (item.productId || item.id) === product.id);

    let updatedCart;
    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      const newItem = {
        id: product.id,
        cartItemId: null,
        productId: product.id,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        unit: product.unit,
        image_url: product.image_url,
        quantity: quantity,
      };
      updatedCart = [...cart, newItem];
    }

    set({ cart: updatedCart });
    saveLocalCart(updatedCart);
    playChime('add');
    toast.success(`Added ${product.name} to cart!`, { duration: 1500 });

    if (isAuthenticated) {
      try {
        const res = await cartApi.add(product.id, quantity);
        if (res.data && res.data.id) {
          const finalCart = get().cart.map(item =>
            (item.productId || item.id) === product.id
              ? { ...item, id: res.data.id, cartItemId: res.data.id }
              : item
          );
          set({ cart: finalCart });
          saveLocalCart(finalCart);
        }
      } catch (e) {
        console.error('Backend cart sync error:', e);
      }
    }
  },

  updateQuantity: async (productId, quantity) => {
    const { cart, isAuthenticated } = get();
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      (item.productId || item.id) === productId ? { ...item, quantity } : item
    );

    set({ cart: updatedCart });
    saveLocalCart(updatedCart);

    if (isAuthenticated) {
      const item = cart.find(i => (i.productId || i.id) === productId);
      const targetCartItemId = item?.cartItemId || (item && item.cartItemId !== undefined && item.cartItemId !== null ? item.cartItemId : item?.id);
      if (targetCartItemId) {
        try {
          await cartApi.update(targetCartItemId, quantity);
        } catch (e) {
          console.error(e);
        }
      }
    }
  },

  removeFromCart: async (productId) => {
    const { cart, isAuthenticated } = get();
    const itemToRemove = cart.find(i => (i.productId || i.id) === productId);
    const updatedCart = cart.filter(item => (item.productId || item.id) !== productId);

    set({ cart: updatedCart });
    saveLocalCart(updatedCart);
    toast.success('Item removed from cart', { duration: 1200 });

    if (isAuthenticated && itemToRemove) {
      const targetCartItemId = itemToRemove.cartItemId || itemToRemove.id;
      if (targetCartItemId) {
        try {
          await cartApi.remove(targetCartItemId);
        } catch (e) {
          console.error(e);
        }
      }
    }
  },

  clearCart: async () => {
    set({ cart: [] });
    saveLocalCart([]);
    if (get().isAuthenticated) {
      try {
        await cartApi.clear();
      } catch (e) {
        console.error(e);
      }
    }
  },

  getCartCount: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },

  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  // Wishlist methods
  syncWishlistFromBackend: async () => {
    if (!get().isAuthenticated) return;
    try {
      const res = await userApi.getWishlist();
      const ids = res.data.map(item => item.product_id);
      set({ wishlist: ids });
      localStorage.setItem('minimart_wishlist', JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to sync wishlist from backend:', e);
    }
  },

  toggleWishlist: async (productId) => {
    const { wishlist, isAuthenticated } = get();
    const exists = wishlist.includes(productId);
    const next = exists ? wishlist.filter(id => id !== productId) : [...wishlist, productId];
    set({ wishlist: next });
    try {
      localStorage.setItem('minimart_wishlist', JSON.stringify(next));
    } catch {}

    toast(exists ? 'Removed from saved items' : 'Saved to favorites ❤️', { duration: 1500 });

    if (isAuthenticated) {
      try {
        await userApi.toggleWishlist(productId);
      } catch (e) {
        console.error('Wishlist sync error:', e);
      }
    }
  }
}));

