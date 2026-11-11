import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import {
  Home,
  LayoutGrid,
  Flame,
  Heart,
  ShoppingCart,
  Receipt,
  User
} from 'lucide-react';

export default function BottomNav() {
  const { getCartCount, setIsCartOpen, isAuthenticated, setIsAuthModalOpen, wishlist } = useStore();
  const cartCount = getCartCount();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-30 md:hidden bg-white/85 backdrop-blur-2xl border-t border-white/80 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] safe-bottom safe-x print:hidden">
      <div className="flex justify-around items-center h-16 px-1.5 sm:px-2 gap-0.5 max-w-full">
        
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `relative flex-1 min-w-0 max-w-[68px] flex flex-col items-center justify-center gap-0.5 h-12 px-0.5 rounded-xl transition-colors duration-200 z-10 ${
              isActive ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          {location.pathname === '/' && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-blue-50/90 rounded-2xl -z-10 border border-blue-200/80 shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <Home className="w-[19px] h-[19px] flex-shrink-0" />
          <span className="text-[10px] leading-none tracking-tight truncate max-w-full">Home</span>
        </NavLink>

        {/* Categories */}
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `relative flex-1 min-w-0 max-w-[68px] flex flex-col items-center justify-center gap-0.5 h-12 px-0.5 rounded-xl transition-colors duration-200 z-10 ${
              isActive ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          {location.pathname === '/categories' && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-blue-50/90 rounded-2xl -z-10 border border-blue-200/80 shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <LayoutGrid className="w-[19px] h-[19px] flex-shrink-0" />
          <span className="text-[10px] leading-none tracking-tight truncate max-w-full">Aisles</span>
        </NavLink>

        {/* Deals */}
        <NavLink
          to="/deals"
          className={({ isActive }) =>
            `relative flex-1 min-w-0 max-w-[68px] flex flex-col items-center justify-center gap-0.5 h-12 px-0.5 rounded-xl transition-colors duration-200 z-10 ${
              isActive ? 'text-amber-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          {location.pathname === '/deals' && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-amber-50/90 rounded-2xl -z-10 border border-amber-200/80 shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <Flame className="w-[19px] h-[19px] flex-shrink-0" />
          <span className="text-[10px] leading-none tracking-tight truncate max-w-full">Deals</span>
        </NavLink>

        {/* Favorites */}
        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `relative flex-1 min-w-0 max-w-[68px] flex flex-col items-center justify-center gap-0.5 h-12 px-0.5 rounded-xl transition-colors duration-200 z-10 ${
              isActive ? 'text-red-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          {location.pathname === '/wishlist' && (
            <motion.div
              layoutId="activeBottomNavPill"
              className="absolute inset-0 bg-red-50/90 rounded-2xl -z-10 border border-red-200/80 shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
          <div className="relative flex-shrink-0">
            <Heart className="w-[19px] h-[19px]" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white font-extrabold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none shadow-sm">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-none tracking-tight truncate max-w-full">Saved</span>
        </NavLink>

        {/* Cart Trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex-1 min-w-0 max-w-[68px] flex flex-col items-center justify-center gap-0.5 h-12 px-0.5 text-slate-600 hover:text-blue-600 transition-colors"
        >
          <div className="relative flex-shrink-0">
            <ShoppingCart className="w-[19px] h-[19px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center leading-none ring-2 ring-white shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-none font-bold tracking-tight truncate max-w-full">Basket</span>
        </button>

        {/* Account / Orders */}
        {isAuthenticated ? (
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `relative flex-1 min-w-0 max-w-[68px] flex flex-col items-center justify-center gap-0.5 h-12 px-0.5 rounded-xl transition-colors duration-200 z-10 ${
                isActive ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            {location.pathname === '/orders' && (
              <motion.div
                layoutId="activeBottomNavPill"
                className="absolute inset-0 bg-blue-50/90 rounded-2xl -z-10 border border-blue-200/80 shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <Receipt className="w-[19px] h-[19px] flex-shrink-0" />
            <span className="text-[10px] leading-none tracking-tight truncate max-w-full">Orders</span>
          </NavLink>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex-1 min-w-0 max-w-[68px] flex flex-col items-center justify-center gap-0.5 h-12 px-0.5 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <User className="w-[19px] h-[19px] flex-shrink-0" />
            <span className="text-[10px] leading-none tracking-tight truncate max-w-full">Account</span>
          </button>
        )}

      </div>
    </nav>
  );
}
