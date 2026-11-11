import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ordersApi, userApi } from '../api';
import { formatINR, FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE, EXPRESS_DELIVERY_FEE } from '../utils/currency';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { triggerConfetti, playChime } from '../utils/effects';
import {
  X,
  CheckCircle2,
  Zap,
  Check,
  Package,
  Truck,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    getCartTotal,
    isAuthenticated,
    quickDemoLogin,
    setActiveOrderForTracking
  } = useStore();

  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [deliverySpeed, setDeliverySpeed] = useState('express');
  const [address, setAddress] = useState('742 Evergreen Terrace, Apt 4B, Springfield, IL 62704');
  const [deliveryNotes, setDeliveryNotes] = useState('Leave with doorman or ring doorbell.');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      userApi.getAddresses()
        .then(res => {
          const def = res.data.find(a => a.is_default) || res.data[0];
          if (def) {
            setSelectedAddressId(def.id);
            setAddress(`${def.full_address}, ${def.city}, ${def.state} ${def.zip_code}`);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (!isCheckoutOpen) return null;

  const subtotal = getCartTotal();
  const isFreeDeliveryCoupon = appliedCoupon.toUpperCase() === 'FREEDELIVERY';
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD || isFreeDeliveryCoupon
    ? 0.0
    : (deliverySpeed === 'express' ? EXPRESS_DELIVERY_FEE : STANDARD_DELIVERY_FEE);
  const discountAmount = appliedCoupon.toUpperCase() === 'SAVE20' ? subtotal * 0.20 : 0.0;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (code === 'SAVE20') {
      setAppliedCoupon('SAVE20');
      toast.success('Code SAVE20 applied: 20% discount!');
    } else if (code === 'FREEDELIVERY') {
      setAppliedCoupon('FREEDELIVERY');
      toast.success('Code FREEDELIVERY applied: Free delivery!');
    } else {
      toast.error('Invalid coupon code. Try SAVE20 or FREEDELIVERY');
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in or use Demo Shopper to complete your order');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your basket is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        payment_method: paymentMethod,
        address_id: selectedAddressId,
        coupon_code: appliedCoupon || null,
        notes: `${deliverySpeed.toUpperCase()} Delivery. ${deliveryNotes} | Destination: ${address}`,
      };
      const res = await ordersApi.create(orderPayload);
      setPlacedOrder(res.data);
      setActiveOrderForTracking(res.data);
      clearCart();
      triggerConfetti();
      playChime('success');
      toast.success('Order created successfully!');
    } catch (err) {
      console.error('Order creation error:', err);
      toast.error(err.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setPlacedOrder(null);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="liquid-glass-modal w-full max-w-xl rounded-3xl overflow-x-hidden overflow-y-auto p-4 sm:p-8 animate-fade-in relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors active:scale-95"
          aria-label="Close checkout"
        >
          <X className="w-4 h-4" />
        </button>

        {placedOrder ? (
          /* Order Confirmation Screen */
          <div className="text-center py-6 animate-fade-in space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              Order Placed Successfully!
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your fresh groceries have been received and our personal shopper is carefully handpicking your items now.
            </p>

            <div className="liquid-glass rounded-2xl p-4 border border-white/80 text-left max-w-md mx-auto space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-blue-700">{placedOrder.order_number}</span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className="text-slate-500">Estimated Delivery:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  15-25 minutes
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-extrabold text-slate-900 font-heading">{formatINR(placedOrder.total ?? total)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Deliver To:</span>
                <span className="text-slate-700 truncate max-w-[200px] font-medium">{address}</span>
              </div>
            </div>

            {/* Hardware Stepper */}
            <div className="py-4 max-w-md mx-auto">
              <div className="flex items-center justify-between relative">
                <div className="flex flex-col items-center z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md border border-white/40">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-1.5">Confirmed</span>
                </div>
                <div className="flex-1 h-1 bg-emerald-500 -mt-3 mx-1"></div>
                <div className="flex flex-col items-center z-10">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md animate-pulse border border-white/40">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 mt-1.5">Packing</span>
                </div>
                <div className="flex-1 h-1 bg-slate-200 -mt-3 mx-1"></div>
                <div className="flex flex-col items-center z-10">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5 font-semibold">On the way</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full max-w-sm mx-auto">
              <button
                onClick={() => {
                  handleClose();
                  navigate(`/tracking/${placedOrder.id || placedOrder.order_number}`);
                }}
                className="btn btn-primary w-full py-3 rounded-2xl font-extrabold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Track Live 15-Min Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleClose}
                className="btn btn-secondary w-full py-2.5 rounded-2xl font-bold text-xs"
              >
                Back to Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">Instant Checkout</h2>
            </div>

            {/* If user is guest, show 1-click login hint */}
            {!isAuthenticated && (
              <div className="mb-5 p-3 sm:p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-blue-950">Quick 1-Click Checkout</p>
                  <p className="text-[11px] text-blue-700">Login instantly as our test customer</p>
                </div>
                <button
                  type="button"
                  onClick={() => quickDemoLogin('customer')}
                  className="btn btn-primary text-xs py-1.5 px-3.5 rounded-full flex items-center gap-1 shadow-sm flex-shrink-0 whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Auto-Login</span>
                </button>
              </div>
            )}

            <div className="space-y-5">
              
              {/* Delivery Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              {/* Delivery Speed */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Delivery Speed
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 relative">
                  {[
                    { id: 'express', label: 'Express Rush', time: '15 - 20 mins', icon: Zap, iconBg: 'bg-blue-100 text-blue-600', fill: true },
                    { id: 'standard', label: 'Standard', time: '35 - 45 mins', icon: Truck, iconBg: 'bg-slate-100 text-slate-600', fill: false },
                  ].map((speed) => {
                    const isSelected = deliverySpeed === speed.id;
                    const Icon = speed.icon;
                    return (
                      <button
                        key={speed.id}
                        type="button"
                        onClick={() => setDeliverySpeed(speed.id)}
                        className={`relative p-2.5 sm:p-3 rounded-2xl border text-left flex items-start gap-2 sm:gap-2.5 min-w-0 transition-colors duration-250 ease-out z-10 cursor-pointer ${
                          isSelected
                            ? 'border-blue-600'
                            : 'border-white/80 liquid-glass hover:bg-white'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeDeliverySpeedPill"
                            className="absolute inset-0 bg-blue-50/85 border-2 border-blue-600 rounded-2xl ring-2 ring-blue-600/20 shadow-sm -z-10"
                            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                          />
                        )}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${speed.iconBg}`}>
                          <Icon className={`w-4 h-4 ${speed.fill ? 'fill-blue-600 text-blue-600' : ''}`} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold transition-colors leading-tight ${isSelected ? 'text-blue-950 font-extrabold' : 'text-slate-900'}`}>{speed.label}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{speed.time}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 p-3 liquid-glass hover:bg-white rounded-xl border border-white/80 cursor-pointer transition-colors shadow-sm">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="accent-blue-600 flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                        <Banknote className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Cash on Delivery</span>
                    </div>
                    <span className="text-[11px] text-slate-400 ml-auto flex-shrink-0">Pay upon arrival</span>
                  </label>

                  <label className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 p-3 liquid-glass hover:bg-white rounded-xl border border-white/80 cursor-pointer transition-colors shadow-sm">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-blue-600 flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Credit / Debit Card</span>
                    </div>
                    <span className="text-[11px] text-slate-400 ml-auto flex-shrink-0">Visa •••• 4242</span>
                  </label>

                  <label className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'minimart_pay'}
                      onChange={() => setPaymentMethod('minimart_pay')}
                      className="accent-blue-600 flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                        <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">MiniMart 1-Tap Pay / Apple Pay</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold ml-auto flex-shrink-0">Instant Checkout</span>
                  </label>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Leave on doorstep, gate code #1234"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              {/* Promo Coupon Code */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. SAVE20 or FREEDELIVERY"
                    className="flex-1 min-w-0 text-xs px-3 sm:px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 uppercase font-mono shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="btn btn-secondary text-xs px-3.5 sm:px-4 py-2 rounded-xl font-bold flex-shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Applied: {appliedCoupon}
                  </p>
                )}
              </div>

              {/* Order Summary Recap */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Basket Total ({cart.length} items)</span>
                  <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatINR(deliveryFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="text-base text-blue-700 font-heading">{formatINR(total)}</span>
                </div>
              </div>

              {/* CTA button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full btn btn-primary py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <span>Placing Order...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Place Order • {formatINR(total)}</span>
                  </>
                )}
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
