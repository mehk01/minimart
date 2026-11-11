import React from 'react';
import { useStore } from '../store';
import { playChime } from '../utils/effects';
import { formatINR } from '../utils/currency';
import { Heart, Star, Plus, Minus } from 'lucide-react';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, setSelectedProduct, wishlist, toggleWishlist } = useStore();

  const cartItem = cart.find(item => (item.productId || item.id) === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlist.includes(product.id);

  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAdd = () => {
    addToCart(product, 1);
    playChime('add');
  };

  return (
    <div className="product-card liquid-glass-card group rounded-2xl overflow-hidden flex flex-col justify-between min-w-0 w-full h-full">
      
      {/* Top Media Area */}
      <div className="relative overflow-hidden bg-slate-100/60 cursor-pointer" onClick={() => setSelectedProduct(product)}>
        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-col gap-1 items-start">
          {discountPercent > 0 && (
            <span className="badge badge-sale shadow-sm font-extrabold text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full border border-red-200">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && !discountPercent && (
            <span className="badge badge-featured shadow-sm font-bold text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-200">
              Popular
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-sm border ${
            isWishlisted
              ? 'bg-red-50 text-red-500 border-red-200 shadow-red-500/20'
              : 'bg-white/85 text-slate-400 border-white/80 hover:text-red-500 hover:bg-white'
          } active:scale-90`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isWishlisted ? 'fill-red-500 text-red-500 scale-105' : 'text-slate-400'}`} />
        </button>

        {/* Product Image */}
        <div className="product-image-wrap bg-slate-100 flex items-center justify-center">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </div>
      </div>

      {/* Info Body */}
      <div className="p-2.5 min-[375px]:p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-2.5 min-w-0">
        
        <div className="min-w-0">
          {/* Unit / Weight */}
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block uppercase tracking-wider truncate">
            {product.unit || 'Each'}
          </span>

          {/* Title */}
          <h3
            onClick={() => setSelectedProduct(product)}
            className="text-[13px] sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug hover:text-blue-600 transition-colors cursor-pointer mt-0.5 font-heading break-words"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
            <span className="font-extrabold text-slate-700 text-[11px] sm:text-xs">{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
            <span className="text-slate-400 text-[10px] sm:text-[11px]">({product.review_count || 42})</span>
          </div>
        </div>

        {/* Bottom Price & Add Controls */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 min-w-0">
          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5 min-w-0">
              <span className="text-sm min-[375px]:text-base sm:text-lg font-extrabold text-slate-900 font-heading leading-tight whitespace-nowrap">
                {formatINR(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through leading-tight whitespace-nowrap">
                  {formatINR(product.original_price)}
                </span>
              )}
            </div>
          </div>

          {/* Stepper or Add Button */}
          {quantityInCart > 0 ? (
            <div className="qty-stepper flex-shrink-0">
              <button
                onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <span>{quantityInCart}</span>
              <button
                onClick={handleAdd}
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-1 sm:gap-1.5 btn-primary text-white font-extrabold text-[11px] sm:text-xs py-1.5 px-2.5 min-[375px]:px-3 sm:px-3.5 rounded-full shadow-sm active:scale-95 transition-all flex-shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
