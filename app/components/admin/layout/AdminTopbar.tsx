'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Bell, User, LogOut, Menu, Crown, Search, Settings } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user, logout, isSuperadmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();

  const pageNames: Record<string, string> = {
    '/admin/dashboard': 'Dashboard Overview',
    '/admin/turfs': 'Turf Inventory',
    '/admin/users': 'User Management',
    '/admin/roles': 'Roles & Permissions',
    '/admin/masters': 'Master Data',
    '/admin/settings': 'System Settings',
  };

  const currentPage = pageNames[pathname] || 'Dashboard';

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 h-20 shrink-0">
      <div className="h-full px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center h-full gap-8">
          
          {/* Left: Page Title & Mobile Toggle */}
          <div className="flex items-center min-w-0 gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-slate-900 tracking-tight truncate">{currentPage}</h1>
                {isSuperadmin && (
                  <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                    <Crown className="w-3 h-3" />
                    Superadmin
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {user?.role} Portal
              </p>
            </div>
          </div>

          {/* Center: Search (Hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="w-full flex items-center bg-slate-50 border border-slate-100 rounded-2xl group focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1abc60]/10 focus-within:border-[#1abc60] transition-all">
              <div className="pl-4 pr-1 text-slate-400 group-focus-within:text-[#1abc60] transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search across platform..." 
                className="flex-1 px-3 py-2.5 bg-transparent border-none text-sm outline-none font-medium placeholder:text-slate-400 focus:ring-0"
              />
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notifications */}
            <button className="relative p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#1abc60] rounded-full border-2 border-white animate-pulse"></span>
            </button>

            {/* Settings */}
            <button className="hidden sm:flex p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
              <Settings className="w-5 h-5" />
            </button>

            <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block"></div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-2xl transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-black text-slate-900 leading-none">{user?.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">View Account</p>
                </div>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 py-3 z-50 overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black">
                            {user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{user?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate tracking-tight">{user?.email}</p>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isSuperadmin ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                          {isSuperadmin ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {user?.role}
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={logout}
                          className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50 rounded-2xl flex items-center gap-3 text-xs font-black transition-all group"
                        >
                          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <LogOut className="w-4 h-4" />
                          </div>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}