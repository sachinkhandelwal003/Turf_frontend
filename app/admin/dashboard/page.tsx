"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Shield, ShieldCheck, UserCheck, Activity, 
  ArrowUpRight, Loader2, AlertCircle, RefreshCw, Key,
  MapPin, CheckCircle, Clock, XCircle
} from 'lucide-react';
import Link from 'next/link';
import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';

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
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentTurfs, setRecentTurfs] = useState<RecentTurf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      setError(null);
      const res = await api.get('/dashboard/stats');

      if (res.data.success) {
        setStats(res.data.stats);
        setRecentUsers(res.data.recentUsers);
        setRecentTurfs(res.data.recentTurfs);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60] mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading Dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">System Error</h2>
          <p className="text-gray-500 mb-6 text-sm">{error || 'Something went wrong'}</p>
          <button onClick={fetchDashboardData} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Welcome back, {currentUser?.name}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* --- TOP KPIs --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: stats.users.total, sub: 'Registered Accounts', icon: Users, color: 'blue', link: '/admin/users' },
          { title: 'Total Venues', value: stats.turfs.total, sub: 'All listed turfs', icon: MapPin, color: 'emerald', link: '/admin/venues/list' },
          { title: 'Pending Approval', value: stats.turfs.pending, sub: 'Waiting for review', icon: Clock, color: 'amber', link: '/admin/venues/list' },
          { title: 'System Roles', value: stats.roles, sub: 'Defined RBAC Roles', icon: Shield, color: 'indigo', link: '/admin/roles' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }} 
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 group hover:border-blue-200 hover:shadow-md transition-all relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 bg-${stat.color}-50 rounded-lg group-hover:bg-blue-50 transition-colors`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600 group-hover:text-blue-600`} />
              </div>
              <Link href={stat.link} className="text-gray-300 hover:text-blue-500 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-600 mt-1">{stat.title}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Venues */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Recent Venues
            </h2>
            <Link href="/admin/venues/list" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTurfs.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No venues found</div>
            ) : (
              recentTurfs.map((t) => (
                <div key={t._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center overflow-hidden">
                      {t.images && t.images.length > 0 ? (
                        <img src={getImageUrl(t.images[0])} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <MapPin className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">Owned by {t.owner?.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      t.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {t.status}
                    </span>
                    <p className="text-[10px] text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</p>
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
          transition={{ delay: 0.4 }} 
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Recent Users
            </h2>
            <Link href="/admin/users" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map((u) => (
              <div key={u._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden border border-blue-100">
                    {u.profilePhoto ? (
                      <img src={getImageUrl(u.profilePhoto)} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      u.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    u.role === 'superadmin' ? 'bg-purple-50 text-purple-600' :
                    u.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {u.role}
                  </span>
                  <p className="text-[10px] text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* --- QUICK ACTIONS --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5 }} 
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      >
        <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" /> System Quick Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">User Distribution</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customers</span>
                <span className="font-semibold">{stats.users.customers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Admins</span>
                <span className="font-semibold">{stats.users.admins}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Super Admins</span>
                <span className="font-semibold">{stats.users.superadmins}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Venue Health</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Approved</span>
                <span className="font-semibold text-emerald-600">{stats.turfs.approved}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-amber-600">{stats.turfs.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rejected</span>
                <span className="font-semibold text-red-600">{stats.turfs.rejected}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col justify-center">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Session Info</p>
            <p className="text-sm font-bold text-blue-900">{currentUser?.name}</p>
            <p className="text-xs text-blue-700 capitalize">{currentUser?.role} Mode</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Connection</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}