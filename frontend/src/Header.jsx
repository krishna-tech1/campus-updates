import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Plus, LogOut, LayoutGrid, Bell } from 'lucide-react';

export default function Header() {
  const { user, login, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Banner Branding - Unified Background */}
      <div className="bg-white border-b border-slate-100 py-1 sm:py-1.5 shadow-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex justify-center items-center">
          <Link to="/" className="block group">
            <img 
              src="/logo.jpeg" 
              alt="Avichi College Banner" 
              className="w-full h-auto object-contain max-h-[70px] sm:max-h-[100px] transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </Link>
        </div>
      </div>

      {/* Navigation Bar - Floating / Glass Appearance */}
      <div className="glass border-b border-slate-200/50 dark:border-slate-800/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className={`flex items-center gap-2 text-sm sm:text-base font-bold transition-all ${
                location.pathname === '/' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <LayoutGrid size={18} className={location.pathname === '/' ? 'text-blue-700' : ''} />
              <span className="tracking-tight">Campus Connect</span>
            </Link>
          </div>

          <nav className="flex items-center gap-3 sm:gap-6">
            {user ? (
              <>
                <Link 
                  to="/create" 
                  className="elegant-gradient text-white px-4 py-2 sm:px-6 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-2"
                >
                  <Plus size={18} strokeWidth={3} />
                  <span className="hidden sm:inline">Share Update</span>
                </Link>
                
                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700/50"></div>

                <div className="flex items-center gap-3">
                  <div className="relative group cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  </div>

                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-white dark:border-slate-800 shadow-md ring-1 ring-slate-100 dark:ring-slate-700" />
                  ) : (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm shadow-inner">
                      {user.name.charAt(0)}
                    </div>
                  )}

                  <button 
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-all hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={login}
                className="elegant-gradient text-white px-8 py-2.5 rounded-full text-sm font-bold transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 flex items-center gap-2"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>
      
      {/* Visual Accent Line */}
      <div className="h-[2px] w-full flex">
         <div className="h-full w-1/3 bg-[#7f1d1d]"></div> {/* Maroon */}
         <div className="h-full w-1/3 bg-[#fbbf24]"></div> {/* Gold */}
         <div className="h-full w-1/3 bg-[#1e3a8a]"></div> {/* Blue */}
      </div>
    </header>
  );
}
