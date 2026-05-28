'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Bell, User, LogOut, Menu, Crown, Search, Settings, Coins, MapPin, User as UserIcon, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import api from '@/app/services/api';

interface AdminTopbarProps {
  onMenuClick?: () => void;
}

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user, logout, isSuperadmin } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [coinValue, setCoinValue] = useState<number | null>(null);
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (isSuperadmin) {
      fetchSettings();
      fetchLeads();
    }
  }, [isSuperadmin]);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/venue-leads');
      if (res.data.success) {
        const pendingLeads = res.data.leads.filter((lead: any) => lead.status === 'pending');
        setLeadsCount(pendingLeads.length);
        setRecentLeads(pendingLeads.slice(0, 5)); // Show top 5 pending leads
      }
    } catch (error) {
      console.error("Failed to fetch leads count:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success) {
        setCoinValue(res.data.settings.coinValue);
      }
    } catch (error) {
      console.error("Failed to fetch settings in topbar:", error);
    }
  };

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

          {/* Right Actions: Notification + Profile (Adjusted Gap & Margins) */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Coin Value Display for Super Admin */}
            {isSuperadmin && coinValue !== null && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 !bg-yellow-50 rounded-xl border !border-yellow-200 group hover:!bg-yellow-100 transition-colors cursor-help" title="Current Coin Exchange Rate">
                <div className="w-8 h-8 rounded-lg !bg-yellow-100 flex items-center justify-center !text-yellow-600 group-hover:scale-110 transition-transform">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold !text-yellow-600 uppercase tracking-wider leading-none">Coin Value</p>
                  <p className="text-sm font-black !text-yellow-700">1 = ₹{coinValue}</p>
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="relative flex items-center">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 !text-slate-400 hover:!text-slate-900 !bg-transparent hover:!bg-slate-50 !border-none !shadow-none transition-all group rounded-full"
              >
                <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                {leadsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 !bg-[#1abc60] !text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 !border-white shadow-sm animate-pulse">
                    {leadsCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-[-45px] sm:right-0 mt-4 w-[calc(100vw-32px)] sm:w-[380px] !bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border !border-slate-100 z-50 flex flex-col"
                    >
                      {/* Dropdown top pointer/triangle */}
                      <div className="absolute -top-2 right-[56px] sm:right-3 w-4 h-4 !bg-white border-t border-l !border-slate-100 transform rotate-45"></div>

                      <div className="relative z-10 px-5 py-4 border-b !border-slate-100 !bg-white rounded-t-2xl flex justify-between items-center">
                        <h3 className="text-sm font-black !text-slate-900 uppercase tracking-wider">Notifications</h3>
                        {leadsCount > 0 && (
                          <span className="px-2.5 py-1 !bg-[#1abc60]/10 !text-[#1abc60] text-[10px] font-bold rounded-full">
                            {leadsCount} New
                          </span>
                        )}
                      </div>

                      <div className="relative z-10 max-h-[360px] overflow-y-auto custom-scrollbar !bg-white">
                        {recentLeads.length > 0 ? (
                          recentLeads.map((lead) => (
                            <div 
                              key={lead._id}
                              onClick={() => {
                                router.push('/admin/venue-leads');
                                setShowNotifications(false);
                              }}
                              className="px-5 py-4 hover:!bg-slate-50/80 border-b !border-slate-50 cursor-pointer transition-colors group"
                            >
                              <div className="flex gap-3 items-start">
                                <div className="w-10 h-10 rounded-xl !bg-[#1abc60]/10 flex items-center justify-center !text-[#1abc60] shrink-0 group-hover:!bg-[#1abc60] group-hover:!text-white transition-colors mt-0.5">
                                  <UserIcon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold !text-slate-900 truncate tracking-tight">{lead.groundName}</p>
                                  <p className="text-xs font-medium !text-slate-500 truncate mb-1.5">By {lead.ownerName}</p>
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold !text-slate-500 !bg-slate-100 w-fit px-2 py-0.5 rounded-md uppercase tracking-wide">
                                    <MapPin className="w-3 h-3 !text-[#1abc60]" /> 
                                    <span className="truncate max-w-[150px]">{lead.location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-5 py-12 text-center flex flex-col items-center justify-center !bg-white">
                            <div className="w-16 h-16 !bg-slate-50 rounded-full flex items-center justify-center mb-3">
                              <Bell className="w-8 h-8 !text-slate-300" />
                            </div>
                            <p className="text-sm font-bold !text-slate-600">No new enquiries</p>
                            <p className="text-xs !text-slate-400 mt-1">You're all caught up!</p>
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 p-3 !bg-white rounded-b-2xl border-t !border-slate-50">
                        <button
                          onClick={() => {
                            router.push('/admin/venue-leads');
                            setShowNotifications(false);
                          }}
                          className="w-full py-2.5 text-center !bg-slate-50 hover:!bg-slate-100 !text-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all"
                        >
                          View All Enquiries <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1.5 !bg-transparent hover:!bg-slate-50 !border-none !shadow-none rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 rounded-full !bg-slate-900 flex items-center justify-center !text-white font-bold text-sm shadow-md shadow-slate-200 group-hover:scale-105 transition-transform overflow-hidden relative border-2 !border-white">
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
                <div className="hidden lg:block text-left pr-2">
                  <p className="text-sm font-bold !text-slate-900 leading-none">{user?.name || 'Super Admin'}</p>
                  <p className="text-[10px] font-bold !text-slate-400 mt-1 uppercase tracking-tighter">View Account</p>
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
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-4 w-64 !bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border !border-slate-100 z-50 flex flex-col"
                    >
                      {/* Dropdown top pointer/triangle */}
                      <div className="absolute -top-2 right-6 w-4 h-4 !bg-white border-t border-l !border-slate-100 transform rotate-45"></div>

                      <div className="relative z-10 px-6 py-4 border-b !border-slate-50 !bg-slate-50/50 rounded-t-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full !bg-slate-900 flex items-center justify-center !text-white font-bold overflow-hidden relative">
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
                            <p className="text-sm font-bold !text-slate-900 truncate">{user?.name || 'Super Admin'}</p>
                            <p className="text-xs font-medium !text-slate-500 truncate tracking-tight">{user?.email || 'admin@example.com'}</p>
                          </div>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isSuperadmin ? '!bg-purple-50 !text-purple-700 border !border-purple-100' : '!bg-emerald-50 !text-emerald-700 border !border-emerald-100'}`}>
                          {isSuperadmin ? <Crown className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {user?.role || 'Superadmin'}
                        </div>
                      </div>
                      
                      <div className="relative z-10 p-2 !bg-white rounded-b-2xl">
                        <button
                          onClick={logout}
                          className="w-full px-4 py-2.5 text-left !bg-transparent hover:!bg-red-50 !border-none !shadow-none !text-red-600 rounded-xl flex items-center gap-3 text-sm font-semibold transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg !bg-red-50 flex items-center justify-center group-hover:!bg-red-500 group-hover:!text-white transition-colors">
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