import React, { useState } from 'react';
import { useStore } from '../store';
import { formatINR, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from '../utils/currency';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  X,
  Truck,
  CheckCircle2,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    setIsCheckoutOpen
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // decimal 0.20 for 20%
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  if (!isCartOpen) return null;

  const subtotal = getCartTotal();
  const freeDeliveryThreshold = FREE_DELIVERY_THRESHOLD;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0.0 : STANDARD_DELIVERY_FEE;
  const discountAmount = isCouponApplied ? subtotal * appliedDiscount : 0.0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'SAVE20') {
      setIsCouponApplied(true);
      setAppliedDiscount(0.20);
      toast.success('Promo code SAVE20 applied: 20% discount!');
    } else {
      toast.error('Invalid coupon code. Try SAVE20');
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md liquid-glass-drawer flex flex-col justify-between animate-fade-in safe-bottom">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/60 flex items-center justify-between bg-white/40 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">Your Basket</h2>
              <span className="bg-blue-100/80 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                {getCartCount()} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors active:scale-95"
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-3.5 border-b border-white/60 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              {amountToFreeDelivery > 0 ? (
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  Add <strong className="text-blue-700">{formatINR(amountToFreeDelivery)}</strong> for FREE Delivery!
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  You unlocked <strong>FREE Delivery!</strong>
                </span>
              )}
              <span className="text-blue-700 font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-inner">
                  <ShoppingBag className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-700">Your basket is empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Looks like you haven't added any fresh groceries to your cart yet.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 btn btn-primary text-xs py-2.5 px-6 rounded-full"
                >
                  Explore Fresh Aisles
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId || item.id} className="py-3.5 flex items-center gap-3 group">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 block">{item.unit || 'piece'}</span>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-extrabold text-blue-700">
                        {formatINR(item.price * item.quantity)}
                      </span>

                      {/* Stepper controls */}
                      <div className="qty-stepper">
                        <button
                          onClick={() => updateQuantity(item.productId || item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId || item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId || item.id)}
                    className="text-slate-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer with promo and checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-white/70 bg-white/60 backdrop-blur-xl space-y-3.5">
              
              {/* Promo input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (try SAVE20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={isCouponApplied}
                  className="flex-1 liquid-glass-input text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none uppercase placeholder:normal-case shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isCouponApplied || !couponCode}
                  className="btn btn-secondary text-xs px-4 py-2 rounded-xl font-bold disabled:opacity-50"
                >
                  {isCouponApplied ? (
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Applied
                    </span>
                  ) : (
                    'Apply'
                  )}
                </button>
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatINR(deliveryFee)}</span>
                </div>
                {isCouponApplied && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount (20% off)</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Estimated Total</span>
                  <span className="text-base text-blue-700 font-heading">{formatINR(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedCheckout}
                className="w-full btn btn-primary py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 py-0.5"
              >
                Clear all items
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
