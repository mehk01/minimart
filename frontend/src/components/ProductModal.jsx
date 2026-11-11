import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { reviewsApi } from '../api';
import { formatINR } from '../utils/currency';
import toast from 'react-hot-toast';
import {
  X,
  Star,
  ShieldCheck,
  Zap,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight
} from 'lucide-react';

export default function ProductModal() {
  const { selectedProduct, setSelectedProduct, addToCart, cart, setIsCartOpen, isAuthenticated, setIsAuthModalOpen } = useStore();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'nutrition' | 'reviews'
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState('');
  const [reviewsList, setReviewsList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (selectedProduct && activeTab === 'reviews') {
      setLoadingReviews(true);
      reviewsApi.getForProduct(selectedProduct.id)
        .then(res => setReviewsList(res.data))
        .catch(() => setReviewsList([]))
        .finally(() => setLoadingReviews(false));
    }
  }, [selectedProduct, activeTab]);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const cartItem = cart.find(item => (item.productId || item.id) === product.id);
  const alreadyInCart = cartItem ? cartItem.quantity : 0;

  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAdd = () => {
    addToCart(product, qty);
    setSelectedProduct(null);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!userReview.trim()) return;
    if (!isAuthenticated) {
      toast.error('Please sign in to write a review');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const res = await reviewsApi.create(product.id, {
        rating: userRating,
        comment: userReview
      });
      setReviewsList([res.data, ...reviewsList]);
      setUserReview('');
      toast.success('Thank you for your verified review!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
      <div
        className="liquid-glass-modal w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full liquid-glass hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-sm active:scale-95"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Left Column */}
        <div className="w-full md:w-1/2 bg-slate-50/60 backdrop-blur-md relative flex items-center justify-center p-6 md:p-8 flex-shrink-0">
          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 z-10 badge badge-sale text-xs px-2.5 py-1 rounded-full font-extrabold shadow-sm border border-red-200">
              Save {discountPercent}%
            </span>
          )}
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-sm"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </div>

        {/* Details Right Column */}
        <div className="w-full md:w-1/2 p-6 md:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-600 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                {product.unit || '1 each'}
              </span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                In Stock ({product.stock || 35} left)
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 mt-1 font-heading">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-extrabold text-slate-700">{product.rating || '4.9'}</span>
              <span className="text-xs text-slate-400 font-medium">({reviewsList.length + 38} reviews)</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-2.5 mt-3">
              <span className="text-2xl font-extrabold text-blue-700 font-heading">
                {formatINR(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  {formatINR(product.original_price)}
                </span>
              )}
            </div>

            {/* Sub-tabs: Overview | Nutrition | Reviews */}
            <div className="flex border-b border-slate-200/80 gap-4 mt-3 mb-3 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`pb-1.5 transition-colors ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('nutrition')}
                className={`pb-1.5 transition-colors ${
                  activeTab === 'nutrition'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Nutrition
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`pb-1.5 transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Reviews ({reviewsList.length})
              </button>
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {product.description || 'Farm-fresh premium quality grocery item, handpicked and cold-packed to guarantee maximum freshness upon arrival.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700 font-semibold">
                  <div className="flex items-center gap-1.5 liquid-glass p-2 rounded-xl shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>100% Guaranteed Fresh</span>
                  </div>
                  <div className="flex items-center gap-1.5 liquid-glass p-2 rounded-xl shadow-sm">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 flex-shrink-0" />
                    <span>15-min Cold Delivery</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Nutrition */}
            {activeTab === 'nutrition' && (
              <div className="space-y-2 animate-fade-in text-xs text-slate-600">
                <div className="liquid-glass rounded-xl p-3 space-y-1.5 shadow-sm">
                  <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200/80 pb-1">
                    <span>Serving Size:</span>
                    <span>100g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-semibold text-slate-800">160 kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Protein:</span>
                    <span className="font-semibold text-slate-800">4.5g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Healthy Fats:</span>
                    <span className="font-semibold text-slate-800">14.7g (Omega-3)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dietary Fiber:</span>
                    <span className="font-semibold text-slate-800">6.7g</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-3 animate-fade-in">
                {/* Submit review */}
                <form onSubmit={handleReviewSubmit} className="space-y-2 liquid-glass p-3 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">Rate this item:</span>
                    <div className="flex gap-0.5 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="p-0.5 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= userRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Share your thoughts on freshness..."
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white/80 backdrop-blur border border-white/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary text-xs py-1.5 px-3 rounded-xl font-bold w-full shadow-sm"
                  >
                    Post Verified Review
                  </button>
                </form>

                {/* Review Items */}
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {loadingReviews ? (
                    <p className="text-xs text-slate-400 text-center py-2">Loading reviews...</p>
                  ) : reviewsList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">No reviews yet. Be the first to rate this produce!</p>
                  ) : (
                    reviewsList.map((rev) => (
                      <div key={rev.id} className="text-xs p-2.5 rounded-xl liquid-glass shadow-sm">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>{rev.user?.full_name || rev.author || 'Verified Shopper'}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(rev.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Action Row */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-3">
            <div className="qty-stepper">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span>{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 btn btn-primary py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Basket • {formatINR(product.price * qty)}</span>
            </button>
          </div>

          {alreadyInCart > 0 && (
            <div className="mt-2 text-center">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setIsCartOpen(true);
                }}
                className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Already have {alreadyInCart} in your cart • View Cart</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
