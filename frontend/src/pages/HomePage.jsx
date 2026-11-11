import React, { useState, useEffect } from 'react';
import { categoriesApi, productsApi } from '../api';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { formatINR, FREE_DELIVERY_THRESHOLD } from '../utils/currency';
import { motion } from 'framer-motion';
import {
  Zap,
  Flame,
  ShieldCheck,
  Leaf,
  ArrowRight,
  ChevronRight,
  LayoutGrid,
  IndianRupee,
  Star,
  Dumbbell,
  SearchX,
  ChevronDown,
  Truck,
  Clock,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const { searchQuery, activeCategory, setActiveCategory } = useStore();
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [catsRes, dealsRes, featRes] = await Promise.all([
          categoriesApi.getAll(),
          productsApi.getDeals(8),
          productsApi.getFeatured(8),
        ]);
        setCategories(catsRes.data);
        setDeals(dealsRes.data);
        setFeatured(featRes.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    }
    fetchData();
  }, []);

  // Fetch catalog products when filters change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setPage(1);
      try {
        const params = {
          sort_by: sortBy,
          page: 1,
          limit: 16,
        };
        if (activeCategory && activeCategory !== 'all') {
          params.category_slug = activeCategory;
        }
        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const res = await productsApi.getAll(params);
        if (res.data.items) {
          setProducts(res.data.items);
          setTotalPages(res.data.pages || 1);
          setTotalProducts(res.data.total || res.data.items.length);
        } else {
          const list = Array.isArray(res.data) ? res.data : [];
          setProducts(list);
          setTotalPages(1);
          setTotalProducts(list.length);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory, searchQuery, sortBy]);

  // Handle Load More pagination
  const handleLoadMore = async () => {
    if (page >= totalPages || isLoadingMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const params = {
        sort_by: sortBy,
        page: nextPage,
        limit: 16,
      };
      if (activeCategory && activeCategory !== 'all') {
        params.category_slug = activeCategory;
      }
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await productsApi.getAll(params);
      const newItems = res.data.items || (Array.isArray(res.data) ? res.data : []);
      setProducts(prev => [...prev, ...newItems]);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Smart dietary filter pills
  const [smartFilter, setSmartFilter] = useState('all');

  const filteredProducts = products.filter((p) => {
    if (smartFilter === 'organic') {
      const text = `${p.name} ${p.description}`.toLowerCase();
      return text.includes('organic') || text.includes('farm') || text.includes('wild');
    }
    if (smartFilter === 'under299') {
      return p.price <= 299.0;
    }
    if (smartFilter === 'deals') {
      return p.is_on_sale || (p.original_price && p.original_price > p.price);
    }
    if (smartFilter === 'topRated') {
      return (p.rating || 0) >= 4.8;
    }
    if (smartFilter === 'protein') {
      const desc = `${p.name} ${p.description}`.toLowerCase();
      return desc.includes('protein') || desc.includes('salmon') || desc.includes('chicken') || desc.includes('yogurt') || desc.includes('eggs');
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-12 pb-4 md:pb-16">
      
      {/* ── 1. Hero Promo Banner ─────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white shadow-xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Glow circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-5 min-[375px]:px-5 min-[375px]:py-6 sm:py-16 sm:px-10 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8">
          <div className="w-full max-w-xl text-center md:text-left space-y-2.5 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/15 backdrop-blur-md px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-blue-100 ring-1 ring-white/20 shadow-sm max-w-full">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 fill-amber-300 flex-shrink-0" />
              <span className="truncate">15-Minute Guaranteed Delivery</span>
            </div>

            <h1 className="hero-heading font-extrabold tracking-tight text-white font-heading">
              Farm-Fresh Groceries, <br className="hidden sm:inline" />
              Delivered in <span className="text-amber-300 underline decoration-amber-300/40">Minutes</span>.
            </h1>

            <p className="hero-subtext text-blue-100/90 leading-snug sm:leading-relaxed font-normal max-w-md mx-auto md:mx-0">
              Crisp seasonal produce, warm artisan breads, farm dairy, and premium cuts handpicked with care and chilled to perfection.
            </p>

            <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
              <a
                href="#catalog"
                className="btn bg-white hover:bg-slate-50 text-blue-800 font-extrabold text-xs sm:text-sm py-2.5 px-4 sm:py-3 sm:px-6 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <Link
                to="/deals"
                className="btn bg-blue-800/60 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm py-2.5 px-4 sm:py-3 sm:px-6 rounded-full backdrop-blur-md ring-1 ring-white/25 transition-all shadow-md active:scale-95 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
              >
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
                <span>View Flash Deals</span>
              </Link>
            </div>

            {/* Micro stats */}
            <div className="pt-2.5 sm:pt-4 flex flex-wrap items-center justify-center md:justify-start gap-x-4 sm:gap-x-6 gap-y-1.5 text-[11px] sm:text-xs text-blue-100/80 font-medium border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 flex-shrink-0" />
                <span>100% Quality Checked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 flex-shrink-0" />
                <span>Zero Plastic Options</span>
              </div>
            </div>
          </div>

          {/* Hero Graphics / Showcase Card */}
          <div className="relative w-full max-w-sm flex-shrink-0">
            <div className="liquid-glass-dark rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl relative">
              <div className="flex items-center gap-3 mb-2.5 sm:mb-4">
                <img
                  src="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=150&q=80"
                  alt="Avocado"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover ring-2 ring-white/40 shadow-md flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider inline-flex items-center gap-1 bg-amber-400/20 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-300/40">
                    <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                    Top Pick Today
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-white mt-0.5 sm:mt-1 font-heading tracking-tight truncate">Organic Hass Avocados</p>
                  <p className="text-xs text-white font-extrabold mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-sm sm:text-base font-black text-amber-300 font-heading">{formatINR(299)}</span>
                    <span className="text-[11px] text-blue-200 line-through">{formatINR(399)}</span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-400/30">Save 25%</span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 text-[11px] sm:text-xs text-white border border-white/15 shadow-inner">
                <div className="flex items-center gap-1.5 sm:gap-2 text-blue-100 font-semibold min-w-0">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">Estimated Arrival:</span>
                </div>
                <strong className="text-amber-300 font-extrabold flex items-center gap-1 bg-amber-400/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-300/30 shadow-sm flex-shrink-0 whitespace-nowrap">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-300 text-amber-300" />
                  12 mins
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Quick Category Circles ──────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">Explore Aisles</h2>
            <p className="text-xs text-slate-500">Pick from our freshly stocked departments</p>
          </div>
          <Link to="/categories" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            <span>View All Aisles</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none pt-1 max-w-full">
          {/* All button */}
          <button
            onClick={() => setActiveCategory('all')}
            className={`relative flex flex-col items-center gap-1.5 sm:gap-2 min-w-[72px] sm:min-w-[84px] p-2 sm:p-2.5 rounded-2xl transition-colors duration-250 ease-out active:scale-95 z-10 flex-shrink-0 ${
              activeCategory === 'all'
                ? 'text-white'
                : 'liquid-glass hover:bg-white text-slate-700 shadow-sm'
            }`}
          >
            {activeCategory === 'all' && (
              <motion.div
                layoutId="activeCategoryPill"
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md shadow-blue-600/30 -z-10 ring-2 ring-blue-600/30"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors duration-250 ease-out ${
              activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100/80 text-slate-700'
            }`}>
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold tracking-tight text-center truncate w-full">All Items</span>
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`relative flex flex-col items-center gap-1.5 sm:gap-2 min-w-[72px] sm:min-w-[84px] p-2 sm:p-2.5 rounded-2xl transition-colors duration-250 ease-out active:scale-95 z-10 flex-shrink-0 ${
                  isSelected
                    ? 'text-white'
                    : 'liquid-glass hover:bg-white text-slate-700 shadow-sm'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-md shadow-blue-600/30 -z-10 ring-2 ring-blue-600/30"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-250 ease-out ${
                  isSelected ? 'ring-2 ring-white/60 shadow-sm' : ''
                }`}>
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-bold tracking-tight text-center truncate w-full">
                  {cat.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. Flash Deals Section ───────────────────────────── */}
      {deals.length > 0 && activeCategory === 'all' && !searchQuery && (
        <section className="liquid-glass-card bg-gradient-to-r from-amber-500/12 via-orange-500/10 to-amber-500/5 rounded-2xl sm:rounded-3xl p-3 sm:p-7 border border-amber-200/70 space-y-3 sm:space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 border border-white/30 flex-shrink-0">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex flex-wrap items-center gap-1.5 sm:gap-2 font-heading">
                  Today's Super Deals
                  <span className="badge badge-sale text-[10px] font-extrabold shadow-sm">Up to 30% Off</span>
                </h2>
                <p className="text-xs text-slate-600">Special discounts on high-demand fresh staples</p>
              </div>
            </div>

            <Link
              to="/deals"
              className="btn liquid-glass text-xs py-1.5 sm:py-2 px-3.5 sm:px-4 rounded-full font-bold text-amber-800 hover:text-amber-950 shadow-sm border border-amber-200/80 hover:border-amber-300 flex items-center gap-1.5 flex-shrink-0"
            >
              <span>See All Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="product-grid">
            {deals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Main Products Catalog ─────────────────────────── */}
      <section id="catalog" className="space-y-4 sm:space-y-5 pt-1 sm:pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 font-heading">
              {searchQuery ? `Search results for "${searchQuery}"` : activeCategory === 'all' ? 'All Fresh Groceries' : categories.find(c => c.slug === activeCategory)?.name || 'Groceries'}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredProducts.length} farm-fresh items in stock
            </p>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-slate-800 liquid-glass rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
            >
              <option value="newest">Featured & Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Realistic Tactile Capsule Filter Bar with Fluid Sliding Spring Transition */}
        <div className="flex items-center overflow-x-auto pb-1 scrollbar-none pt-1 max-w-full">
          <div className="liquid-bar flex items-center gap-1 sm:gap-1.5 p-1 relative">
            {[
              { id: 'all', label: 'All Items', icon: LayoutGrid, activeColor: 'text-white', idleColor: 'text-blue-600' },
              { id: 'organic', label: '100% Organic', icon: Leaf, activeColor: 'text-white', idleColor: 'text-emerald-600' },
              { id: 'under299', label: 'Under ₹299', icon: IndianRupee, activeColor: 'text-white', idleColor: 'text-amber-600' },
              { id: 'deals', label: 'On Sale', icon: Flame, activeColor: 'text-white', idleColor: 'text-rose-600' },
              { id: 'topRated', label: '4.9+ Rated', icon: Star, activeColor: 'fill-white text-white', idleColor: 'fill-amber-400 text-amber-400' },
              { id: 'protein', label: 'High Protein', icon: Dumbbell, activeColor: 'text-white', idleColor: 'text-indigo-600' },
            ].map((filter) => {
              const isSelected = smartFilter === filter.id;
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSmartFilter(filter.id)}
                  className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-colors duration-250 ease-out flex items-center gap-1.5 z-10 select-none cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    isSelected ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeSmartFilterPill"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md shadow-blue-500/30 -z-10 border border-white/25"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 transition-colors duration-250 ease-out ${isSelected ? filter.activeColor : filter.idleColor}`} />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="product-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl h-72 animate-pulse p-4 space-y-3">
                <div className="bg-slate-200 h-36 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-inner">
              <SearchX className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-heading">No products matched your filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try switching your dietary filter or category to view available fresh items.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSmartFilter('all');
                useStore.getState().setSearchQuery('');
              }}
              className="mt-4 btn btn-primary text-xs py-2 px-5 rounded-full"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Load More Groceries Button */}
        {!loading && filteredProducts.length > 0 && page < totalPages && (
          <div className="flex flex-col items-center justify-center pt-4 sm:pt-6 space-y-2">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="btn btn-secondary px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-extrabold text-blue-700 bg-white border border-blue-200 hover:border-blue-400 shadow-sm transition-all flex items-center gap-2 group disabled:opacity-60 active:scale-95"
            >
              {isLoadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Restocking Shelves...</span>
                </>
              ) : (
                <>
                  <span>Load More Groceries</span>
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 font-medium">
              Showing {products.length} of {totalProducts} items
            </p>
          </div>
        )}
      </section>

      {/* ── 5. Value Props Banner ────────────────────────────── */}
      <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-slate-200/80 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-5 sm:mb-8">
          <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">The MiniMart Standard</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 font-heading">Why Springfield Loves MiniMart</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 text-center">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2 shadow-sm border border-blue-200">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">15-Minute Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hyper-local micro fulfillment hubs in your neighborhood ensure instant dispatch within 15 minutes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-sm border border-emerald-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">100% Fresh Guarantee</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If an avocado is slightly bruised or milk isn't ice cold, we refund you instantly with zero questions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 shadow-sm border border-amber-200">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">Fair Everyday Pricing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No price gouging or hidden platform markups. Enjoy farm-direct prices with free delivery over {formatINR(FREE_DELIVERY_THRESHOLD)}.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
