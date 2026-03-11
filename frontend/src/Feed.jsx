import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from './api';
import { Heart, MessageSquare, Trash2, Plus, Calendar, Sparkles, Megaphone, Share2, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Feed() {
  const { user, login } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/posts/${id}`);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Professional Hero Section */}
      <div className="pt-12 pb-16 text-center border-b border-slate-100 mb-12">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border border-slate-200"
        >
          <Sparkles size={12} className="text-brand-gold" />
          <span>Official Communication Portal</span>
        </motion.div>

        <motion.h1 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4"
        >
          Stay Connected with <br />
          <span className="brand-text-gradient">Campus Updates</span>
        </motion.h1>
        <p className="text-slate-500 font-medium text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
          The central hub for news, events, and student notifications from Avichi College of Arts and Science.
        </p>
      </div>

      {/* Action Bar */}
      <div className="mb-10">
        {user ? (
          <motion.div 
            whileHover={{ y: -2 }}
            className="premium-card p-4 sm:p-5 flex items-center gap-4 bg-white"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
               <Plus size={24} />
            </div>
            <Link to="/create" className="flex-1 text-slate-400 font-medium text-sm sm:text-base hover:text-slate-600 transition-colors">
              Share something with the college community...
            </Link>
          </motion.div>
        ) : (
          <div className="premium-card p-6 text-center bg-slate-50 border-dashed">
            <p className="text-slate-500 text-sm font-medium mb-3">Login to participate in the conversation</p>
            <button onClick={login} className="text-brand-blue font-bold text-sm hover:underline">Sign in with Google</button>
          </div>
        )}
      </div>

      {/* Feed Content */}
      <div className="space-y-8 pb-20">
        {loading ? (
             <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-10 h-10 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Refreshing Feed</p>
             </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 px-8 border-2 border-dashed border-slate-200 rounded-[32px]">
            <Megaphone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-400">No updates posted yet</h3>
            <p className="text-slate-400 text-sm mb-6">Updates disappear after 24 hours.</p>
          </div>
        ) : (
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card overflow-hidden bg-white"
              >
                <div className="p-5 sm:p-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {post.author_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{post.author_name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          <Calendar size={10} className="text-brand-gold" />
                          <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="text-slate-300 hover:text-slate-500 transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Body Content */}
                  <p className="text-slate-600 font-medium text-base sm:text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                    {post.description}
                  </p>

                  {post.image && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 mb-6 group cursor-zoom-in">
                      <img 
                        src={`${api.defaults.baseURL}/uploads/${post.image}`} 
                        className="w-full h-auto max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                        alt="Post visual" 
                      />
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-bold text-xs uppercase group">
                        <Heart size={18} className="group-active:scale-125" />
                        <span>Support</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-400 hover:text-brand-blue transition-all font-bold text-xs uppercase">
                        <MessageSquare size={18} />
                        <span>Discuss</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                        <Share2 size={18} />
                      </button>
                      {user && user.email === post.author_email && (
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
