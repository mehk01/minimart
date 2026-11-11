import React, { useState, useEffect } from 'react';
import { ordersApi } from '../api';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Package,
  Truck,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function OrdersPage() {
  const { isAuthenticated, setIsAuthModalOpen, quickDemoLogin } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await ordersApi.getAll();
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="liquid-glass-card p-8 rounded-3xl space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/80 shadow-sm">
            <Receipt className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">Track Your Orders</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sign in to view your past orders, active deliveries, and receipts.
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => quickDemoLogin('customer')}
              className="btn btn-primary py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-blue-600/25"
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              <span>Login as Demo Shopper</span>
            </button>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn btn-secondary py-3 rounded-2xl font-bold text-xs"
            >
              Sign In with Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50/80 text-blue-600 flex items-center justify-center border border-blue-200/80 shadow-sm">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">My Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review recent grocery deliveries and real-time status.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="liquid-glass-card rounded-3xl h-44 animate-pulse p-6"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="liquid-glass-card rounded-3xl p-8 sm:p-12 text-center space-y-3 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-slate-100/80 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-heading">No orders placed yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Your shopping bags are waiting! Explore our farm-fresh aisles and place your first order.
          </p>
          <Link to="/" className="btn btn-primary text-xs py-2.5 px-6 rounded-full inline-flex items-center gap-1.5 mt-3 shadow-sm">
            <span>Start Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="liquid-glass-card rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all space-y-4"
            >
              {/* Order Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                    {order.order_number}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Status chip */}
                <span className="badge badge-fresh text-xs font-bold py-1 px-3 rounded-full uppercase border border-emerald-200">
                  {order.status}
                </span>
              </div>

              {/* Order items preview */}
              <div className="divide-y divide-slate-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 truncate max-w-[280px] sm:max-w-md">
                      <img
                        src={item.product?.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=80&q=80'}
                        alt={item.product?.name}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{item.product?.name}</p>
                        <p className="text-[10px] text-slate-400">Qty: {item.quantity} • ${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 font-heading">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom totals */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500 font-medium">
                    Payment: <strong>{order.payment_method?.replace('_', ' ').toUpperCase() || 'COD'}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <Link
                    to={`/tracking/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50/90 hover:bg-blue-100 px-3.5 py-1.5 rounded-full border border-blue-200 transition-all shadow-sm active:scale-95"
                  >
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Track Delivery</span>
                  </Link>
                  <Link
                    to={`/tracking/${order.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full border border-slate-200 transition-all shadow-sm active:scale-95"
                    title="View & Download Official Invoice"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-600" />
                    <span>Invoice (PDF)</span>
                  </Link>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 mr-2">Total Paid:</span>
                  <span className="text-base font-extrabold text-blue-700 font-heading">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
