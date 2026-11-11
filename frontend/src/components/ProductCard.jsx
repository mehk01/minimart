import React from 'react';
import { useStore } from '../store';
import { playChime } from '../utils/effects';
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
    <div className="product-card liquid-glass-card group rounded-2xl overflow-hidden flex flex-col justify-between">
      
      {/* Top Media Area */}
      <div className="relative overflow-hidden bg-slate-100/60 cursor-pointer" onClick={() => setSelectedProduct(product)}>
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {discountPercent > 0 && (
            <span className="badge badge-sale shadow-sm font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-red-200">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && !discountPercent && (
            <span className="badge badge-featured shadow-sm font-bold text-[10px] px-2 py-0.5 rounded-full border border-blue-200">
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
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-sm border ${
            isWishlisted
              ? 'bg-red-50 text-red-500 border-red-200 shadow-red-500/20'
              : 'bg-white/85 text-slate-400 border-white/80 hover:text-red-500 hover:bg-white'
          } active:scale-90`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 transition-transform ${isWishlisted ? 'fill-red-500 text-red-500 scale-105' : 'text-slate-400'}`} />
        </button>

        {/* Product Image */}
        <div className="aspect-square w-full overflow-hidden bg-slate-100 flex items-center justify-center">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </div>
      </div>

      {/* Info Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        
        <div>
          {/* Unit / Weight */}
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            {product.unit || 'Each'}
          </span>

          {/* Title */}
          <h3
            onClick={() => setSelectedProduct(product)}
            className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer mt-0.5 font-heading"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-extrabold text-slate-700">{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
            <span className="text-slate-400 text-[11px]">({product.review_count || 42})</span>
          </div>
        </div>

        {/* Bottom Price & Add Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 font-heading">
                ${product.price.toFixed(2)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Stepper or Add Button */}
          {quantityInCart > 0 ? (
            <div className="qty-stepper">
              <button
                onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span>{quantityInCart}</span>
              <button
                onClick={handleAdd}
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-1.5 btn-primary text-white font-extrabold text-xs py-1.5 px-3.5 rounded-full shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
