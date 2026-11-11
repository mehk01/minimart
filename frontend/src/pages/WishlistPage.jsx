import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { productsApi, userApi } from '../api';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Heart,
  ShoppingCart,
  ArrowRight
} from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, addToCart, isAuthenticated } = useStore();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        if (isAuthenticated) {
          const res = await userApi.getWishlist();
          const items = res.data.map(item => item.product).filter(Boolean);
          setFavoriteProducts(items);
        } else {
          const res = await productsApi.getAll({ limit: 100 });
          const allItems = res.data.items || (Array.isArray(res.data) ? res.data : []);
          const filtered = allItems.filter(p => wishlist.includes(p.id));
          setFavoriteProducts(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [wishlist, isAuthenticated]);

  const handleAddAllToCart = () => {
    if (favoriteProducts.length === 0) return;
    favoriteProducts.forEach(product => {
      addToCart(product, 1);
    });
    toast.success(`Added ${favoriteProducts.length} items to your basket!`);
  };

  return (
    <div className="space-y-6 pb-4 md:pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shadow-sm flex-shrink-0">
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              My Saved Favorites
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your frequently purchased weekly staples and saved produce for fast reordering.
          </p>
        </div>

        {favoriteProducts.length > 0 && (
          <button
            onClick={handleAddAllToCart}
            className="btn btn-primary text-xs py-2.5 px-5 rounded-full font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 self-start sm:self-auto active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add All ({favoriteProducts.length}) to Basket</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="product-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl h-64 animate-pulse p-4"></div>
          ))}
        </div>
      ) : favoriteProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-14 text-center space-y-3 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-2 border border-red-100 shadow-inner">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 font-heading">No favorite items saved yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Click the heart icon on any product card across MiniMart to save it here for fast 1-click reorders.
          </p>
          <Link to="/" className="btn btn-primary text-xs py-2.5 px-6 rounded-full inline-flex items-center gap-1.5 mt-3 shadow-sm">
            <span>Explore Fresh Groceries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
