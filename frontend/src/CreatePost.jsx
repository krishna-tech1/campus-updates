import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';
import { Image as ImageIcon, X, Send, ArrowLeft, Loader2, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatePost() {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('description', description);
    if (file) formData.append('image', file);

    try {
      await api.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/');
    } catch (err) {
      alert('Failed to share update');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate('/')} 
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-brand-blue hover:border-brand-blue transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-black text-2xl text-slate-900 tracking-tight">Create Update</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Campus Community Feed</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card p-6 sm:p-10 bg-white"
      >
        <div className="flex gap-4 mb-10">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-xl shadow-sm border border-slate-100" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-brand-blue border border-slate-200">
              <User size={22} />
            </div>
          )}
          
          {user.role === 'admin' && (
            <div className="flex items-center">
              <span className="bg-brand-maroon text-white text-[9px] px-2.5 py-1 rounded-full font-black tracking-widest shadow-sm">
                ADMIN
              </span>
            </div>
          )}
          <div>
            <h2 className="font-bold text-slate-900 leading-tight">{user.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                 {user.role === 'admin' ? 'Broadcasting as Admin' : 'Broadcasting to Avichi Feed'}
               </span>
               {user.role === 'admin' && (
                 <span className="bg-brand-maroon/10 text-brand-maroon text-[9px] px-2 py-0.5 rounded-full font-black ml-1">ADMIN</span>
               )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <textarea
            className="w-full min-h-[150px] text-lg sm:text-xl bg-transparent border-none focus:ring-0 placeholder:text-slate-300 font-medium resize-none text-slate-800 p-0"
            placeholder="What's the official update for today?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {preview && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-inner group">
              <img src={preview} className="w-full max-h-[400px] object-contain bg-slate-50" alt="Preview" />
              <button 
                type="button" 
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-red-500 text-white rounded-lg backdrop-blur-md transition-all shadow-lg"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-8 border-t border-slate-50">
            <label className="flex items-center justify-center gap-3 cursor-pointer text-slate-500 hover:text-brand-blue hover:bg-slate-50 px-6 py-3 rounded-2xl transition-all font-bold text-sm border border-slate-200 group">
              <ImageIcon size={20} className="text-brand-gold group-hover:scale-110" />
              <span>Attach Media</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>

            <button
              type="submit"
              disabled={loading || !description.trim()}
              className={`flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 ${
                loading || !description.trim() 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                  : 'brand-gradient text-white shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-1'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
              <span>Broadcast Update</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
