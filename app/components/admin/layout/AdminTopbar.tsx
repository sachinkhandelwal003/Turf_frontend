'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Bell, User, LogOut, Menu, Crown, Search, Settings } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user, logout, isSuperadmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();

  const getProfileImageUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  const profileImage = getProfileImageUrl(user?.profilePhoto);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 h-24 shrink-0">
      <div className="h-full px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          
          {/* Left: Mobile Toggle */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 !bg-transparent !border-none !shadow-none !text-slate-500 hover:!bg-slate-100 rounded-xl transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Right Actions: Notification + Profile (FIXED GAP) */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 !bg-transparent !border-none !shadow-none !text-slate-400 hover:!text-slate-900 transition-all group mr-2">
              <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#1abc60] rounded-full border-2 border-white animate-pulse"></span>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1.5 !bg-transparent !border-none !shadow-none hover:!bg-slate-50 rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform overflow-hidden relative">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt={user?.name || 'Profile'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || 'S'
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'Super Admin'}</p>
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
                      className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 py-3 z-50 overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold overflow-hidden relative">
                            {profileImage ? (
                              <Image
                                src={profileImage}
                                alt={user?.name || 'Profile'}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              user?.name?.[0]?.toUpperCase() || 'S'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Super Admin'}</p>
                            <p className="text-xs font-medium text-slate-500 truncate tracking-tight">{user?.email || 'admin@example.com'}</p>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isSuperadmin ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                          {isSuperadmin ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {user?.role || 'Superadmin'}
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={logout}
                          className="w-full px-4 py-2.5 text-left !bg-transparent !border-none !shadow-none !text-red-600 hover:!bg-red-50 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
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