import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';
import { Image, X, Send, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
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
    <div className="font-inter pt-4 sm:pt-8">
      <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/')} 
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all active:scale-95"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">Post Update</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Avichi College Feed</p>
            </div>
          </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-10 shadow-2xl shadow-blue-900/5 border border-slate-100 dark:border-slate-800"
      >
        <div className="flex gap-4 mb-8">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl elegant-gradient flex items-center justify-center text-white font-black text-xl shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div className="absolute -top-1 -right-1 bg-accent p-1 rounded-lg shadow-sm border-2 border-white dark:border-slate-900 text-blue-900">
                <Sparkles size={12} fill="currentColor" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white leading-tight">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-wider">Broadcasting Live</p>
              </div>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <textarea
            className="w-full min-h-[150px] sm:min-h-[200px] text-xl sm:text-2xl bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 font-medium resize-none text-slate-800 dark:text-slate-100 p-0"
            placeholder="What's happening in college today?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {preview && (
            <div className="relative rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
              <img src={preview} className="w-full max-h-[450px] object-contain rounded-[20px]" alt="Preview" />
              <button 
                type="button" 
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-all shadow-xl"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-8 border-t border-slate-50 dark:border-slate-800">
            <label className="flex items-center justify-center gap-3 cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 py-3 rounded-2xl transition-all font-bold text-sm border-2 border-slate-100 dark:border-slate-800 group">
              <Image size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Attach Media</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>

            <button
              type="submit"
              disabled={loading || !description.trim()}
              className={`flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black shadow-2xl transition-all active:scale-95 ${
                loading || !description.trim() 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'elegant-gradient text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
              <span>Share to Feed</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
