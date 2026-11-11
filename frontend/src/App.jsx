import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import LocationModal from './components/LocationModal';

import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import DealsPage from './pages/DealsPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const { initializeAuth } = useStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative">
        
        {/* Apple Liquid Glass Ambient Light Mesh Orbs */}
        <div className="liquid-mesh-bg print:hidden" aria-hidden="true">
          <div className="liquid-orb w-[600px] h-[600px] bg-gradient-to-br from-blue-400/35 to-sky-300/30 -top-48 -left-24"></div>
          <div className="liquid-orb w-[540px] h-[540px] bg-gradient-to-br from-emerald-300/30 to-teal-200/25 top-72 -right-20" style={{ animationDelay: '-6s' }}></div>
          <div className="liquid-orb w-[650px] h-[650px] bg-gradient-to-br from-indigo-300/25 to-blue-300/25 top-[850px] -left-36" style={{ animationDelay: '-12s' }}></div>
          <div className="liquid-orb w-[480px] h-[480px] bg-gradient-to-br from-amber-300/25 to-orange-200/20 top-[1500px] right-10" style={{ animationDelay: '-4s' }}></div>
        </div>

        {/* Main Sticky Header */}
        <Header />

        {/* Content Container */}
        <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 main-content-safe relative z-10 print:p-0 print:m-0 print:max-w-none">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/tracking/:orderId" element={<OrderTrackingPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="hidden md:block bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-400 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="MiniMart" className="h-9 sm:h-10 w-auto object-contain" />
              <span>© {new Date().getFullYear()} MiniMart Inc. 15-Minute Hyperlocal Groceries.</span>
            </div>
            <div className="flex gap-6 text-slate-500 font-medium">
              <a href="#" className="hover:text-blue-600">Farm Partners</a>
              <a href="#" className="hover:text-blue-600">Cold Chain Quality</a>
              <a href="#" className="hover:text-blue-600">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600">Help & Support</a>
            </div>
          </div>
        </footer>

        {/* Mobile bottom navigation */}
        <BottomNav />

        {/* Floating Modals & Drawers */}
        <ProductModal />
        <CartDrawer />
        <CheckoutModal />
        <AuthModal />
        <LocationModal />

        {/* Global Toast notifications */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 600,
              padding: '10px 16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            },
          }}
        />

      </div>
    </BrowserRouter>
  );
}
