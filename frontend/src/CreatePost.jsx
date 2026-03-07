import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { useAuth } from './AuthContext';
import { Image, X, Send, ArrowLeft, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-inter">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-50">
         <div className="max-w-xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
               <ArrowLeft size={20} />
            </button>
            <h1 className="font-extrabold text-lg">Share Update</h1>
            <div className="w-10"></div>
         </div>
      </nav>

      <main className="max-w-xl mx-auto p-4 py-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700"
        >
          <div className="flex gap-4 mb-6">
             <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                {user.name.charAt(0)}
             </div>
             <div className="flex-1">
                <h2 className="font-bold text-lg">{user.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sharing to Campus Feed</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              className="w-full min-h-[180px] text-xl bg-transparent border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium resize-none text-slate-800 dark:text-slate-100"
              placeholder="What's the buzz around campus?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {preview && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={preview} className="w-full object-cover" alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-full transition-all font-bold text-sm">
                <Image size={20} />
                <span>Add Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>

              <button
                type="submit"
                disabled={loading || !description.trim()}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 ${
                  loading || !description.trim() 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
                <span>Share Post</span>
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
