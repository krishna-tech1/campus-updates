import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from './api';
import { Heart, MessageSquare, Trash2, Plus, Calendar, Sparkles, Megaphone, Share2 } from 'lucide-react';
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
    <div className="font-inter">
      {/* Premium Hero Section */}
      <header className="py-12 sm:py-20 flex flex-col items-center text-center px-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-100/30 rounded-full blur-3xl"></div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 dark:border-blue-800"
        >
          <Sparkles size={14} />
          <span>Official Campus Portal</span>
        </motion.div>

        <motion.h1 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
           className="text-4xl sm:text-6xl font-black tracking-tight mb-6 text-slate-900 dark:text-white leading-[1.1]"
        >
          Experience Your <br />
          <span className="text-gradient">Campus Life</span> In Real-Time
        </motion.h1>

        <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="text-slate-500 dark:text-slate-400 font-medium text-base sm:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Stay updated with the latest happenings, events, and announcements from Avichi College. 
          The ultimate bridge for our student community.
        </motion.p>
      </header>

      {/* Main Feed Container */}
      <div className="max-w-2xl mx-auto space-y-8 px-2">
        {user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-1 glass rounded-3xl premium-shadow border border-white dark:border-slate-800 overflow-hidden"
          >
             <Link to="/create" className="flex items-center gap-4 p-4 text-slate-400 group relative">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                  <Plus size={28} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors text-base sm:text-lg">What's on your mind?</p>
                  <p className="text-xs text-slate-400 font-medium">Click here to post an update to everyone</p>
                </div>
             </Link>
          </motion.div>
        )}

        {loading ? (
             <div className="flex flex-col items-center py-24 gap-6">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                   <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase text-xs">Fetching Updates</p>
             </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 px-8 glass rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center"
          >
            <div className="w-24 h-24 mb-6 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-5xl grayscale opacity-50">
              <Megaphone className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">Nothing to see here... yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium max-w-xs leading-relaxed">The feed is currently quiet. Be the hero and share the first update!</p>
            {user ? (
               <Link to="/create" className="elegant-gradient text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105 active:scale-95">
                  Launch First Post
               </Link>
            ) : (
              <button onClick={login} className="text-blue-600 font-black hover:underline tracking-tight">Sign in to initialize the feed</button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.article 
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden premium-shadow border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/40 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl elegant-gradient flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                            {post.author_name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 shadow-sm"></div>
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-slate-100 leading-tight text-lg">{post.author_name}</h3>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar size={12} className="text-blue-500" />
                            {new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      
                      {user && user.email === post.author_email && (
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium text-lg mb-4">
                      {post.description}
                    </p>
                  </div>

                  {post.image && (
                    <div className="mx-6 mb-6 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner group">
                      <img 
                        src={`${api.defaults.baseURL}/uploads/${post.image}`} 
                        className="max-h-[500px] w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        alt="Post Attachment" 
                      />
                    </div>
                  )}

                  <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/30 flex gap-8 items-center border-t border-slate-100/50 dark:border-slate-800/50">
                    <button className="flex items-center gap-2.5 text-slate-500 hover:text-red-500 font-bold text-sm transition-all group">
                      <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-950/30 transition-colors">
                        <Heart size={20} className="group-active:scale-[1.3] transition-transform" />
                      </div>
                      <span className="group-active:translate-x-1 transition-transform">Support</span>
                    </button>
                    <button className="flex items-center gap-2.5 text-slate-500 hover:text-blue-600 font-bold text-sm transition-all group">
                      <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 transition-colors">
                        <MessageSquare size={20} />
                      </div>
                      <span>Reply</span>
                    </button>
                    <div className="ml-auto">
                      <button className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
