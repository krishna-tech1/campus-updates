import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from './api';
import { Heart, MessageSquare, Trash2, Plus, LogOut, User as UserIcon, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Feed() {
  const { user, login, logout } = useAuth();
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-inter">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
            <span className="text-2xl">📢</span> Campus Updates
          </a>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Logged in</span>
                  <span className="text-sm font-bold">{user.name}</span>
                </div>
                {user.picture ? (
                   <img src={user.picture} className="w-10 h-10 rounded-full border-2 border-blue-500 p-0.5" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600">
                    <UserIcon size={20} />
                  </div>
                )}
                <button onClick={logout} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Login with Google
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Campus Community</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">The heartbeat of your campus. Stay informed, stay connected.</p>
      </header>

      {/* Main Feed */}
      <main className="max-w-xl mx-auto px-4 pb-24">
        {user && (
          <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
             <a href="/create" className="flex items-center gap-4 text-slate-400 group">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                  <Plus size={24} />
                </div>
                <span className="font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">What's happening in college today?</span>
             </a>
          </div>
        )}

        {loading ? (
             <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-medium">Loading updates...</p>
             </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-8 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <span className="text-5xl mb-4 block">📭</span>
            <h2 className="text-xl font-bold mb-2">No updates yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Be the first to share something with the campus community!</p>
            {user ? (
               <a href="/create" className="inline-flex bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all">
                  Create First Post
               </a>
            ) : (
              <button onClick={login} className="text-blue-600 font-bold hover:underline">Login to post an update</button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.article 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center text-blue-600 font-bold">
                          {post.author_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{post.author_name}</h3>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            <Calendar size={12} />
                            {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      
                      {user && user.email === post.author_email && (
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                      {post.description}
                    </p>
                  </div>

                  {post.image && (
                    <div className="bg-slate-100 dark:bg-slate-900/50 flex justify-center">
                      <img 
                        src={`${api.defaults.baseURL}/uploads/${post.image}`} 
                        className="max-h-[500px] w-full object-cover" 
                        alt="" 
                      />
                    </div>
                  )}

                  <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700/50 flex gap-4">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 font-bold text-sm transition-colors group">
                      <Heart size={20} className="group-active:scale-125 transition-transform" />
                      <span>Support</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-sm transition-colors">
                      <MessageSquare size={20} />
                      <span>Reply</span>
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
