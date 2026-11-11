import React, { useState } from 'react';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import GoogleSignInButton from './GoogleSignInButton';
import {
  X,
  ShoppingBag,
  Zap,
  User,
  Crown,
  Lock,
  Mail,
  Phone
} from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, googleLogin, quickDemoLogin } = useStore();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (tab === 'login') {
      await login(email, password);
    } else {
      await register({ email, password, full_name: fullName, phone });
    }
    setIsLoading(false);
  };

  const handleDemo = async (role) => {
    setIsLoading(true);
    await quickDemoLogin(role);
    setIsLoading(false);
  };

  const handleGoogleCredential = async (credential) => {
    setIsLoading(true);
    await googleLogin(credential);
    setIsLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div
        className="liquid-glass-modal w-full max-w-md rounded-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 animate-fade-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors active:scale-95"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="MiniMart"
            className="h-14 sm:h-16 w-auto mx-auto object-contain mb-3 drop-shadow-sm"
          />
          <h2 className="text-xl font-extrabold text-slate-900 font-heading">
            {tab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'login' ? 'Sign in to access your orders and saved basket' : 'Join MiniMart for 15-minute grocery delivery'}
          </p>
        </div>

        {/* 1-Click Demo Buttons */}
        <div className="mb-6 p-3.5 liquid-glass rounded-2xl border border-blue-200/60 shadow-sm">
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-2 text-center flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
            Quick 1-Click Demo Accounts
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('customer')}
              disabled={isLoading}
              className="btn btn-secondary text-xs py-2 rounded-xl font-bold border-blue-200 hover:border-blue-300 bg-white shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>Demo Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              disabled={isLoading}
              className="btn btn-secondary text-xs py-2 rounded-xl font-bold border-blue-200 hover:border-blue-300 bg-white shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        {/* Fluid Animated Tabs */}
        <div className="flex bg-slate-100/90 p-1 rounded-2xl mb-5 relative border border-slate-200/60">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors duration-250 ease-out z-10 cursor-pointer ${tab === 'login' ? 'text-blue-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            {tab === 'login' && (
              <motion.div
                layoutId="activeAuthTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-md shadow-slate-200/50 -z-10 border border-slate-200/50"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`relative flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors duration-250 ease-out z-10 cursor-pointer ${tab === 'register' ? 'text-blue-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            {tab === 'register' && (
              <motion.div
                layoutId="activeAuthTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-md shadow-slate-200/50 -z-10 border border-slate-200/50"
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              />
            )}
            <span>Create Account</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (Optional)</label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-0199"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary py-3 rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 disabled:opacity-50 mt-4 active:scale-95"
          >
            {isLoading ? 'Please wait...' : tab === 'login' ? 'Sign In to MiniMart' : 'Create Free Account'}
          </button>
        </form>

        {/* Google Sign-In */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white/90 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            or
          </span>
          <div className="border-t border-slate-200 w-full"></div>
        </div>

        <div>
          <GoogleSignInButton onCredential={handleGoogleCredential} disabled={isLoading} />
        </div>

      </div>
    </div>
  );
}