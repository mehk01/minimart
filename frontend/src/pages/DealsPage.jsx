import React, { useState, useEffect } from 'react';
import { productsApi } from '../api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';
import { Flame, Tag, Copy, Truck, Check } from 'lucide-react';

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await productsApi.getDeals(20);
        setDeals(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success(`Copied "${code}" to clipboard!`);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Deals Header Banner */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 shadow-sm">
            <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span>Flash Deals & Promo Coupons</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Save Up to 35% on Fresh Picks
          </h1>
          <p className="text-xs sm:text-sm text-amber-50 font-medium leading-relaxed">
            Score limited-time discounts on organic fruits, wild salmon, artisan bread, and pantry favorites.
          </p>
        </div>
      </section>

      {/* Available Coupon Codes */}
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-900 font-heading">Active Promo Codes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <div className="liquid-glass-card border-amber-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-amber-900 text-sm tracking-wider bg-amber-100/90 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                    SAVE20
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600">20% OFF</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Save 20% on your entire basket at checkout.
                </p>
              </div>
            </div>
            <button
              onClick={() => copyCode('SAVE20')}
              className="btn btn-secondary text-xs py-1.5 px-3.5 rounded-full font-bold flex items-center gap-1 shadow-sm active:scale-95"
            >
              {copiedCode === 'SAVE20' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="liquid-glass-card border-blue-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-200 flex items-center justify-center text-blue-700 flex-shrink-0 mt-0.5">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-blue-900 text-sm tracking-wider bg-blue-100/90 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                    FREEDELIVERY
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600">FREE RUSH</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Free 15-min delivery automatically on orders over $35.
                </p>
              </div>
            </div>
            <button
              onClick={() => copyCode('FREEDELIVERY')}
              className="btn btn-secondary text-xs py-1.5 px-3.5 rounded-full font-bold flex items-center gap-1 shadow-sm active:scale-95"
            >
              {copiedCode === 'FREEDELIVERY' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

        </div>
      </section>

      {/* Discounted Products Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">Discounted Groceries</h2>
            <p className="text-xs text-slate-500">Prices slashed for maximum savings today</p>
          </div>
          <span className="text-xs font-bold text-slate-600 liquid-glass px-3 py-1 rounded-full border border-white/80 shadow-sm">
            {deals.length} items on sale
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl h-64 animate-pulse p-4"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
