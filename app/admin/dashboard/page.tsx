"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Shield, 
  Loader2, AlertCircle, RefreshCw,
  MapPin, Clock, Trophy, BarChart3, PlusCircle, Trash2, Wallet
} from 'lucide-react';
import Link from 'next/link';
import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardStats {
  users: {
    total: number;
    customers: number;
    admins: number;
    superadmins: number;
  };
  turfs: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  tournaments: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  revenue: {
    total: number;
    bookings: number;
    tournaments: number;
    wallet: number;
    offline: number;
  };
  roles: number;
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePhoto?: string;
  createdAt: string;
}

interface RecentTurf {
  _id: string;
  name: string;
  status: string;
  pricePerHour: number;
  images?: string[];
  owner: {
    name: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const { user: currentUser, isSuperadmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentTurfs, setRecentTurfs] = useState<RecentTurf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingPayout, setPendingPayout] = useState<number>(0);

  // Filters State
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTurf, setSelectedTurf] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [allTurfs, setAllTurfs] = useState<{ _id: string, name: string, city: string }[]>([]);

  const handleDeleteUser = async (id: string) => {
    if (id === (currentUser as any).id) {
      return toast.error("You cannot delete your own account");
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user account will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/auth/users/${id}`);
        if (res.data.success) {
          setRecentUsers(prev => prev.filter(u => u._id !== id));
          toast.success("User deleted successfully");
          fetchDashboardData();
        }
      } catch (error: any) {
        toast.error(error.response?.data?.msg || "Failed to delete user");
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
    if (isSuperadmin) {
      fetchAllTurfs();
    }
  }, [selectedCity, selectedTurf]);

  const fetchAllTurfs = async () => {
    try {
      const res = await api.get('/turfs');
      if (res.data.success) {
        const turfs = res.data.turfs.map((t: any) => ({
          _id: t._id,
          name: t.name,
          city: t.location.city
        }));
        setAllTurfs(turfs);
        const uniqueCities = Array.from(new Set(turfs.map((t: any) => t.city))) as string[];
        setCities(uniqueCities);
      }
    } catch (error) {
      console.error('Error fetching all turfs for filters:', error);
    }
  };

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      setError(null);
      const params = new URLSearchParams();
      if (selectedCity) params.append('city', selectedCity);
      if (selectedTurf) params.append('turfId', selectedTurf);

      const res = await api.get(`/dashboard/stats?${params.toString()}`);
      if (res.data.success) {
        let currentStats = res.data.stats;
        let turfs = res.data.recentTurfs || [];
        let users = res.data.recentUsers || [];

        // If regular Admin and stats are zero, try to fetch from billing/stats as fallback
        if (!isSuperadmin && (currentStats.revenue?.total === 0 || turfs.length === 0)) {
          try {
            const [billingRes, turfsRes] = await Promise.all([
              api.get('/billing/stats'),
              api.get('/turfs/my-turfs').catch(() => api.get('/turfs'))
            ]);

            if (billingRes.data.success) {
              const billingData = billingRes.data.data.summary;
              currentStats.revenue = {
                total: billingData.totalRevenue || 0,
                bookings: billingData.bookings?.totalRevenue || 0,
                tournaments: billingData.tournaments?.totalRevenue || 0,
                wallet: billingData.bookings?.onlineRevenue || 0,
                offline: billingData.bookings?.offlineRevenue || 0,
              };
              currentStats.bookings = {
                total: billingData.bookings?.count || 0,
                confirmed: billingData.bookings?.count || 0,
                pending: 0,
                cancelled: 0
              };
            }

            if (turfsRes.data.success) {
              const myTurfs = turfsRes.data.turfs || [];
              if (turfs.length === 0) {
                turfs = myTurfs.slice(0, 5);
              }
              currentStats.turfs.total = myTurfs.length;
            }
          } catch (fallbackErr) {
            console.error('Dashboard fallback fetch failed:', fallbackErr);
          }
        }

        setStats(currentStats);
        setRecentTurfs(turfs);
        setRecentUsers(users);

        // Calculate Pending Payout if Admin
        if (!isSuperadmin) {
          try {
            // Try to get settlements specifically for this admin
            let mySettlements = [];
            try {
              const settleRes = await api.get('/settlements/my-settlements');
              if (settleRes.data.success) {
                mySettlements = settleRes.data.settlements || settleRes.data.data || [];
              }
            } catch (err: any) {
              // If my-settlements fails, try the general one but catch its error too
              if (err.response?.status === 403 || err.response?.status === 404) {
                try {
                  const fallbackRes = await api.get('/settlements');
                  if (fallbackRes.data.success) {
                    mySettlements = fallbackRes.data.settlements || fallbackRes.data.data || [];
                  }
                } catch (fallbackErr) {
                  console.warn('Both settlement endpoints failed or are restricted');
                }
              }
            }

            const completedSettlements = mySettlements.filter((s: any) => s.status === 'completed');
            const totalPaid = completedSettlements.reduce((sum: number, s: any) => sum + s.amount, 0);
            const totalWalletShare = (currentStats.revenue?.total || 0) * 0.8;
            setPendingPayout(Math.max(0, totalWalletShare - totalPaid));
          } catch (e) {
            console.error('Error calculating pending payout:', e);
            setPendingPayout(0);
          }
        }
      } else {
        throw new Error(res.data.msg || 'Failed to load dashboard');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Failed to fetch dashboard data';
      setError(errorMsg);
      toast.error(errorMsg);
      // Set fallback data
      setStats({
        users: { total: 0, customers: 0, admins: 0, superadmins: 0 },
        turfs: { total: 0, pending: 0, approved: 0, rejected: 0 },
        bookings: { total: 0, confirmed: 0, pending: 0, cancelled: 0 },
        tournaments: { total: 0, pending: 0, approved: 0, rejected: 0 },
        revenue: { total: 0, bookings: 0, tournaments: 0, wallet: 0, offline: 0 },
        roles: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteVenue = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This venue will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/turfs/${id}`);
        if (res.data.success) {
          setRecentTurfs(prev => prev.filter(t => t._id !== id));
          toast.success("Venue deleted successfully");
          fetchDashboardData();
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to delete venue");
      }
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  // Prepare Chart Data
  const overviewData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Users', total: stats.users?.total || 0 },
      { name: 'Venues', total: stats.turfs?.total || 0 },
      { name: 'Bookings', total: stats.bookings?.total || 0 },
      { name: 'Events', total: stats.tournaments?.total || 0 },
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="!flex !flex-col !items-center !justify-center !min-h-[80vh] !bg-[#f8fafc]">
        <div className="!w-16 !h-16 !bg-emerald-50 !rounded-2xl !flex !items-center !justify-center !mb-4 !border !border-emerald-100">
          <Loader2 className="!w-8 !h-8 !animate-spin !text-[#1abc60]" />
        </div>
        <p className="!text-sm !font-bold !text-gray-500 !uppercase !tracking-widest !animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="!flex !items-center !justify-center !min-h-[80vh] !bg-[#f8fafc] !p-4">
        <div className="!text-center !bg-white !p-10 !rounded-3xl !shadow-sm !border !border-gray-200 !max-w-md">
          <AlertCircle className="!w-14 !h-14 !text-red-500 !mx-auto !mb-4" />
          <h2 className="!text-xl !font-bold !text-gray-900 !mb-2">System Error</h2>
          <p className="!text-gray-500 !mb-8 !text-sm !font-medium">{error || 'Something went wrong fetching data.'}</p>
          <button 
            onClick={fetchDashboardData} 
            className="!w-full !px-6 !py-3 !bg-[#1abc60] !text-white !rounded-xl hover:!bg-[#17a554] !transition-colors !font-bold !text-sm !border-none !cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !pt-6 !pb-12 !space-y-8 !font-sans !bg-[#f8fafc] !min-h-screen">
      
      {/* ========================================================= */}
      {/* MASTER TOP CONTAINER (Header + All KPIs in one box)       */}
      {/* ========================================================= */}
      <div className="!bg-white !rounded-[24px] !border !border-gray-200 !shadow-sm !overflow-hidden">
        
        {/* --- HEADER --- */}
        <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-6 !p-6 md:!p-8 !border-b !border-gray-100">
          <div>
            <h1 className="!text-2xl md:!text-3xl !font-bold !text-gray-900 !tracking-tight !m-0 !mb-1.5">
              {isSuperadmin ? 'Superadmin Overview' : 'Venue Partner Dashboard'}
            </h1>
            <p className="!text-gray-500 !text-sm !font-medium !m-0">
              {isSuperadmin 
                ? `Welcome back, ${currentUser?.name}. Monitor platform performance.` 
                : `Welcome back, ${currentUser?.name}. Track your venue's growth.`}
            </p>
          </div>
          <div className="!flex !flex-wrap !items-center !gap-3">
            {isSuperadmin && (
              <>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedTurf('');
                  }}
                  className="!px-4 !py-2.5 !bg-gray-50 !border !border-gray-200 !text-gray-700 !rounded-xl hover:!bg-white !text-sm !font-semibold !transition-colors !outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !appearance-none !cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <select
                  value={selectedTurf}
                  onChange={(e) => setSelectedTurf(e.target.value)}
                  className="!px-4 !py-2.5 !bg-gray-50 !border !border-gray-200 !text-gray-700 !rounded-xl hover:!bg-white !text-sm !font-semibold !transition-colors !outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !appearance-none !cursor-pointer"
                >
                  <option value="">All Grounds</option>
                  {allTurfs
                    .filter(t => !selectedCity || t.city === selectedCity)
                    .map(turf => (
                      <option key={turf._id} value={turf._id}>{turf.name}</option>
                    ))
                  }
                </select>
              </>
            )}
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="!flex !items-center !justify-center !w-11 !h-11 !bg-gray-50 !border !border-gray-200 !text-gray-600 !rounded-xl hover:!bg-white !transition-colors !cursor-pointer !disabled:!opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`!w-5 !h-5 ${refreshing ? '!animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* --- METRICS AREA --- */}
        <div className="!p-6 md:!p-8 !space-y-8 !bg-gray-50/30">
          
          {/* Revenue KPIs (Top Row) */}
          <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-5 md:!gap-6">
            {[
              { 
                title: 'Total Revenue', 
                value: stats.revenue?.total || 0, 
                sub: 'Gross platform earnings', 
                icon: BarChart3, 
                color: '!text-emerald-600', 
                bg: '!bg-emerald-50', 
                border: '!border-emerald-100 hover:!border-emerald-300' 
              },
              { 
                title: 'Pending Amount', 
                value: isSuperadmin ? (stats.revenue?.total || 0) * 0.8 : pendingPayout, 
                sub: isSuperadmin ? 'Awaiting Settlements' : 'Awaiting Payment', 
                icon: Clock, 
                color: '!text-orange-600', 
                bg: '!bg-orange-50', 
                border: '!border-orange-100 hover:!border-orange-300' 
              },
              { 
                title: 'Online Revenue', 
                value: stats.revenue?.wallet || (stats.revenue?.total || 0) - (stats.revenue?.offline || 0), 
                sub: 'Paid via Wallet/Online', 
                icon: Wallet, 
                color: '!text-blue-600', 
                bg: '!bg-blue-50', 
                border: '!border-blue-100 hover:!border-blue-300' 
              },
              { 
                title: 'Offline Revenue', 
                value: stats.revenue?.offline || 0, 
                sub: 'Cash/Direct payments', 
                icon: Shield, 
                color: '!text-purple-600', 
                bg: '!bg-purple-50', 
                border: '!border-purple-100 hover:!border-purple-300' 
              },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }} 
                className={`!bg-white !rounded-2xl !border !shadow-sm !p-6 !flex !flex-col !gap-4 ${stat.border}`}
              >
                <div className={`!w-12 !h-12 !rounded-xl ${stat.bg} !flex !items-center !justify-center !shrink-0 !border !border-white`}>
                  <stat.icon className={`!w-6 !h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="!text-[11px] !font-bold !text-gray-500 !uppercase !tracking-widest !mb-1 !m-0">{stat.title}</p>
                  <h3 className="!text-2xl md:!text-3xl !font-bold !text-gray-900 !leading-none !tracking-tight !m-0">
                    ₹{stat.value.toLocaleString()}
                  </h3>
                  <p className="!text-[10px] !text-gray-400 !font-semibold !mt-2 !uppercase !tracking-wide !m-0">{stat.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Top KPIs (Bottom Row) */}
          <div className="!grid !grid-cols-2 sm:!grid-cols-3 lg:!grid-cols-5 !gap-4 md:!gap-5">
            {[
              { title: 'Total Users', value: stats.users?.total || 0, icon: Users, color: '!text-indigo-600', bg: '!bg-indigo-50' },
              { title: 'Total Venues', value: stats.turfs?.total || 0, icon: MapPin, color: '!text-teal-600', bg: '!bg-teal-50' },
              { title: 'Tournaments', value: stats.tournaments?.total || 0, icon: Trophy, color: '!text-rose-600', bg: '!bg-rose-50' },
              { title: 'Pending Items', value: (stats.turfs?.pending || 0) + (stats.tournaments?.pending || 0), icon: Clock, color: '!text-amber-600', bg: '!bg-amber-50' },
              { title: 'System Roles', value: stats.roles || 0, icon: Shield, color: '!text-purple-600', bg: '!bg-purple-50' },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: 0.2 + (i * 0.05) }} 
                className="!bg-white !rounded-xl !border !border-gray-200 !shadow-sm !p-5 !flex !flex-col !justify-between"
              >
                <div className={`!w-10 !h-10 !rounded-lg ${stat.bg} !flex !items-center !justify-center !mb-4`}>
                  <stat.icon className={`!w-5 !h-5 ${stat.color}`} />
                </div>
                <div>
                  <h3 className="!text-2xl !font-bold !text-gray-900 !m-0">{stat.value.toLocaleString()}</h3>
                  <p className="!text-xs !font-semibold !text-gray-500 !mt-1 !m-0 !uppercase !tracking-wider">{stat.title}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
      {/* ========================================================= */}

      {/* --- CHARTS SECTION --- */}
      <div className="!grid !grid-cols-1 !gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="!bg-white !rounded-[24px] !border !border-gray-100 !shadow-sm !p-6 md:!p-8"
        >
          <div className="!flex !items-center !gap-3 !mb-6">
            <div className="!w-10 !h-10 !bg-gray-50 !rounded-xl !flex !items-center !justify-center !border !border-gray-100">
              <BarChart3 className="!w-5 !h-5 !text-gray-600" />
            </div>
            <h2 className="!text-lg !font-bold !text-gray-900 !m-0">System Overview</h2>
          </div>
          <div className="!w-full !mt-2">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={overviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="total" fill="#1abc60" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-6">
        
        {/* Recent Venues */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }} 
          className="!bg-white !rounded-[24px] !border !border-gray-100 !shadow-sm !overflow-hidden !flex !flex-col"
        >
          <div className="!px-6 !py-5 !border-b !border-gray-100 !flex !justify-between !items-center !bg-gray-50/50">
            <h2 className="!text-sm !font-bold !text-gray-900 !uppercase !tracking-wider !flex !items-center !gap-2 !m-0">
              <MapPin className="!w-4 !h-4 !text-emerald-600" /> Recent Venues
            </h2>
            <Link href="/admin/venues/list" className="!text-[#1abc60] !text-xs !font-bold hover:!underline !transition-all !no-underline">
              View All
            </Link>
          </div>
          <div className="!divide-y !divide-gray-50 !flex-1 !max-h-[500px] !overflow-y-auto !custom-scrollbar">
            {recentTurfs.length === 0 ? (
              <div className="!px-6 !py-12 !text-center !text-gray-500 !text-sm !font-medium">No venues found</div>
            ) : (
              recentTurfs.map((t) => (
                <div key={t._id} className="!px-6 !py-4 !flex !items-center !justify-between hover:!bg-gray-50/50 !transition-colors">
                  <div className="!flex !items-center !gap-4 !min-w-0">
                    <div className="!w-12 !h-12 !rounded-xl !bg-gray-100 !flex !items-center !justify-center !overflow-hidden !shrink-0 !border !border-gray-200">
                      {t.images && t.images.length > 0 ? (
                        <img src={getImageUrl(t.images[0])} alt={t.name} className="!w-full !h-full !object-cover" />
                      ) : (
                        <MapPin className="!w-5 !h-5 !text-gray-400" />
                      )}
                    </div>
                    <div className="!min-w-0">
                      <p className="!text-sm !font-bold !text-gray-900 !truncate !m-0">{t.name}</p>
                      <div className="!flex !items-center !gap-2 !mt-1">
                        <span className="!text-[10px] !font-medium !text-gray-500 !flex !items-center !gap-1">
                          <MapPin className="!w-3 !h-3" /> {(t as any).location?.city || 'N/A'}
                        </span>
                        <span className="!text-[10px] !text-emerald-600 !font-bold !bg-emerald-50 !px-1.5 !rounded !border !border-emerald-100">
                          ₹{(t as any).pricePerHour || 0}/hr
                        </span>
                      </div>
                      <p className="!text-[10px] !text-gray-400 !mt-0.5 !truncate">Owner: {t.owner?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="!flex !flex-col !items-end !gap-1.5 !shrink-0 !ml-4">
                    <span className={`!px-2.5 !py-1 !rounded-md !text-[9px] !font-bold !uppercase !tracking-widest !border ${
                      t.status === 'approved' ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200' :
                      t.status === 'rejected' ? '!bg-red-50 !text-red-700 !border-red-200' : '!bg-amber-50 !text-amber-700 !border-amber-200'
                    }`}>
                      {t.status}
                    </span>
                    <div className="!flex !gap-2">
                      <Link
                        href={`/admin/bookings?turfId=${t._id}&action=offline`}
                        className="!text-[10px] !font-bold !text-emerald-600 hover:!text-emerald-700 !mt-1 !flex !items-center !gap-0.5 !no-underline"
                        title="Book Offline"
                      >
                        <PlusCircle className="!w-3.5 !h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteVenue(t._id)}
                        className="!text-[10px] !font-bold !text-red-400 hover:!text-red-600 !mt-1 !flex !items-center !gap-0.5 !bg-transparent !border-none !cursor-pointer"
                        title="Delete Venue"
                      >
                        <Trash2 className="!w-3.5 !h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }} 
          className="!bg-white !rounded-[24px] !border !border-gray-100 !shadow-sm !overflow-hidden !flex !flex-col"
        >
          <div className="!px-6 !py-5 !border-b !border-gray-100 !flex !justify-between !items-center !bg-gray-50/50">
            <h2 className="!text-sm !font-bold !text-gray-900 !uppercase !tracking-wider !flex !items-center !gap-2 !m-0">
              <Users className="!w-4 !h-4 !text-blue-600" /> Recent Users
            </h2>
            <Link href="/admin/users" className="!text-[#1abc60] !text-xs !font-bold hover:!underline !transition-all !no-underline">
              View All
            </Link>
          </div>
          <div className="!divide-y !divide-gray-50 !flex-1 !max-h-[500px] !overflow-y-auto !custom-scrollbar">
            {recentUsers.length === 0 ? (
              <div className="!px-6 !py-12 !text-center !text-gray-500 !text-sm !font-medium">No users found</div>
            ) : (
              recentUsers.map((u) => (
                <div key={u._id} className="!px-6 !py-4 !flex !items-center !justify-between hover:!bg-gray-50/50 !transition-colors">
                  <div className="!flex !items-center !gap-4 !min-w-0">
                    <div className="!w-10 !h-10 !rounded-full !bg-blue-50 !text-blue-600 !flex !items-center !justify-center !font-bold !text-sm !overflow-hidden !border !border-blue-100 !shrink-0">
                      {u.profilePhoto ? (
                        <img src={getImageUrl(u.profilePhoto)} alt={u.name} className="!w-full !h-full !object-cover" />
                      ) : (
                        u.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="!min-w-0">
                      <p className="!text-sm !font-bold !text-gray-900 !truncate !m-0">{u.name}</p>
                      <p className="!text-[11px] !font-medium !text-gray-500 !truncate !m-0 !mt-0.5">{u.email}</p>
                      <p className="!text-[10px] !text-gray-400 !mt-0.5">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="!flex !flex-col !items-end !gap-2 !shrink-0 !ml-4">
                    <span className={`!px-2.5 !py-1 !rounded-md !text-[9px] !font-bold !uppercase !tracking-widest !border ${
                      u.role === 'superadmin' ? '!bg-purple-50 !text-purple-700 !border-purple-200' :
                      u.role === 'admin' ? '!bg-blue-50 !text-blue-700 !border-blue-200' : '!bg-gray-50 !text-gray-700 !border-gray-200'
                    }`}>
                      {u.role}
                    </span>
                    {u._id !== (currentUser as any).id && (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="!text-[10px] !font-bold !text-red-400 hover:!text-red-600 !mt-1 !flex !items-center !gap-1 !bg-transparent !border-none !cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="!w-3.5 !h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}