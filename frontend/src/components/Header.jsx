import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { productsApi } from '../api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  X,
  MapPin,
  ChevronDown,
  Zap,
  Home,
  LayoutGrid,
  Flame,
  Heart,
  User,
  Receipt,
  Store,
  LogOut,
  TrendingUp,
  Package,
  Plus,
  ArrowRight
} from 'lucide-react';

export default function Header() {
  const {
    user,
    isAuthenticated,
    logout,
    setIsAuthModalOpen,
    setIsCartOpen,
    getCartCount,
    getCartTotal,
    searchQuery,
    setSearchQuery,
    quickDemoLogin,
    deliveryLocation,
    setIsLocationModalOpen,
    wishlist,
    addToCart,
    setSelectedProduct
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const mobileInputRef = useRef(null);
  const mobileButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const popularKeywords = [
    'Organic Avocados',
    'Whole Milk',
    'Sourdough Bread',
    'Strawberries',
    'Free-Range Eggs',
    'Greek Yogurt',
    'Dark Chocolate',
    'Sparkling Water'
  ];

  // Close search popup on click outside or ESC key
  useEffect(() => {
    function handleClickOutside(event) {
      const inDesktop = desktopSearchRef.current && desktopSearchRef.current.contains(event.target);
      const inMobile = mobileSearchRef.current && mobileSearchRef.current.contains(event.target);
      const inMobileBtn = mobileButtonRef.current && mobileButtonRef.current.contains(event.target);
      if (!inDesktop && !inMobile && !inMobileBtn) {
        setIsSearchFocused(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Live predictive search debounce (matching & relevant items)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setLiveSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const res = await productsApi.getAll({ search: searchQuery.trim(), limit: 6 });
        const items = res.data.items || (Array.isArray(res.data) ? res.data : []);
        setLiveSuggestions(items);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setIsSearchFocused(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSelectKeyword = (kw) => {
    setSearchQuery(kw);
    setIsSearchFocused(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  // Reusable Suggestions Dropdown (works on both mobile full-width & desktop)
  const renderSearchDropdown = () => (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 sm:p-5 z-50 animate-fade-in space-y-4 max-h-[75vh] overflow-y-auto w-full md:w-[380px] min-w-[280px]">
      {/* Live Exact & Closely Related Matching Products */}
      {searchQuery.trim().length >= 1 ? (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              <span>Exact & Relevant Matches</span>
            </span>
            {isSearchingLive && (
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          {liveSuggestions.length > 0 ? (
            <div className="space-y-1.5 mb-2">
              {liveSuggestions.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/50 transition-colors group cursor-pointer border border-transparent hover:border-blue-100"
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsSearchFocused(false);
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80'}
                      alt={product.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1508779018996-601e37fa274e?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {product.unit} • <span className="font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
                        {product.original_price && (
                          <span className="line-through text-slate-300 ml-1.5">${product.original_price.toFixed(2)}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, 1);
                      toast.success(`Added ${product.name} to basket!`);
                    }}
                    className="px-3.5 py-1.5 rounded-full btn-primary text-white font-bold text-[11px] transition-all flex items-center gap-1 flex-shrink-0 shadow-sm active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          ) : !isSearchingLive ? (
            <div className="py-4 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-600">No products matching "{searchQuery}"</p>
              <p className="text-[11px] text-slate-400">Try searching for broader terms like "milk", "fruits", "bread", or "snacks".</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Trending & Popular Searches */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
          <span>Trending Searches</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => handleSelectKeyword(kw)}
              className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 border border-slate-200/60 active:scale-95"
            >
              <Search className="w-3 h-3 text-slate-400" />
              <span>{kw}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Footer */}
      {searchQuery.trim() && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Press Enter to view full results</span>
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="text-blue-600 font-extrabold hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>Filter store for "{searchQuery}"</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Full-screen Background Blur Overlay when Search is Active */}
      {isSearchFocused && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md transition-opacity duration-200 animate-fade-in"
          onClick={() => setIsSearchFocused(false)}
          aria-label="Close search overlay"
        />
      )}

      <header className={`sticky top-0 transition-all print:hidden ${isSearchFocused ? 'z-50 bg-white/95 shadow-lg' : 'z-40 liquid-glass-header'}`}>
        {/* Top micro-announcement bar */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-white/10">
          <span className="bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Zap className="w-3 h-3 fill-slate-900 text-slate-900" />
            Flash Deal
          </span>
          <span>Use code <strong>SAVE20</strong> for 20% off your entire basket!</span>
          <span className="hidden sm:inline-flex items-center gap-1 opacity-90 text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded-full ml-1">
            <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
            Express 15-min delivery available
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* Main Top Navigation Row */}
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            
            {/* Brand Logo & Location Pill */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link to="/" className="flex items-center group flex-shrink-0" title="MiniMart - Fresh & Fast In Minutes">
                <img
                  src="/logo.png"
                  alt="MiniMart - Fresh & Fast In Minutes"
                  className="h-9 sm:h-11 w-auto max-w-[130px] sm:max-w-[160px] object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </Link>

              {/* Delivery Pin Pill (Compact on tablet, full on desktop) */}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                type="button"
                className="hidden sm:flex items-center gap-1.5 sm:gap-2 h-10 sm:h-11 liquid-glass px-3 sm:px-3.5 rounded-full text-xs font-medium text-slate-700 cursor-pointer border border-white/90 hover:bg-white active:scale-95 transition-all shadow-sm flex-shrink-0"
                title="Click to change delivery address"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-left leading-tight hidden lg:block">
                  <span className="text-slate-400 text-[10px] block font-semibold">{deliveryLocation.label || 'Deliver to'}:</span>
                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-[120px] block">{deliveryLocation.city}, {deliveryLocation.zip}</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                  {deliveryLocation.eta}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
              </button>
            </div>

            {/* Desktop Compact Search Bar (Hidden on Mobile < md) */}
            <div
              ref={desktopSearchRef}
              className={`hidden md:block w-48 lg:w-64 max-w-xs mx-2 lg:mx-3 transition-all duration-200 ${
                isSearchFocused ? 'relative z-50' : 'relative'
              }`}
            >
              <form onSubmit={handleSearchSubmit} className="relative flex items-center h-8 sm:h-9">
                <Search
                  className={`w-3.5 h-3.5 absolute left-2.5 pointer-events-none transition-colors ${
                    isSearchFocused ? 'text-blue-600 stroke-[2.5]' : 'text-slate-400'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onClick={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  className={`w-full h-full pl-8 pr-7 text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-medium rounded-full border outline-none focus:outline-none transition-all ${
                    isSearchFocused
                      ? 'bg-white border-blue-500 ring-4 ring-blue-500/20 shadow-lg'
                      : 'bg-slate-100/90 hover:bg-slate-100 border-slate-200/80 shadow-inner'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                    title="Clear search query"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </form>

              {/* Instant Search Suggestions Dropdown (Desktop) */}
              {isSearchFocused && renderSearchDropdown()}
            </div>

            {/* Actions: Navigation Links & User & Cart */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              
              {/* Mobile Search Button (< md): Compact, perfectly centered icon */}
              <button
                ref={mobileButtonRef}
                type="button"
                onClick={() => {
                  setIsSearchFocused(true);
                  setTimeout(() => mobileInputRef.current?.focus(), 80);
                }}
                className="md:hidden flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-blue-600 border border-slate-200/90 shadow-sm transition-all duration-200 active:scale-95 flex-shrink-0"
                aria-label="Search"
                title="Search"
              >
                <Search className="w-3.5 h-3.5 text-slate-600" />
              </button>
              
              {/* Apple Liquid Glass Capsule Navigation Bar (Desktop Only) with Fluid Sliding Pill */}
              <nav className="liquid-bar hidden xl:inline-flex items-center h-10 sm:h-11 relative p-1" aria-label="Main Navigation">
                {[
                  { to: '/', label: 'Home', icon: Home },
                  { to: '/categories', label: 'Aisles', icon: LayoutGrid },
                  { to: '/deals', label: 'Deals', icon: Flame, iconActive: 'text-white', iconIdle: 'text-amber-500 fill-amber-500' },
                  { to: '/wishlist', label: 'Saved', icon: Heart, iconActive: 'text-white fill-white', iconIdle: wishlist.length > 0 ? 'text-red-500 fill-red-500' : 'text-slate-400', badge: wishlist.length > 0 ? wishlist.length : null }
                ].map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 flex items-center gap-1.5 z-10 ${
                        isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeHeaderNavPill"
                          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md shadow-blue-500/25 -z-10"
                          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        />
                      )}
                      <item.icon className={`w-4 h-4 ${isActive ? (item.iconActive || 'text-white') : (item.iconIdle || 'text-slate-500')}`} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center leading-none ml-0.5 shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Profile or Login */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-11 px-2 sm:px-3 rounded-full hover:bg-slate-100 transition-colors text-slate-700 border border-transparent hover:border-slate-200"
                  >
                    <img
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user.full_name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-blue-500/30 shadow-sm"
                    />
                    <span className="hidden lg:block text-xs font-bold max-w-[100px] truncate text-slate-800">
                      {user.full_name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {user.role}
                        </span>
                      </div>
                      
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <Receipt className="w-4 h-4 text-slate-400" />
                        <span>My Orders & Tracking</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>My Favorites ({wishlist.length})</span>
                      </Link>

                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-indigo-700 hover:bg-indigo-50 font-medium"
                      >
                        <Store className="w-4 h-4 text-indigo-600" />
                        <span>Admin Store Manager</span>
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-medium text-left border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1 h-9 sm:h-11 px-2.5 sm:px-3 text-xs font-bold text-slate-700 hover:text-blue-600 rounded-full transition-colors hover:bg-slate-100 flex-shrink-0"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                  <button
                    onClick={() => quickDemoLogin('customer')}
                    className="hidden sm:inline-flex items-center gap-1.5 h-9 sm:h-11 text-xs font-bold text-blue-700 bg-blue-50/80 hover:bg-blue-100 px-3 rounded-full border border-blue-200 transition-all shadow-sm active:scale-95 flex-shrink-0"
                    title="Instant 1-click login as Demo Customer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                    <span>Demo</span>
                  </button>
                </div>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1.5 sm:gap-2 h-9 sm:h-11 btn-primary font-bold px-3 sm:px-4 rounded-full shadow-md shadow-blue-600/25 active:scale-95 transition-all flex-shrink-0"
                aria-label="View shopping cart"
              >
                <div className="relative flex items-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-amber-400 text-slate-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center leading-none ring-2 ring-blue-700 shadow-sm animate-bounce">
                      {getCartCount()}
                    </span>
                  )}
                </div>
                <span className="text-xs font-extrabold">
                  ${getCartTotal().toFixed(2)}
                </span>
              </button>

            </div>
          </div>

          {/* Active Mobile Search Row (< md): Compact, ONLY displayed when search is active/focused */}
          {isSearchFocused && (
            <div
              ref={mobileSearchRef}
              className="md:hidden pb-2.5 pt-1 px-0.5 relative z-50 animate-fade-in"
            >
              <form onSubmit={handleSearchSubmit} className="relative flex items-center h-8 sm:h-9 w-full gap-2">
                <div className="relative flex-1 flex items-center h-full">
                  <Search
                    className="w-3.5 h-3.5 absolute left-2.5 pointer-events-none text-blue-600 stroke-[2.5]"
                  />
                  <input
                    ref={mobileInputRef}
                    type="text"
                    autoFocus
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full pl-8 pr-7 text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-medium rounded-full bg-white border border-blue-500 ring-4 ring-blue-500/20 shadow-lg outline-none focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                      title="Clear search query"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchFocused(false)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg transition-colors active:scale-95 flex-shrink-0"
                >
                  Cancel
                </button>
              </form>

              {/* Instant Search Suggestions Dropdown (Mobile Full-Width) */}
              {renderSearchDropdown()}
            </div>
          )}

        </div>
      </header>
    </>
  );
}
