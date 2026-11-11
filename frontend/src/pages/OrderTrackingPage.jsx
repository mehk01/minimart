import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { ordersApi } from '../api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Truck,
  Home,
  Store,
  Clock,
  Check,
  PackageCheck,
  Star,
  ShieldCheck,
  Phone,
  MessageSquare,
  DoorOpen,
  Bell,
  VolumeX,
  Printer,
  Download,
  Receipt,
  Send,
  X,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const { deliveryLocation, activeOrderForTracking } = useStore();
  const [order, setOrder] = useState(activeOrderForTracking || null);
  const [etaMinutes, setEtaMinutes] = useState(14);
  const [riderProgress, setRiderProgress] = useState(25); // percentage along the road
  const [step, setStep] = useState(2); // 1: Confirmed, 2: Packing, 3: On Way, 4: Delivered

  const getStepFromStatus = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 2;
    }
  };

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = () => {
      ordersApi.getById(parseInt(orderId))
        .then(res => {
          setOrder(res.data);
          const currentStep = getStepFromStatus(res.data.status);
          setStep(currentStep);
          if (currentStep === 1) {
            setRiderProgress(15);
            setEtaMinutes(18);
          } else if (currentStep === 2) {
            setRiderProgress(38);
            setEtaMinutes(14);
          } else if (currentStep === 3) {
            setRiderProgress(80);
            setEtaMinutes(5);
          } else if (currentStep === 4) {
            setRiderProgress(100);
            setEtaMinutes(0);
          }
        })
        .catch(() => {});
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 6000);
    return () => clearInterval(interval);
  }, [orderId]);


  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'marco', text: 'Hi! I picked up your grocery basket from Springfield Hub. Moving fast on my electric scooter!', time: '10:12 AM' }
  ]);

  const handleSimulateStep = (newStep) => {
    setStep(newStep);
    if (newStep === 1) {
      setRiderProgress(15);
      setEtaMinutes(18);
    } else if (newStep === 2) {
      setRiderProgress(38);
      setEtaMinutes(14);
    } else if (newStep === 3) {
      setRiderProgress(80);
      setEtaMinutes(5);
    } else if (newStep === 4) {
      setRiderProgress(100);
      setEtaMinutes(0);
      toast.success('Delivery completed! Enjoy your fresh groceries.');
    }
  };

  const handleSendChatMessage = (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const newMsg = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Marco response simulation
    setTimeout(() => {
      let reply = "Got it! Following your delivery instructions.";
      if (text.toLowerCase().includes('door') || text.toLowerCase().includes('porch')) {
        reply = "Will place gently right beside your front door in insulated cold bags!";
      } else if (text.toLowerCase().includes('bell') || text.toLowerCase().includes('sleep')) {
        reply = "Understood, will not ring the bell or knock. I'll send a photo confirmation!";
      } else if (text.toLowerCase().includes('buzzer')) {
        reply = "Got the buzzer code! Ringing as soon as I arrive.";
      }
      setChatMessages(prev => [...prev, {
        sender: 'marco',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 700);
  };

  const handleDownloadPDF = () => {
    const originalTitle = document.title;
    const invNum = order?.order_number || `MM-ORD-${orderId || 'Receipt'}`;
    document.title = `MiniMart-Invoice-${invNum}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCall = () => {
    toast.success('Connecting to Delivery Partner Marco: (555) 014-9921');
  };

  const handleMessage = () => {
    setIsChatOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 print:p-0 print:m-0 print:space-y-0 print:max-w-none">
      
      {/* Top Bar Navigation (Hidden in Print/PDF) */}
      <div className="flex items-center justify-between print:hidden">
        <Link to="/orders" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
        <span className="badge badge-sale text-xs px-3 py-1 font-extrabold uppercase animate-pulse flex items-center gap-1 border border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          Live Tracking
        </span>
      </div>

      {/* Live Simulation Demo Controls (Hidden in Print/PDF) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden shadow-sm">
        <div className="flex items-center gap-2 text-blue-900 font-bold">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Live Stage Simulation:</span>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-white/70 rounded-full border border-blue-200/50 shadow-inner">
          {[
            { s: 1, label: '1. Confirmed', icon: null },
            { s: 2, label: '2. Packing', icon: null },
            { s: 3, label: '3. On Way', icon: Truck },
            { s: 4, label: '4. Arrived', icon: Home },
          ].map((item) => {
            const isSelected = step === item.s;
            const Icon = item.icon;
            return (
              <button
                key={item.s}
                onClick={() => handleSimulateStep(item.s)}
                className={`relative px-3.5 py-1.5 rounded-full font-bold transition-colors duration-250 ease-out active:scale-95 text-xs flex items-center gap-1.5 z-10 cursor-pointer ${
                  isSelected ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeSimulationStep"
                    className={`absolute inset-0 rounded-full shadow-md shadow-blue-500/30 -z-10 ${
                      item.s === 4
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Delivery Map & Courier Card (Strictly Hidden in Print/PDF) */}
      <div className="liquid-glass-card rounded-3xl shadow-xl overflow-hidden print:hidden">
        
        {/* Animated Map Graphic Container */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 h-64 sm:h-72 p-6 overflow-hidden flex flex-col justify-between">
          
          {/* Stylized Map Grid Overlay */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:32px_32px]"></div>

          {/* Road Path Line */}
          <div className="absolute top-1/2 left-12 right-12 h-2.5 bg-slate-700/80 rounded-full -translate-y-1/2 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${riderProgress}%` }}
            ></div>
          </div>

          {/* Hub Icon (Start) */}
          <div className="absolute top-1/2 left-8 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/50 ring-4 ring-blue-900/60 border border-white/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-blue-200 mt-1.5 whitespace-nowrap">Springfield Hub</span>
          </div>

          {/* Customer House Icon (Destination) */}
          <div className="absolute top-1/2 right-8 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-900/60 border border-white/20">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-emerald-200 mt-1.5 whitespace-nowrap">Your Home</span>
          </div>

          {/* Moving Scooter Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-1000 flex flex-col items-center"
            style={{ left: `calc(10% + ${riderProgress * 0.8}%)` }}
          >
            <div className="bg-amber-400 text-slate-900 p-2.5 rounded-2xl shadow-xl shadow-amber-400/50 ring-4 ring-white animate-bounce flex items-center justify-center">
              <Truck className="w-5 h-5 text-slate-900" />
            </div>
            <span className="bg-slate-900/95 text-amber-300 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full mt-1 border border-amber-400/40 whitespace-nowrap shadow-md">
              Marco ({etaMinutes}m)
            </span>
          </div>

          {/* Top ETA Badge inside Map */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-bold border border-white/15 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Order #{order?.order_number || 'MM-892401'}</span>
            </div>

            <div className="bg-emerald-500/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-extrabold shadow-lg flex items-center gap-1.5 border border-white/20">
              <Clock className="w-4 h-4" />
              <span>Arriving in ~{etaMinutes} mins</span>
            </div>
          </div>

          {/* Bottom Destination Info */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Destination: <strong className="text-white ml-0.5">{deliveryLocation.address}</strong>
            </span>
            <span className="text-emerald-300 font-bold">15-Min Rush Cold-Chain</span>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="p-6 bg-slate-50/60 backdrop-blur-md border-b border-white/80">
          <div className="flex items-center justify-between max-w-lg mx-auto relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-extrabold shadow-md border border-white/40">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 mt-1.5">Order Placed</span>
              <span className="text-[10px] text-slate-400">10:04 AM</span>
            </div>

            <div className="flex-1 h-1 bg-emerald-500 -mt-6 mx-2"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-md border border-white/40 ${
                step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > 2 ? <Check className="w-4 h-4 stroke-[2.5]" /> : <PackageCheck className="w-4 h-4" />}
              </div>
              <span className="text-[11px] font-bold text-slate-800 mt-1.5">Packed Fresh</span>
              <span className="text-[10px] text-slate-400">10:08 AM</span>
            </div>

            <div className={`flex-1 h-1 -mt-6 mx-2 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-md border border-white/40 ${
                step >= 3 ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400 border-slate-300'
              }`}>
                <Truck className="w-4 h-4" />
              </div>
              <span className={`text-[11px] font-bold mt-1.5 ${step >= 3 ? 'text-blue-700' : 'text-slate-400'}`}>On The Way</span>
              <span className="text-[10px] text-blue-600 font-semibold">{etaMinutes}m away</span>
            </div>

            <div className={`flex-1 h-1 -mt-6 mx-2 ${step >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>

            {/* Step 4 */}
            <div className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-md border border-white/40 ${
                step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 border-slate-300'
              }`}>
                <Home className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 mt-1.5">Delivered</span>
              <span className="text-[10px] text-slate-400">~10:25 AM</span>
            </div>

          </div>
        </div>

        {/* Courier & Shopper Card */}
        <div className="p-6 divide-y divide-slate-100">
          
          <div className="pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Rider"
                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900 font-heading">Marco R.</h4>
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    4.98 <span className="text-slate-400 text-[10px] ml-1 font-normal">(1,240 deliveries)</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">Your Express Delivery Partner • Electric Scooter</p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200">
                  Vaccinated & Temperature Checked (98.2°F)
                </span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCall}
                className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-colors shadow-sm active:scale-95"
                title="Call Partner"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={handleMessage}
                className="w-10 h-10 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center transition-colors shadow-sm active:scale-95"
                title="Message Partner"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shopper Details */}
          <div className="pt-4 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>Personal Shopper: <strong>Sarah K.</strong> handpicked your fresh items</span>
            </div>
            <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Quality Inspected
            </span>
          </div>

        </div>

      </div>

      {/* Itemized Order Invoice & Receipt (Exclusively Formatted for PDF / Print & Web) */}
      <div className="printable-order-invoice liquid-glass-card rounded-3xl shadow-lg p-6 sm:p-8 space-y-6 print:bg-white print:backdrop-blur-none print:border-none print:shadow-none print:p-0">
        
        {/* Official Tax Invoice Letterhead - Visible ONLY in Print/PDF */}
        <div className="hidden print:block pb-6 mb-6 border-b-2 border-slate-900">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="MiniMart" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-2">
                MiniMart Hyperlocal Express Groceries Inc.
              </p>
              <p className="text-[10px] text-slate-500">
                GST/Tax ID: US-89-492104-X • Darkstore Station #104 Springfield
              </p>
              <p className="text-[10px] text-slate-500">
                Support: orders@minimart.express • +1 (800) 555-0199
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black tracking-wider uppercase rounded">
                OFFICIAL TAX INVOICE
              </span>
              <p className="font-mono text-sm font-extrabold text-slate-900 mt-2">
                #{order?.order_number || `MM-ORD-${orderId || '892401'}`}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Date: {new Date(order?.created_at || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300">
                PAID IN FULL
              </span>
            </div>
          </div>

          {/* Customer & Payment Meta in Print */}
          <div className="grid grid-cols-2 gap-6 mt-5 pt-4 border-t border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                DELIVERED TO (CUSTOMER)
              </span>
              <p className="font-bold text-slate-900 mt-0.5">Valued Customer</p>
              <p className="text-slate-700 mt-0.5">{order?.notes || deliveryLocation.address}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                PAYMENT & FULFILLMENT
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                Method: {order?.payment_method?.replace('_', ' ').toUpperCase() || 'ONLINE PAYMENT'}
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Speed: 15-Minute Cold-Chain Delivery
              </p>
            </div>
          </div>
        </div>

        {/* On-Screen Invoice Header with PDF Download & Print Buttons (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Official Order Receipt
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Order #{order?.order_number || `MM-ORD-${orderId}`} • Placed {new Date(order?.created_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="btn btn-primary text-xs py-2 px-4 rounded-full font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Download clean order details PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Invoice (PDF)</span>
            </button>
            <button
              onClick={handlePrintReceipt}
              className="btn btn-secondary text-xs py-2 px-3.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Itemized Order Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-700">
              Ordered Grocery Items ({order?.items?.length || 1})
            </label>
            <span className="hidden print:block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Amount
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden print:border-slate-300 print:rounded-none">
            {order?.items?.map((item, idx) => (
              <div key={item.id || idx} className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition-colors print:p-2.5 print:border-b print:border-slate-200">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.product?.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80'}
                    alt={item.product?.name || 'Item'}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0 print:hidden"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-800 truncate print:text-sm print:font-bold">
                      {item.product?.name || `Grocery Item #${idx + 1}`}
                    </h4>
                    <p className="text-[11px] text-slate-400 print:text-slate-600">
                      Qty: <strong className="text-slate-700">{item.quantity}</strong> × ${(item.unit_price || item.product?.price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <strong className="text-xs font-extrabold text-slate-900 flex-shrink-0 font-heading print:text-sm">
                  ${((item.unit_price || item.product?.price || 0) * item.quantity).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Breakdown */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs print:border-slate-300">
          <div className="flex justify-between text-slate-500 print:text-slate-700">
            <span>Items Subtotal</span>
            <span className="font-semibold text-slate-800">${(order?.subtotal || order?.total || 24.50).toFixed(2)}</span>
          </div>

          {order?.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold print:text-emerald-800">
              <span>Coupon Promo Discount</span>
              <span>-${order.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-500 print:text-slate-700">
            <span>15-Minute Guaranteed Delivery</span>
            <span className="font-semibold text-slate-800">
              {order?.delivery_fee === 0 ? (
                <span className="text-emerald-600 font-bold uppercase text-[10px] print:text-emerald-800">FREE</span>
              ) : (
                `$${(order?.delivery_fee || 2.99).toFixed(2)}`
              )}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900 print:border-t-2 print:border-slate-900">
            <span>Grand Total Paid</span>
            <span className="text-blue-700 font-heading text-base print:text-slate-900">${(order?.total || 24.50).toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery Address & Security Footer (On-Screen View) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-xs print:hidden">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-slate-800 block">Delivering To:</span>
            <p className="text-slate-500 mt-0.5">{order?.notes || deliveryLocation.address}</p>
          </div>
        </div>

        {/* Print-Only Legal Tax Notice Footer */}
        <div className="hidden print:block pt-6 mt-6 border-t border-slate-300 text-center text-[10px] text-slate-500">
          <p className="font-bold text-slate-800 text-xs">
            Thank you for shopping with MiniMart Express!
          </p>
          <p className="mt-1 text-slate-600">
            This is an electronic tax invoice for order #{order?.order_number || `MM-ORD-${orderId}`}.
          </p>
          <p className="text-slate-400 mt-0.5">
            No physical signature required. All items packed under temperature-controlled hygiene standards. For queries, contact support@minimart.express
          </p>
        </div>

      </div>

      {/* Slide-over Driver Chat Dialog (Strictly Hidden in Print/PDF) */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden print:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsChatOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between animate-fade-in">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                    alt="Marco"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Marco R. (Courier)</h4>
                    <p className="text-[11px] text-emerald-600 font-bold">Online • En Route with your order</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets (No Emojis!) */}
              <div className="py-2.5 px-3 border-b border-slate-100 overflow-x-auto scrollbar-none flex items-center gap-1.5 flex-shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('Please leave groceries at front door beside the mat')}
                  className="text-[10px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 border border-slate-200/60"
                >
                  <DoorOpen className="w-3 h-3 text-blue-600" />
                  <span>Leave at front door</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('Buzzer code is #4B, please ring on arrival')}
                  className="text-[10px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 border border-slate-200/60"
                >
                  <Bell className="w-3 h-3 text-amber-600" />
                  <span>Ring Apt Buzzer 4B</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage("Please don't knock or ring bell, baby is asleep")}
                  className="text-[10px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 border border-slate-200/60"
                >
                  <VolumeX className="w-3 h-3 text-purple-600" />
                  <span>Don't knock (quiet)</span>
                </button>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs font-medium leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Input field */}
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Message courier..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  className="flex-1 bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => handleSendChatMessage()}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
