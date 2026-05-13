"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Shield, 
  ArrowUpRight, Loader2, AlertCircle, RefreshCw,
  MapPin, Clock, Calendar, Trophy, BarChart3, PlusCircle, Trash2
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
        setStats(res.data.stats);
        setRecentTurfs(res.data.recentTurfs || []);
        setRecentUsers(res.data.recentUsers || []);
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
          // Optionally refresh stats
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
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60] mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading Dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">System Error</h2>
          <p className="text-gray-500 mb-6 text-sm">{error || 'Something went wrong'}</p>
          <button onClick={fetchDashboardData} className="px-6 py-2.5 bg-[#1abc60] text-white rounded-lg hover:bg-[#17a554] transition-colors font-medium text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 space-y-6">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Welcome back, {currentUser?.name}. Here's your system overview.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isSuperadmin && (
            <>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedTurf(''); // Reset turf when city changes
                }}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm outline-none focus:ring-2 focus:ring-[#1abc60]"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={selectedTurf}
                onChange={(e) => setSelectedTurf(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm outline-none focus:ring-2 focus:ring-[#1abc60]"
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
            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* --- REVENUE KPIs --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Wallet Revenue', value: stats.revenue?.wallet || 0, sub: 'Online payments', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100 hover:border-blue-300' },
          { title: 'Offline Booking', value: stats.revenue?.offline || 0, sub: 'Cash payments', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100 hover:border-emerald-300' },
          { title: 'Tournament Revenue', value: stats.revenue?.tournaments || 0, sub: 'From tournament entries', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100 hover:border-amber-300' },
          { title: 'Booking Head Count', value: stats.bookings?.total || 0, sub: 'Total bookings placed', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100 hover:border-purple-300', isCount: true },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.1 }} 
            className={`bg-white rounded-2xl border-[1.5px] shadow-sm p-6 group ${stat.border} hover:shadow-lg transition-all flex items-center gap-5`}
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900 leading-none tracking-tight">
                {stat.isCount ? stat.value.toLocaleString() : `₹${stat.value.toLocaleString()}`}
              </h3>
              <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- TOP KPIs --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {[
          { title: 'Total Users', value: stats.users?.total || 0, sub: 'Registered Accounts', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
          { title: 'Total Venues', value: stats.turfs?.total || 0, sub: 'All listed turfs', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' },
          { title: 'Tournaments', value: stats.tournaments?.total || 0, sub: 'Active events', icon: Trophy, color: 'text-rose-600', bg: 'bg-rose-50', border: 'hover:border-rose-200' },
          { title: 'Pending Items', value: (stats.turfs?.pending || 0) + (stats.tournaments?.pending || 0), sub: 'Needs Review', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-200' },
          { title: 'System Roles', value: stats.roles || 0, sub: 'Defined RBAC Roles', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-200' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }} 
            className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 group ${stat.border} hover:shadow-md transition-all relative flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</h3>
              <p className="text-sm font-semibold text-gray-700 mt-1">{stat.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- CHARTS SECTION --- */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* System Overview Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">System Overview</h2>
          </div>
          <div className="w-full mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#1abc60" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Venues */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> All Venues
            </h2>
            <Link href="/admin/venues/list" className="text-blue-600 text-xs font-semibold hover:text-blue-700 transition-colors">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-gray-100 flex-1 max-h-[600px] overflow-y-auto scrollbar-hide">
            {recentTurfs.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No venues found</div>
            ) : (
              recentTurfs.map((t) => (
                <div key={t._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center overflow-hidden shrink-0 border border-emerald-100">
                      {t.images && t.images.length > 0 ? (
                        <img src={getImageUrl(t.images[0])} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{t.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {(t as any).location?.city || 'N/A'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">
                          ₹{(t as any).pricePerHour || 0}/hr
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">Owner: {t.owner?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize border ${
                      t.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      t.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {t.status}
                    </span>
                    <Link
                      href={`/admin/bookings?turfId=${t._id}&action=offline`}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 mt-1 flex items-center gap-0.5"
                    >
                      <PlusCircle className="w-3 h-3" /> Book Offline
                    </Link>
                    <button
                      onClick={() => handleDeleteVenue(t._id)}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 mt-1 flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Delete Venue
                    </button>
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
          transition={{ delay: 0.5 }} 
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> All Users
            </h2>
            <Link href="/admin/users" className="text-blue-600 text-xs font-semibold hover:text-blue-700 transition-colors">
              Manage
            </Link>
          </div>
          <div className="divide-y divide-gray-100 flex-1 max-h-[600px] overflow-y-auto scrollbar-hide">
            {recentUsers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No users found</div>
            ) : (
              recentUsers.map((u) => (
                <div key={u._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden border border-blue-100 shrink-0">
                      {u.profilePhoto ? (
                        <img src={getImageUrl(u.profilePhoto)} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        u.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize border ${
                      u.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      u.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {u.role}
                    </span>
                    {u._id !== (currentUser as any).id && (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 mt-1 flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" /> Delete User
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