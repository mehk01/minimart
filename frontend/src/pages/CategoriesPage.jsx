import React, { useState, useEffect } from 'react';
import { categoriesApi, productsApi } from '../api';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import { LayoutGrid, Layers, CheckCircle2 } from 'lucide-react';

export default function CategoriesPage() {
  const { setActiveCategory } = useStore();
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await categoriesApi.getAll();
        setCategories(res.data);
        if (res.data.length > 0) {
          setSelectedCat(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCat) return;
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await productsApi.getAll({ category_slug: selectedCat.slug, limit: 100 });
        setProducts(res.data.items || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCat]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-4 md:pb-16">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-200 flex-shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Grocery Departments & Aisles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Browse items organized by fresh departments, organic goods, and pantry staples.
          </p>
        </div>
      </div>

      {/* Categories Grid (Department Cards) with Fluid Animated Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCat?.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat)}
              className={`liquid-glass-card p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-left transition-all duration-250 ease-out flex flex-col justify-between h-36 sm:h-44 min-w-0 relative overflow-hidden group active:scale-95 ${
                isSelected
                  ? 'border-blue-600 shadow-lg ring-2 ring-blue-600/20'
                  : 'hover:shadow-xl'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeAisleCardPill"
                  className="absolute inset-0 bg-blue-50/75 rounded-2xl sm:rounded-3xl -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              <div className="relative z-10 pr-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Department
                </span>
                <h3 className={`text-[13px] sm:text-base font-extrabold mt-0.5 line-clamp-2 font-heading transition-colors duration-250 ${
                  isSelected ? 'text-blue-900' : 'text-slate-800'
                }`}>
                  {cat.name}
                </h3>
              </div>

              {/* Thumbnail */}
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden self-end shadow-sm group-hover:scale-105 transition-transform border border-white/60 flex-shrink-0">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {isSelected && (
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Department Products */}
      {selectedCat && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
                {selectedCat.name} Products
              </h2>
              <p className="text-xs text-slate-500">{selectedCat.description}</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex-shrink-0">
              {products.length} items
            </span>
          </div>

          {loading ? (
            <div className="product-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl h-64 animate-pulse p-4"></div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
