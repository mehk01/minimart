import React, { useState, useEffect } from 'react';
import { ordersApi, productsApi, categoriesApi } from '../api';
import { useStore } from '../store';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Store,
  Package,
  Receipt,
  LayoutGrid,
  Plus,
  Trash2,
  X,
  Crown,
  Flame,
  Layers,
  Boxes,
  Percent,
  CheckCircle2,
  Clock,
  Check
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAuthenticated, quickDemoLogin } = useStore();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders'); // 'orders' | 'inventory' | 'categories'

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [ordRes, prodRes, catRes] = await Promise.all([
          ordersApi.getAll().catch(() => ({ data: [] })),
          productsApi.getAll({ limit: 100 }),
          categoriesApi.getAll(),
        ]);
        setOrders(ordRes.data);
        setProducts(prodRes.data.items || prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdSlug, setNewProdSlug] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('piece');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdStock, setNewProdStock] = useState('50');

  // Category Management State
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2563eb');

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) {
      toast.error('Please enter department name');
      return;
    }
    const slug = newCatSlug || newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const res = await categoriesApi.create({
        name: newCatName,
        slug: slug,
        description: newCatDesc || 'Fresh selections sourced daily',
        image_url: newCatImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        color: newCatColor || '#2563eb',
        sort_order: categories.length + 1,
      });
      setCategories([...categories, res.data]);
      setIsCreateCategoryOpen(false);
      setNewCatName('');
      setNewCatSlug('');
      setNewCatDesc('');
      setNewCatImage('');
      toast.success(`Department "${res.data.name}" created!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create department');
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to remove the department "${catName}"?`)) return;
    try {
      await categoriesApi.delete(catId);
      setCategories(categories.filter(c => c.id !== catId));
      toast.success(`Department "${catName}" removed`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete department');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleToggleSale = async (productId) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const newSaleState = !prod.is_on_sale;
    try {
      await productsApi.update(productId, {
        is_on_sale: newSaleState,
        original_price: newSaleState ? (prod.price * 1.25) : null
      });
      setProducts(products.map(p => p.id === productId ? {
        ...p,
        is_on_sale: newSaleState,
        original_price: newSaleState ? (p.price * 1.25) : null
      } : p));
      toast.success(`${prod.name} ${newSaleState ? 'is now On Sale!' : 'returned to regular price'}`);
    } catch (err) {
      toast.error('Failed to update product discount status');
    }
  };

  const handleAdjustStock = async (productId, delta) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, (prod.stock || 0) + delta);
    try {
      await productsApi.update(productId, { stock: newStock });
      setProducts(products.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      toast.success(`Updated stock for ${prod.name}`);
    } catch (err) {
      toast.error('Failed to update inventory quantity');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdCategory) {
      toast.error('Please fill in product name, price, and category');
      return;
    }
    const slug = newProdSlug || newProdName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const res = await productsApi.create({
        name: newProdName,
        slug: slug,
        price: parseFloat(newProdPrice),
        unit: newProdUnit,
        category_id: parseInt(newProdCategory),
        image_url: newProdImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
        stock: parseInt(newProdStock) || 50,
        is_featured: false,
        is_on_sale: false,
      });
      setProducts([res.data, ...products]);
      setIsCreateProductOpen(false);
      setNewProdName('');
      setNewProdSlug('');
      setNewProdPrice('');
      setNewProdImage('');
      toast.success(`Product "${res.data.name}" added to inventory!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add product');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Admin Store Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time fulfillment operations, live orders, and catalog inventory controls.
          </p>
        </div>

        {!isAuthenticated && (
          <button
            onClick={() => quickDemoLogin('admin')}
            className="btn btn-primary text-xs py-2 px-4 rounded-full font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 active:scale-95"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Login as Demo Admin</span>
          </button>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="liquid-glass-card p-4 rounded-3xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">{products.length}</p>
          <span className="text-[11px] font-semibold text-emerald-600">Across {categories.length} Departments</span>
        </div>

        <div className="liquid-glass-card p-4 rounded-3xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Orders</span>
          <p className="text-2xl font-extrabold text-blue-600 font-heading">{orders.length}</p>
          <span className="text-[11px] font-semibold text-blue-600">Fulfillment Hub #1</span>
        </div>

        <div className="liquid-glass-card p-4 rounded-3xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On-Sale Items</span>
          <p className="text-2xl font-extrabold text-amber-600 font-heading">
            {products.filter(p => p.is_on_sale).length}
          </p>
          <span className="text-[11px] font-semibold text-amber-700">Promo Discounted</span>
        </div>

        <div className="liquid-glass-card p-4 rounded-3xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dispatch SLA</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-heading">99.4%</p>
          <span className="text-[11px] font-semibold text-emerald-600">Avg 13.8 min arrival</span>
        </div>

      </div>

      {/* Tab Selectors with Fluid Sliding Underline */}
      <div className="flex border-b border-slate-200 gap-6 relative">
        {[
          { id: 'orders', label: `Fulfillment Orders (${orders.length})`, icon: Receipt },
          { id: 'inventory', label: `Inventory & Pricing (${products.length})`, icon: Boxes },
          { id: 'categories', label: `Aisles & Departments (${categories.length})`, icon: LayoutGrid },
        ].map((item) => {
          const isSelected = tab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative pb-3 text-xs font-bold transition-colors duration-250 ease-out flex items-center gap-1.5 z-10 cursor-pointer ${
                isSelected ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {isSelected && (
                <motion.div
                  layoutId="activeAdminTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="liquid-glass-card rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 font-heading">Recent Customer Orders</h2>
            <span className="text-xs text-slate-400 font-medium">Status can be updated in real-time</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No active orders yet. Place a test order through the storefront!
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {o.order_number}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {o.items?.length || 1} items
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900 font-heading">
                        ${o.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-slate-600 border border-slate-200">
                          {o.payment_method?.replace('_', ' ') || 'COD'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing (Packing)</option>
                          <option value="shipped">Shipped (On The Way)</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {tab === 'inventory' && (
        <div className="liquid-glass-card rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 font-heading">Stock & Pricing Control</h2>
              <span className="text-xs text-slate-400">Quickly toggle flash sales or increment stock</span>
            </div>
            <button
              onClick={() => {
                if (categories.length > 0 && !newProdCategory) {
                  setNewProdCategory(categories[0].id.toString());
                }
                setIsCreateProductOpen(true);
              }}
              className="btn btn-primary text-xs py-2 px-4 rounded-full font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Qty</th>
                  <th className="py-3 px-4">Sale Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-9 h-9 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate max-w-[180px]">{p.name}</p>
                          <span className="text-[10px] text-slate-400">{p.unit}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {p.category?.name || 'Produce'}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900 font-heading">
                      ${p.price.toFixed(2)}
                      {p.original_price && (
                        <span className="text-[10px] text-slate-400 line-through ml-1">${p.original_price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjustStock(p.id, -5)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold active:scale-90"
                        >
                          -
                        </button>
                        <span className="font-bold text-slate-800 w-8 text-center">{p.stock || 0}</span>
                        <button
                          onClick={() => handleAdjustStock(p.id, 5)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleSale(p.id)}
                        className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase transition-all flex items-center gap-1 active:scale-95 ${
                          p.is_on_sale
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {p.is_on_sale ? (
                          <>
                            <Flame className="w-3 h-3 text-rose-600 fill-rose-600" />
                            <span>On Sale</span>
                          </>
                        ) : (
                          <span>Regular</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories & Aisles Tab */}
      {tab === 'categories' && (
        <div className="liquid-glass-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-heading">Catalogue Departments & Aisles</h2>
              <p className="text-xs text-slate-400">Manage store aisles, visual color codes, and banner images.</p>
            </div>
            <button
              onClick={() => setIsCreateCategoryOpen(true)}
              className="btn btn-primary text-xs py-2 px-4 rounded-full font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-3 bg-slate-50/50 relative group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-white border border-slate-200">
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || '#2563eb' }}
                    ></span>
                    <h3 className="text-sm font-extrabold text-slate-900 truncate font-heading">{cat.name}</h3>
                  </div>
                  <p className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5">/{cat.slug}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{cat.description || 'No description provided'}</p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  title="Delete Department"
                  className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isCreateProductOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateProductOpen(false)}>
          <div
            className="liquid-glass-modal w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-7 animate-fade-in relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">Add New Grocery Product</h3>
              <button
                onClick={() => setIsCreateProductOpen(false)}
                className="w-8 h-8 rounded-full liquid-glass hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Organic Honeycrisp Apples"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Slug (URL friendly)</label>
                <input
                  type="text"
                  value={newProdSlug}
                  onChange={(e) => setNewProdSlug(e.target.value)}
                  placeholder="e.g. organic-honeycrisp-apples (optional)"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="3.99"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="1 lb, 4 pack, each"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium cursor-pointer shadow-inner"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="50"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full btn btn-primary py-2.5 rounded-xl font-bold text-xs mt-3 shadow-md shadow-blue-600/25 active:scale-95"
              >
                Save Product to Store Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isCreateCategoryOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateCategoryOpen(false)}>
          <div
            className="liquid-glass-modal w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-7 animate-fade-in relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">Create New Department</h3>
              <button
                onClick={() => setIsCreateCategoryOpen(false)}
                className="w-8 h-8 rounded-full liquid-glass hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Frozen Treats & Gelato"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="e.g. frozen-treats (optional)"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description for storefront shoppers"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-inner"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white shadow-sm"
                    />
                    <span className="text-xs font-mono text-slate-600">{newCatColor}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department Image</label>
                  <input
                    type="url"
                    value={newCatImage}
                    onChange={(e) => setNewCatImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn btn-primary py-2.5 rounded-xl font-bold text-xs mt-3 shadow-md shadow-blue-600/25 active:scale-95"
              >
                Create Department in Catalog
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
