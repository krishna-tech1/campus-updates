import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Plus, LogOut, LayoutGrid, Bell, User } from 'lucide-react';

export default function Header() {
  const { user, login, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      {/* Top Banner Only (Simplified) */}
      <div className="bg-white py-1.5 px-4 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] text-center">
        <Link to="/" className="inline-block">
          <img 
            src="/logo.jpeg" 
            alt="Avichi College" 
            className="h-14 sm:h-20 w-auto object-contain mx-auto transition-opacity hover:opacity-90"
          />
        </Link>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex justify-between items-center h-14 sm:h-16">
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className={`flex items-center gap-2.5 text-sm sm:text-base font-bold tracking-tight transition-colors ${
              location.pathname === '/' ? 'text-brand-blue' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Campus Connect</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6">
          {user ? (
            <div className="flex items-center gap-4 sm:gap-6">
              <Link 
                to="/create" 
                className="brand-gradient text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center gap-2"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Post Update</span>
              </Link>
              
              <div className="w-px h-6 bg-slate-200"></div>

              <div className="flex items-center gap-3">
                <button className="text-slate-400 hover:text-slate-600 transition-colors hidden sm:block">
                  <Bell size={20} />
                </button>
                
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-slate-200 shadow-sm" />
                ) : (
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-100 flex items-center justify-center text-brand-blue border border-slate-200">
                    <User size={18} />
                  </div>
                )}

                {user.role === 'admin' && (
                  <span className="hidden sm:inline bg-brand-maroon text-white text-[9px] px-2.5 py-1 rounded-full font-black tracking-widest shadow-sm">
                    ADMIN
                  </span>
                )}

                <button 
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-brand-maroon hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          ) : (
            <Link 
              to="/auth"
              className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-brand-blue transition-all active:scale-95 shadow-sm"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>

      {/* Thin brand line accent */}
      <div className="h-[3px] w-full flex">
         <div className="h-full w-1/3 bg-brand-maroon"></div>
         <div className="h-full w-1/3 bg-brand-gold"></div>
         <div className="h-full w-1/3 bg-brand-blue"></div>
      </div>
    </header>
  );
}
