import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('minimart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-handle 401 token expiry with refresh attempt
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('minimart_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refresh_token: refreshToken });
          const newAccessToken = res.data.access_token;
          const newRefreshToken = res.data.refresh_token;
          localStorage.setItem('minimart_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('minimart_refresh_token', newRefreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('minimart_token');
          localStorage.removeItem('minimart_refresh_token');
        }
      } else {
        localStorage.removeItem('minimart_token');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getFeatured: (limit = 10) => api.get('/products/featured', { params: { limit } }),
  getDeals: (limit = 10) => api.get('/products/deals', { params: { limit } }),
  getById: (idOrSlug) => api.get(`/products/${idOrSlug}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart', { product_id: productId, quantity }),
  merge: (items) => api.post('/cart/merge', items),
  update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
};

export const ordersApi = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  updateStatus: (orderId, newStatus) => api.patch(`/orders/${orderId}/status?new_status=${newStatus}`),
};

export const userApi = {
  getAddresses: () => api.get('/user/addresses'),
  addAddress: (addressData) => api.post('/user/addresses', addressData),
  updateAddress: (addressId, addressData) => api.put(`/user/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => api.delete(`/user/addresses/${addressId}`),
  getWishlist: () => api.get('/user/wishlist'),
  toggleWishlist: (productId) => api.post(`/user/wishlist/${productId}`),
};

export const reviewsApi = {
  getForProduct: (productId) => api.get(`/products/${productId}/reviews`),
  create: (productId, reviewData) => api.post(`/products/${productId}/reviews`, reviewData),
};

export default api;

