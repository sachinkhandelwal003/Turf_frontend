"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, CreditCard, TrendingUp, Users, Trophy, 
  ArrowUpRight, ArrowDownRight, IndianRupee, 
  Calendar, CheckCircle2, Search, Download,
  Filter, ChevronDown, RefreshCw, X, Eye, 
  Wallet, PieChart, Activity, CheckCircle, Clock, FileText, Plus
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';

interface Settlement {
  _id: string;
  admin: { _id: string; name: string; email: string };
  amount: number;
  type: 'payout' | 'recovery';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId: string;
  notes: string;
  settledAt: string;
  createdAt: string;
}

interface SummaryStats {
  bookings: {
    totalRevenue: number;
    onlineRevenue: number;
    offlineRevenue: number;
    count: number;
  };
  tournaments: {
    totalRevenue: number;
    count: number;
  };
  totalRevenue: number;
}

interface AdminBreakdown {
  adminId: string;
  name: string;
  email: string;
  bookingRevenue: {
    total: number;
    online: number;
    offline: number;
  };
  tournamentRevenue: number;
  totalRevenue: number;
}

interface Transaction {
  _id: string;
  turf: { name: string };
  user: { name: string; email: string };
  paidAmount: number;
  isOffline: boolean;
  paymentMethod?: string;
  createdAt: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [adminBreakdown, setAdminBreakdown] = useState<AdminBreakdown[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dynamic Filtering States
  const [dateRange, setDateRange] = useState("all"); 
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  // Modal State 
  const [selectedAdmin, setSelectedAdmin] = useState<AdminBreakdown | null>(null); 
  const [showAdminModal, setShowAdminModal] = useState(false); 
  const [activeTab, setActiveTab] = useState<'overview' | 'settlements'>('overview'); 
  const [settlements, setSettlements] = useState<Settlement[]>([]); 
  const [showSettlementModal, setShowSettlementModal] = useState(false); 
  const [newSettlement, setNewSettlement] = useState({
    adminId: '',
    amount: '',
    type: 'payout',
    paymentMethod: 'UPI',
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    fetchBillingData();
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      const res = await api.get('/settlements');
      if (res.data.success) {
        setSettlements(res.data.settlements);
      }
    } catch (error) {
      console.error('Error fetching settlements:', error);
    }
  };

  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/settlements', newSettlement);
      if (res.data.success) {
        toast.success('Settlement recorded successfully');
        setShowSettlementModal(false);
        fetchSettlements();
        setNewSettlement({
          adminId: '',
          amount: '',
          type: 'payout',
          paymentMethod: 'UPI',
          transactionId: '',
          notes: ''
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to record settlement');
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [dateRange, customDates]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      let params: any = {};
      if (dateRange !== "all") {
        const now = new Date();
        let start = new Date();
        
        if (dateRange === "today") {
          start.setHours(0, 0, 0, 0);
        } else if (dateRange === "week") {
          start.setDate(now.getDate() - 7);
        } else if (dateRange === "month") {
          start.setMonth(now.getMonth() - 1);
        } else if (dateRange === "custom" && customDates.start) {
          start = new Date(customDates.start);
        }
        
        params.startDate = start.toISOString();
        if (dateRange === "custom" && customDates.end) {
          params.endDate = new Date(customDates.end).toISOString();
        } else {
          params.endDate = now.toISOString();
        }
      }

      const res = await api.get('/billing/stats', { params });
      if (res.data.success) {
        setSummary(res.data.data.summary);
        setAdminBreakdown(res.data.data.adminBreakdown || []);
        setRecentTransactions(res.data.data.recentTransactions || []);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Failed to fetch billing data";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = adminBreakdown.filter(admin => 
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAdminStats = (adminId: string, totalRevenue: number) => {
    const adminSettlements = settlements.filter(s => s.admin?._id === adminId && s.status === 'completed');
    const totalPaid = adminSettlements.reduce((sum, s) => sum + s.amount, 0);
    const totalWalletShare = totalRevenue * 0.8;
    const pending = Math.max(0, totalWalletShare - totalPaid);
    return { totalPaid, pending };
  };

  if (loading && !summary) {
    return (
      <div className="!min-h-[80vh] !flex !flex-col !items-center !justify-center !bg-[#f8fafc]">
        <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60] !mb-4" />
        <p className="!text-sm !font-medium !text-gray-500">Loading Billing Data...</p>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !bg-[#f8fafc] !p-4 lg:!p-8 !font-sans !space-y-6">
      
      {/* Header & Filters */}
      <div className="!flex !flex-col lg:!flex-row lg:!items-center !justify-between !gap-5 !bg-white !p-6 !rounded-2xl !border !border-gray-100 !shadow-sm">
        <div>
          <h1 className="!text-2xl !font-bold !text-gray-900 !tracking-tight !m-0">
            {isSuperAdmin ? 'Billing Dashboard' : 'Venue Revenue Dashboard'}
          </h1>
          <p className="!text-sm !font-medium !text-gray-500 !mt-1.5">
            {isSuperAdmin ? 'Real-time revenue tracking across platform' : 'Track your venue\'s earnings and bookings'}
          </p>
        </div>
        
        <div className="!flex !flex-wrap !items-center !gap-3">
          <div className="!flex !items-center !bg-gray-50/80 !rounded-xl !p-1.5 !border !border-gray-200/60">
            {['all', 'today', 'week', 'month', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`!px-4 !py-2 !text-[13px] !font-semibold !rounded-lg !transition-all !capitalize !border-none !cursor-pointer ${
                  dateRange === range 
                  ? '!bg-white !text-[#1abc60] !shadow-sm !border !border-gray-200' 
                  : '!bg-transparent !text-gray-500 hover:!text-gray-800 hover:!bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="!flex !items-center !gap-2 !bg-white !p-1.5 !rounded-xl !border !border-gray-200">
              <input 
                type="date" 
                value={customDates.start}
                onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                className="!text-[13px] !font-medium !text-gray-700 !bg-transparent !px-2 !py-1.5 focus:!outline-none"
              />
              <span className="!text-xs !text-gray-400 !font-medium">to</span>
              <input 
                type="date" 
                value={customDates.end}
                onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                className="!text-[13px] !font-medium !text-gray-700 !bg-transparent !px-2 !py-1.5 focus:!outline-none"
              />
            </div>
          )}

          <button 
            onClick={fetchBillingData}
            disabled={loading}
            className="!p-2.5 !bg-[#1abc60] !text-white !rounded-xl hover:!bg-[#17a554] !transition-all !shadow-sm hover:!shadow-md disabled:!opacity-50 !border-none !cursor-pointer !flex !items-center !justify-center"
          >
            <RefreshCw className={`!w-4 !h-4 ${loading ? '!animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
        <div className="!flex !items-center !gap-2 !p-1.5 !bg-gray-200/50 !rounded-xl !w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`!px-6 !py-2.5 !rounded-lg !text-[13px] !font-semibold !transition-all !cursor-pointer !border-none ${
              activeTab === 'overview' 
                ? '!bg-white !text-gray-900 !shadow-sm' 
                : '!bg-transparent !text-gray-500 hover:!text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('settlements')}
            className={`!px-6 !py-2.5 !rounded-lg !text-[13px] !font-semibold !transition-all !cursor-pointer !border-none ${
              activeTab === 'settlements' 
                ? '!bg-white !text-gray-900 !shadow-sm' 
                : '!bg-transparent !text-gray-500 hover:!text-gray-700'
            }`}
          >
            Payment Settlements
          </button>
        </div>

        <div className="!bg-blue-50/80 !px-4 !py-2.5 !rounded-xl !border !border-blue-100 !flex !items-center !gap-3">
          <Clock className="!w-4 !h-4 !text-blue-600" />
          <div className="!flex !flex-col">
            <span className="!text-[10px] !font-bold !text-blue-500 !uppercase !tracking-wider">Current Cycle</span>
            <span className="!text-xs !font-semibold !text-blue-800">Weekly (Mon - Sun)</span>
          </div>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Revenue Overview Card */}
          <div className="!bg-gradient-to-br !from-[#1abc60] !to-[#128a43] !p-8 !rounded-2xl !text-white !shadow-lg !shadow-[#1abc60]/20 !flex !flex-col md:!flex-row !justify-between !items-center !gap-8">
            <div>
              <h2 className="!text-xl !font-bold !tracking-wide !m-0">
                {isSuperAdmin ? 'Platform Revenue Overview' : 'My Revenue Overview'}
              </h2>
              <p className="!text-sm !font-medium !text-white/80 !mt-2">Persistent tracking of all bookings and settlements</p>
            </div>
            <div className="!flex !flex-wrap !gap-8 md:!gap-12">
              <div className="!text-center md:!text-left">
                <p className="!text-xs !font-bold !text-white/70 !uppercase !tracking-wider !mb-1">Gross Revenue</p>
                <p className="!text-3xl !font-bold !m-0">₹{summary?.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="!text-center md:!text-left">
                <p className="!text-xs !font-bold !text-white/70 !uppercase !tracking-wider !mb-1">Net Earned (80%)</p>
                <p className="!text-3xl !font-bold !m-0">₹{((summary?.totalRevenue || 0) * 0.8).toLocaleString()}</p>
              </div>
              <div className="!text-center md:!text-left">
                <p className="!text-xs !font-bold !text-white/70 !uppercase !tracking-wider !mb-1">Total Paid</p>
                <p className="!text-3xl !font-bold !m-0">
                  ₹{settlements.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
        
        <div className="!bg-white !p-6 !rounded-2xl !border !border-gray-100 !shadow-sm hover:!shadow-md !transition-shadow">
          <div className="!flex !items-center !justify-between !mb-4">
            <div className="!p-3 !bg-emerald-50 !rounded-xl">
              <IndianRupee className="!w-5 !h-5 !text-[#1abc60]" />
            </div>
            <TrendingUp className="!w-4 !h-4 !text-emerald-500" />
          </div>
          <p className="!text-[13px] !font-medium !text-gray-500 !mb-1 !m-0">Total Revenue</p>
          <h3 className="!text-2xl !font-bold !text-gray-900 !m-0">
            ₹{summary?.totalRevenue.toLocaleString() || 0}
          </h3>
          <div className="!mt-4 !pt-4 !border-t !border-gray-100 !flex !flex-col !gap-2 !text-xs !font-semibold">
            <div className="!flex !justify-between !text-blue-600">
              <span>Wallet (80%):</span>
              <span>₹{( (summary?.totalRevenue || 0) * 0.8).toLocaleString()}</span>
            </div>
            <div className="!flex !justify-between !text-orange-600">
              <span>Comm. (20%):</span>
              <span>₹{( (summary?.totalRevenue || 0) * 0.2).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="!bg-white !p-6 !rounded-2xl !border !border-gray-100 !shadow-sm hover:!shadow-md !transition-shadow">
          <div className="!flex !items-center !justify-between !mb-4">
            <div className="!p-3 !bg-blue-50 !rounded-xl">
              <Calendar className="!w-5 !h-5 !text-blue-600" />
            </div>
            <span className="!text-[11px] !font-bold !text-blue-700 !bg-blue-50 !px-2.5 !py-1 !rounded-md">
              {summary?.bookings.count || 0} Bookings
            </span>
          </div>
          <p className="!text-[13px] !font-medium !text-gray-500 !mb-1 !m-0">Booking Revenue</p>
          <h3 className="!text-2xl !font-bold !text-gray-900 !m-0">
            ₹{summary?.bookings.totalRevenue.toLocaleString() || 0}
          </h3>
          <div className="!mt-4 !pt-4 !border-t !border-gray-100 !flex !justify-between !text-xs !font-medium !text-gray-600">
            <span>On: <span className="!font-semibold !text-gray-900">₹{summary?.bookings.onlineRevenue.toLocaleString() || 0}</span></span>
            <span>Off: <span className="!font-semibold !text-gray-900">₹{summary?.bookings.offlineRevenue.toLocaleString() || 0}</span></span>
          </div>
        </div>

        <div className="!bg-white !p-6 !rounded-2xl !border !border-gray-100 !shadow-sm hover:!shadow-md !transition-shadow">
          <div className="!flex !items-center !justify-between !mb-4">
            <div className="!p-3 !bg-purple-50 !rounded-xl">
              <Trophy className="!w-5 !h-5 !text-purple-600" />
            </div>
            <span className="!text-[11px] !font-bold !text-purple-700 !bg-purple-50 !px-2.5 !py-1 !rounded-md">
              {summary?.tournaments.count || 0} Teams
            </span>
          </div>
          <p className="!text-[13px] !font-medium !text-gray-500 !mb-1 !m-0">Tournament Revenue</p>
          <h3 className="!text-2xl !font-bold !text-gray-900 !m-0">
            ₹{summary?.tournaments.totalRevenue.toLocaleString() || 0}
          </h3>
        </div>

        <div className="!bg-white !p-6 !rounded-2xl !border !border-gray-100 !shadow-sm hover:!shadow-md !transition-shadow">
          <div className="!flex !items-center !justify-between !mb-4">
            <div className="!p-3 !bg-orange-50 !rounded-xl">
              <Users className="!w-5 !h-5 !text-orange-600" />
            </div>
            <CheckCircle2 className="!w-4 !h-4 !text-orange-500" />
          </div>
          <p className="!text-[13px] !font-medium !text-gray-500 !mb-1 !m-0">Active Admins</p>
          <h3 className="!text-2xl !font-bold !text-gray-900 !m-0">
            {adminBreakdown.length}
          </h3>
        </div>
      </div>

      {/* Admin Breakdown Table (Only for Super Admin) */}
      {isSuperAdmin && (
        <div className="!bg-white !rounded-2xl !border !border-gray-100 !shadow-sm !overflow-hidden">
          <div className="!p-6 !border-b !border-gray-100 !flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
            <h2 className="!text-lg !font-bold !text-gray-900 !m-0">Admin-wise Revenue</h2>
            <div className="!relative">
              <Search className="!w-4 !h-4 !absolute !left-3.5 !top-1/2 !-translate-y-1/2 !text-gray-400" />
              <input 
                type="text" 
                placeholder="Search admin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-10 !pr-4 !py-2.5 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-sm !font-medium !outline-none focus:!border-[#1abc60] focus:!bg-white focus:!ring-2 focus:!ring-[#1abc60]/10 !w-full md:!w-72 !transition-all"
              />
            </div>
          </div>
          <div className="!overflow-x-auto">
            <table className="!w-full !text-left !min-w-[800px]">
              <thead>
                <tr className="!bg-gray-50/80 !border-b !border-gray-100">
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Admin Info</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Bookings</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Tournaments</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Wallet (80%)</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Paid</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Pending</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Total</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider !text-right">Action</th>
                </tr>
              </thead>
              <tbody className="!divide-y !divide-gray-50">
                {filteredAdmins.map((admin) => {
                  const stats = getAdminStats(admin.adminId, admin.totalRevenue);
                  return (
                    <tr key={admin.adminId} className="hover:!bg-gray-50/80 !transition-colors">
                      <td className="!px-6 !py-4">
                        <div className="!flex !items-center !gap-3">
                          <div className="!w-9 !h-9 !rounded-xl !bg-emerald-50 !text-[#1abc60] !font-bold !flex !items-center !justify-center !text-sm">
                            {getInitials(admin.name)}
                          </div>
                          <div className="!flex !flex-col">
                            <span className="!font-semibold !text-[13px] !text-gray-900">{admin.name}</span>
                            <span className="!text-[11px] !font-medium !text-gray-500">{admin.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="!px-6 !py-4">
                        <div className="!flex !flex-col">
                          <span className="!text-sm !font-semibold !text-gray-900">₹{admin.bookingRevenue.total.toLocaleString()}</span>
                          <div className="!flex !gap-2 !text-[11px] !font-medium !text-gray-500 !mt-0.5">
                            <span>On: ₹{admin.bookingRevenue.online.toLocaleString()}</span>
                            <span>Off: ₹{admin.bookingRevenue.offline.toLocaleString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="!px-6 !py-4">
                        <span className="!text-sm !font-semibold !text-gray-900">₹{admin.tournamentRevenue.toLocaleString()}</span>
                      </td>
                      <td className="!px-6 !py-4">
                        <div className="!flex !flex-col">
                          <span className="!text-sm !font-bold !text-blue-600">
                            ₹{(admin.totalRevenue * 0.8).toLocaleString()}
                          </span>
                          <span className="!text-[10px] !text-gray-400 !font-medium !uppercase !tracking-wider !mt-0.5">Total Share</span>
                        </div>
                      </td>
                      <td className="!px-6 !py-4">
                        <span className="!text-sm !font-bold !text-emerald-600">
                          ₹{stats.totalPaid.toLocaleString()}
                        </span>
                      </td>
                      <td className="!px-6 !py-4">
                        <span className={`!text-sm !font-bold ${stats.pending > 0 ? '!text-orange-600' : '!text-gray-400'}`}>
                          ₹{stats.pending.toLocaleString()}
                        </span>
                      </td>
                      <td className="!px-6 !py-4">
                        <span className="!text-sm !font-bold !text-[#1abc60]">
                          ₹{admin.totalRevenue.toLocaleString()}
                        </span>
                      </td>
                      <td className="!px-6 !py-4 !text-right">
                        <button 
                          onClick={() => {
                            setNewSettlement(prev => ({ 
                              ...prev, 
                              adminId: admin.adminId, 
                              amount: stats.pending.toString() 
                            }));
                            setShowSettlementModal(true);
                          }}
                          disabled={stats.pending <= 0}
                          className="!px-4 !py-2 !bg-[#1abc60] !text-white !rounded-lg !text-[13px] !font-semibold hover:!bg-[#169c4e] !transition-colors disabled:!opacity-50 disabled:!bg-gray-300 disabled:!text-gray-500 !border-none !cursor-pointer"
                        >
                          Settle Now
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={8} className="!px-6 !py-12 !text-center !text-gray-500 !text-sm !font-medium">
                      No admins found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="!bg-white !rounded-2xl !border !border-gray-100 !shadow-sm !overflow-hidden">
        <div className="!p-6 !border-b !border-gray-100">
          <h2 className="!text-lg !font-bold !text-gray-900 !m-0">Recent Transactions</h2>
        </div>
        <div className="!overflow-x-auto">
          <table className="!w-full !text-left !min-w-[800px]">
            <thead>
              <tr className="!bg-gray-50/80 !border-b !border-gray-100">
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Date</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Customer</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Venue</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Type</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Wallet (80%)</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Comm. (20%)</th>
                  <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider !text-right">Amount</th>
                </tr>
            </thead>
            <tbody className="!divide-y !divide-gray-50">
              {recentTransactions.slice(0, 10).map((tx) => (
                <tr key={tx._id} className="hover:!bg-gray-50/80 !transition-colors">
                  <td className="!px-6 !py-4 !text-[13px] !font-medium !text-gray-600">
                    {new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="!px-6 !py-4">
                    <div className="!flex !flex-col">
                      <span className="!text-[13px] !font-semibold !text-gray-900">{tx.user?.name || 'Unknown User'}</span>
                      <span className="!text-[11px] !font-medium !text-gray-500">{tx.user?.email || ''}</span>
                    </div>
                  </td>
                  <td className="!px-6 !py-4">
                    <div className="!flex !items-center !gap-2">
                      <Activity className="!w-4 !h-4 !text-gray-400" />
                      <span className="!text-[13px] !font-medium !text-gray-700">{tx.turf?.name || 'Unknown Venue'}</span>
                    </div>
                  </td>
                  <td className="!px-6 !py-4">
                    {(() => {
                      const isOffline = tx.isOffline === true;
                      return (
                        <span className={`!px-2.5 !py-1 !rounded-md !text-[11px] !font-bold !uppercase !tracking-wider ${
                          isOffline ? '!bg-orange-50 !text-orange-700' : '!bg-blue-50 !text-blue-700'
                        }`}>
                          {isOffline ? 'Offline' : 'Online'}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="!px-6 !py-4">
                    <span className="!text-sm !font-semibold !text-blue-600">
                      ₹{(tx.paidAmount * 0.8).toLocaleString()}
                    </span>
                  </td>
                  <td className="!px-6 !py-4">
                    <span className="!text-sm !font-semibold !text-orange-600">
                      ₹{(tx.paidAmount * 0.2).toLocaleString()}
                    </span>
                  </td>
                  <td className="!px-6 !py-4 !text-right">
                    <span className="!text-sm !font-bold !text-gray-900">
                      ₹{tx.paidAmount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="!px-6 !py-12 !text-center !text-gray-500 !text-sm !font-medium">
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

        </>
      ) : (
        <div className="!space-y-6">
          <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4 !bg-white !p-6 !rounded-2xl !border !border-gray-100 !shadow-sm">
            <div>
              <h2 className="!text-xl !font-bold !text-gray-900 !m-0">Payout & Paid History</h2>
              <p className="!text-sm !font-medium !text-gray-500 !mt-1.5">Track all settlements and weekly payments to ground owners</p>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => setShowSettlementModal(true)}
                className="!flex !items-center !justify-center !gap-2 !bg-[#1abc60] !text-white !px-5 !py-2.5 !rounded-xl !text-[13px] !font-semibold !hover:!bg-[#169c4e] !transition-all !shadow-sm hover:!shadow-md !cursor-pointer !border-none"
              >
                <Plus className="!w-4 !h-4" /> New Payout
              </button>
            )}
          </div>

          <div className="!bg-white !rounded-2xl !border !border-gray-100 !shadow-sm !overflow-hidden">
            <div className="!overflow-x-auto">
              <table className="!w-full !text-left !min-w-[800px]">
                <thead>
                  <tr className="!bg-gray-50/80 !border-b !border-gray-100">
                    <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Date</th>
                    <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Ground Owner</th>
                    <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Type</th>
                    <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Amount</th>
                    <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Status</th>
                    <th className="!px-6 !py-4 !text-xs !font-bold !text-gray-500 !uppercase !tracking-wider">Weekly Report</th>
                  </tr>
                </thead>
                <tbody className="!divide-y !divide-gray-50">
                  {settlements.map((s) => (
                    <tr key={s._id} className="hover:!bg-gray-50/80 !transition-colors">
                      <td className="!px-6 !py-4 !text-[13px] !font-medium !text-gray-600">
                        {new Date(s.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="!px-6 !py-4">
                        <div className="!flex !flex-col">
                          <span className="!text-[13px] !font-semibold !text-gray-900">{s.admin?.name}</span>
                          <span className="!text-[11px] !font-medium !text-gray-500">{s.admin?.email}</span>
                        </div>
                      </td>
                      <td className="!px-6 !py-4">
                        <span className={`!px-2.5 !py-1 !rounded-md !text-[11px] !font-bold !uppercase !tracking-wider ${
                          s.type === 'payout' ? '!bg-blue-50 !text-blue-700' : '!bg-orange-50 !text-orange-700'
                        }`}>
                          {s.type}
                        </span>
                      </td>
                      <td className="!px-6 !py-4 !text-sm !font-bold !text-gray-900">
                        ₹{s.amount.toLocaleString()}
                      </td>
                      <td className="!px-6 !py-4">
                        <div className="!flex !items-center !gap-1.5 !text-emerald-600 !font-semibold !text-[13px] !capitalize">
                          <CheckCircle className="!w-4 !h-4" /> {s.status}
                        </div>
                      </td>
                      <td className="!px-6 !py-4">
                        <span className="!text-[11px] !font-semibold !text-gray-600 !bg-gray-100 !px-2.5 !py-1 !rounded-md">
                          Week {Math.ceil(new Date(s.createdAt).getDate() / 7)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {settlements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="!px-6 !py-12 !text-center !text-gray-400 !font-medium">
                        No settlements recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Settlement Modal */}
      <AnimatePresence>
        {showSettlementModal && (
          <div className="!fixed !inset-0 !bg-gray-900/40 !z-[999] !flex !items-center !justify-center !p-4 !backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="!bg-white !rounded-3xl !w-full !max-w-md !shadow-2xl !border !border-gray-100 !overflow-hidden"
            >
              <div className="!p-6 !border-b !border-gray-100 !flex !items-center !justify-between !bg-gray-50/50">
                <h3 className="!text-lg !font-bold !text-gray-900 !m-0">New Settlement</h3>
                <button onClick={() => setShowSettlementModal(false)} className="!p-2 !bg-white hover:!bg-gray-100 !rounded-xl !text-gray-400 hover:!text-gray-600 !transition-colors !border !border-gray-200 !cursor-pointer">
                  <X className="!w-4 !h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateSettlement} className="!p-6 !space-y-5">
                <div>
                  <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !mb-2">Select Admin (Owner)</label>
                  <select
                    required
                    value={newSettlement.adminId}
                    onChange={(e) => setNewSettlement({ ...newSettlement, adminId: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-[13px] !font-medium !text-gray-700 !outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all"
                  >
                    <option value="">Select Owner</option>
                    {adminBreakdown.map(admin => (
                      <option key={admin.adminId} value={admin.adminId}>{admin.name}</option>
                    ))}
                  </select>
                </div>
                <div className="!grid !grid-cols-2 !gap-4">
                  <div>
                    <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={newSettlement.amount}
                      onChange={(e) => setNewSettlement({ ...newSettlement, amount: e.target.value })}
                      className="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-[13px] !font-medium !text-gray-700 !outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !mb-2">Type</label>
                    <select
                      value={newSettlement.type}
                      onChange={(e) => setNewSettlement({ ...newSettlement, type: e.target.value as any })}
                      className="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-[13px] !font-medium !text-gray-700 !outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all"
                    >
                      <option value="payout">Payout (We pay)</option>
                      <option value="recovery">Recovery (They pay)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !mb-2">Transaction ID</label>
                  <input
                    type="text"
                    value={newSettlement.transactionId}
                    onChange={(e) => setNewSettlement({ ...newSettlement, transactionId: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-[13px] !font-medium !text-gray-700 !outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all"
                    placeholder="UTR / Ref No."
                  />
                </div>
                <div>
                  <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !mb-2">Notes</label>
                  <textarea
                    value={newSettlement.notes}
                    onChange={(e) => setNewSettlement({ ...newSettlement, notes: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-[13px] !font-medium !text-gray-700 !outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all !h-24 !resize-none"
                    placeholder="Add any payment details or remarks..."
                  />
                </div>
                <button
                  type="submit"
                  className="!w-full !py-3.5 !bg-[#1abc60] !text-white !rounded-xl !font-bold !text-[13px] !hover:!bg-[#169c4e] !transition-all !shadow-sm hover:!shadow-md !mt-2 !cursor-pointer !border-none"
                >
                  Confirm Settlement
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Details Modal */}
      <AnimatePresence>
        {showAdminModal && selectedAdmin && (
          <div className="!fixed !inset-0 !bg-gray-900/40 !z-[999] !flex !items-center !justify-center !p-4 !backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="!bg-white !rounded-3xl !w-full !max-w-2xl !max-h-[90vh] !overflow-y-auto !shadow-2xl !border !border-gray-100"
            >
              {/* Modal Header */}
              <div className="!p-6 !border-b !border-gray-100 !flex !items-center !justify-between !sticky !top-0 !bg-white/90 !backdrop-blur-md !z-10">
                <div className="!flex !items-center !gap-4">
                  <div className="!w-12 !h-12 !rounded-2xl !bg-emerald-50 !text-[#1abc60] !font-bold !flex !items-center !justify-center !text-xl">
                    {getInitials(selectedAdmin.name)}
                  </div>
                  <div>
                    <h3 className="!text-xl !font-bold !text-gray-900 !m-0">{selectedAdmin.name}</h3>
                    <p className="!text-[13px] !text-gray-500 !m-0 !font-medium">{selectedAdmin.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdminModal(false)}
                  className="!p-2 !bg-white hover:!bg-gray-100 !rounded-xl !text-gray-400 hover:!text-gray-600 !transition-colors !border !border-gray-200 !cursor-pointer"
                >
                  <X className="!w-5 !h-5" />
                </button>
              </div>

              <div className="!p-6 sm:!p-8 !space-y-8">
                {/* Stats Overview */}
                <div className="!grid !grid-cols-1 sm:!grid-cols-3 !gap-4">
                  <div className="!bg-emerald-50/50 !p-5 !rounded-2xl !border !border-emerald-100/50">
                    <div className="!flex !items-center !gap-2 !mb-3">
                      <Wallet className="!w-4 !h-4 !text-[#1abc60]" />
                      <span className="!text-[11px] !font-bold !text-[#1abc60] !uppercase !tracking-wider">Total Earnings</span>
                    </div>
                    <p className="!text-2xl !font-bold !text-gray-900 !m-0">₹{selectedAdmin.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="!bg-blue-50/50 !p-5 !rounded-2xl !border !border-blue-100/50">
                    <div className="!flex !items-center !gap-2 !mb-3">
                      <Calendar className="!w-4 !h-4 !text-blue-600" />
                      <span className="!text-[11px] !font-bold !text-blue-600 !uppercase !tracking-wider">Booking Revenue</span>
                    </div>
                    <p className="!text-2xl !font-bold !text-gray-900 !m-0">₹{selectedAdmin.bookingRevenue.total.toLocaleString()}</p>
                  </div>
                  <div className="!bg-purple-50/50 !p-5 !rounded-2xl !border !border-purple-100/50">
                    <div className="!flex !items-center !gap-2 !mb-3">
                      <Trophy className="!w-4 !h-4 !text-purple-600" />
                      <span className="!text-[11px] !font-bold !text-purple-600 !uppercase !tracking-wider">Tournament Fees</span>
                    </div>
                    <p className="!text-2xl !font-bold !text-gray-900 !m-0">₹{selectedAdmin.tournamentRevenue.toLocaleString()}</p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="!space-y-4">
                  <h4 className="!text-sm !font-bold !text-gray-900 !uppercase !tracking-wider !flex !items-center !gap-2">
                    <PieChart className="!w-4 !h-4 !text-[#1abc60]" /> Revenue Split
                  </h4>
                  
                  <div className="!space-y-3">
                    <div className="!flex !items-center !justify-between !p-4 !bg-white !rounded-2xl !border !border-gray-100 !shadow-sm">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-2.5 !h-2.5 !rounded-full !bg-blue-500" />
                        <span className="!text-[13px] !font-semibold !text-gray-700">Online Bookings</span>
                      </div>
                      <span className="!text-[15px] !font-bold !text-gray-900">₹{selectedAdmin.bookingRevenue.online.toLocaleString()}</span>
                    </div>
                    
                    <div className="!flex !items-center !justify-between !p-4 !bg-white !rounded-2xl !border !border-gray-100 !shadow-sm">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-2.5 !h-2.5 !rounded-full !bg-orange-500" />
                        <span className="!text-[13px] !font-semibold !text-gray-700">Offline Bookings</span>
                      </div>
                      <span className="!text-[15px] !font-bold !text-gray-900">₹{selectedAdmin.bookingRevenue.offline.toLocaleString()}</span>
                    </div>

                    <div className="!flex !items-center !justify-between !p-4 !bg-white !rounded-2xl !border !border-gray-100 !shadow-sm">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-2.5 !h-2.5 !rounded-full !bg-purple-500" />
                        <span className="!text-[13px] !font-semibold !text-gray-700">Tournaments</span>
                      </div>
                      <span className="!text-[15px] !font-bold !text-gray-900">₹{selectedAdmin.tournamentRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="!p-5 !bg-[#1abc60]/5 !rounded-2xl !border !border-[#1abc60]/20 !flex !items-start sm:!items-center !gap-4">
                  <div className="!w-10 !h-10 !bg-[#1abc60] !rounded-xl !flex !items-center !justify-center !shrink-0">
                    <Activity className="!w-5 !h-5 !text-white" />
                  </div>
                  <div>
                    <p className="!text-[11px] !font-bold !text-[#1abc60] !uppercase !tracking-wider !m-0 !mb-1">Performance Note</p>
                    <p className="!text-[13px] !text-emerald-800 !m-0 !font-medium !leading-snug">
                      This admin accounts for {((selectedAdmin.totalRevenue / (summary?.totalRevenue || 1)) * 100).toFixed(1)}% of the total platform revenue.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="!p-6 !border-t !border-gray-100 !flex !justify-end !bg-gray-50/50">
                <button 
                  onClick={() => setShowAdminModal(false)}
                  className="!px-6 !py-2.5 !bg-white !border !border-gray-200 !text-gray-700 !rounded-xl !text-[13px] !font-bold hover:!bg-gray-50 !transition-all !cursor-pointer !shadow-sm"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}