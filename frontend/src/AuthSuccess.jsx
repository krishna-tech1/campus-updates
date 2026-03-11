import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      // Add a slight delay for a smoother visual transition
      setTimeout(() => {
        navigate('/');
      }, 1000);
    };
    init();
  }, [checkAuth, navigate]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8fafc] font-inter">
      <div className="text-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-600 mb-8 mx-auto shadow-xl shadow-blue-500/10"
        >
          <ShieldCheck size={40} />
        </motion.div>
        
        <motion.h2 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="text-2xl font-black text-slate-900 dark:text-white mb-2"
        >
            Verified Successfully
        </motion.h2>
        
        <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.3 }}
           className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8"
        >
            Securely Redirecting You
        </motion.p>
        
        <div className="flex justify-center">
            <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      </div>
    </div>
  );
}
