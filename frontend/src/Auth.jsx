import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (showOTP) {
        await verifyOTP(formData.email, formData.otp);
        setIsLogin(true);
        setShowOTP(false);
        setFormData({ ...formData, otp: '' });
        // Optional: show a success message
      } else if (isLogin) {
        await login(formData.email, formData.password);
        navigate('/');
      } else {
        await register(formData.name, formData.email, formData.password);
        setShowOTP(true);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="premium-card w-full max-w-md bg-white p-8 sm:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4 border border-slate-100">
            <Sparkles size={12} className="text-brand-gold" />
            <span>Campus Gateway</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {showOTP ? 'Verify Email' : isLogin ? 'Welcome Back' : 'Join Community'}
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-2">
            {showOTP 
              ? `Verification code sent to ${formData.email}` 
              : isLogin ? 'Enter your credentials to access the portal' : 'Create an account to start sharing updates'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleAction} className="space-y-6">
          <AnimatePresence mode="wait">
            {showOTP ? (
              <motion.div key="otp-field" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={20} />
                  <input
                    type="text"
                    name="otp"
                    placeholder="6-Digit OTP"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue/20 outline-none text-slate-700 font-bold tracking-[0.5em] text-center text-xl placeholder:tracking-normal placeholder:font-medium transition-all"
                    value={formData.otp}
                    onChange={handleInputChange}
                    maxLength={6}
                    required
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div key="form-fields" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {!isLogin && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={20} />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue/20 outline-none text-slate-700 font-medium transition-all"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
                
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="College Email Address"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue/20 outline-none text-slate-700 font-medium transition-all"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" size={20} />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue/20 outline-none text-slate-700 font-medium transition-all"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full group brand-gradient text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                <span>{showOTP ? 'Verify Now' : isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-slate-400 text-sm font-medium">
            {showOTP 
              ? "Didn't receive the code? " 
              : isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                if (showOTP) setShowOTP(false);
                else setIsLogin(!isLogin);
                setError('');
              }}
              className="text-brand-blue font-bold hover:underline underline-offset-4"
            >
              {showOTP ? "Try again" : isLogin ? "Register here" : "Login instead"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
