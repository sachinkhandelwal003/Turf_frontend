"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Shield, ShieldCheck, UserCheck, Activity, 
  ArrowUpRight, Loader2, AlertCircle, RefreshCw, Key
} from 'lucide-react';
import Link from 'next/link';
import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  permissions: string[];
  createdAt: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/auth/roles')
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (rolesRes.data.success) setRoles(rolesRes.data.roles);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60] mb-4" />
        <p className="text-gray-500 font-medium text-sm">Loading Security Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">System Error</h2>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <button onClick={fetchDashboardData} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const superadmins = users.filter(u => u.role === 'superadmin');
  const admins = users.filter(u => u.role === 'admin');
  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Overview</h1>
          <p className="text-gray-500 mt-1 text-sm">Monitoring system access, roles, and user permissions.</p>
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
          { title: 'Total Users', value: users.length, sub: 'Registered Accounts', icon: Users, color: 'blue', link: '/admin/users' },
          { title: 'Super Admins', value: superadmins.length, sub: 'Full System Access', icon: ShieldCheck, color: 'purple', link: '/admin/users' },
          { title: 'Administrators', value: admins.length, sub: 'Management Access', icon: Shield, color: 'indigo', link: '/admin/users' },
          { title: 'System Roles', value: roles.length, sub: 'Defined RBAC Roles', icon: Key, color: 'emerald', link: '/admin/roles' },
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

      {/* --- BOTTOM ROW: RECENT USERS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Users List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" /> Recent User Activity
            </h2>
            <Link href="/admin/users" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-gray-500 text-xs font-medium uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.slice(0, 5).map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        u.role === 'superadmin' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        u.role === 'admin' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick System Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }} 
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" /> Access Status
          </h2>
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-emerald-900">Backend API</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 uppercase">Operational</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Session</p>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium text-sm">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs font-medium text-blue-600 capitalize">{currentUser?.role}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 leading-relaxed">
                The RBAC system is currently protecting <span className="text-gray-900 font-medium">{roles.length} roles</span> and managing <span className="text-gray-900 font-medium">{users.length} unique identities</span> across the platform.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}