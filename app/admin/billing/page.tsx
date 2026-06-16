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

  const getAdminStats = (adminId: string, totalRevenue: number, totalRefunded: number = 0) => {
    const adminSettlements = settlements.filter(s => s.admin?._id === adminId && s.status === 'completed');
    const totalPaid = adminSettlements.reduce((sum, s) => sum + s.amount, 0);
    const totalWalletShare = (totalRevenue) * 0.8;
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
    <div className="!w-full !font-sans !bg-white !rounded-[24px] !border !border-slate-200/80 !shadow-sm !p-6 md:!p-8 !space-y-6">
      
      {/* Header & Filters */}
      <div className="!flex !flex-col lg:!flex-row lg:!items-center !justify-between !gap-5 !pb-6 !border-b !border-slate-100">
        <div>
          <h1 className="!text-2xl md:!text-3xl !font-black !text-slate-900 !tracking-tight !m-0 !mb-1.5">
            {isSuperAdmin ? 'Billing Dashboard' : 'Venue Revenue Dashboard'}
          </h1>
          <p className="!text-sm !font-medium !text-slate-500 !m-0">
            {isSuperAdmin ? 'Real-time revenue tracking across platform' : 'Track your venue\'s earnings and bookings'}
          </p>
        </div>
        
        <div className="!flex !flex-wrap !items-center !gap-3">
          <div className="!flex !items-center !bg-slate-50 !rounded-xl !p-1.5 !border !border-slate-200">
            {['all', 'today', 'week', 'month', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`!px-4 !py-2 !text-[13px] !font-bold !rounded-lg !transition-all !capitalize !border-none !cursor-pointer !outline-none ${
                  dateRange === range 
                  ? '!bg-white !text-[#1abc60] !shadow-sm !border !border-slate-200' 
                  : '!bg-transparent !text-slate-500 hover:!text-slate-800 hover:!bg-slate-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="!flex !items-center !gap-2 !bg-white !p-1.5 !rounded-xl !border !border-slate-200">
              <input 
                type="date" 
                value={customDates.start}
                onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                className="!text-[13px] !font-medium !text-gray-700 !bg-transparent !px-2 !py-1.5 focus:!outline-none !border-none"
              />
              <span className="!text-xs !text-gray-400 !font-medium">to</span>
              <input 
                type="date" 
                value={customDates.end}
                onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                className="!text-[13px] !font-medium !text-gray-700 !bg-transparent !px-2 !py-1.5 focus:!outline-none !border-none"
              />
            </div>
          )}

          <button 
            onClick={fetchBillingData}
            disabled={loading}
            className="!p-3 !bg-[#1abc60] !text-white !rounded-xl hover:!bg-[#169c4e] !transition-all !shadow-md hover:!shadow-lg hover:!shadow-[#1abc60]/20 disabled:!opacity-50 !border-none !cursor-pointer !flex !items-center !justify-center"
          >
            <RefreshCw className={`!w-4 !h-4 ${loading ? '!animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
        <div className="!flex !items-center !gap-2 !p-1.5 !bg-slate-100 !rounded-xl !w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`!px-6 !py-2.5 !rounded-lg !text-[13px] !font-bold !transition-all !cursor-pointer !border-none !outline-none ${
              activeTab === 'overview' 
                ? '!bg-white !text-slate-900 !shadow-sm' 
                : '!bg-transparent !text-slate-500 hover:!text-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('settlements')}
            className={`!px-6 !py-2.5 !rounded-lg !text-[13px] !font-bold !transition-all !cursor-pointer !border-none !outline-none ${
              activeTab === 'settlements' 
                ? '!bg-white !text-slate-900 !shadow-sm' 
                : '!bg-transparent !text-slate-500 hover:!text-slate-700'
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
          <div className="!bg-gradient-to-br !from-[#1abc60] !to-[#149d50] !p-6 md:!p-8 !rounded-[20px] !text-white !shadow-sm !border !border-[#1abc60]/10 !flex !flex-col md:!flex-row !justify-between !items-center !gap-8">
            <div>
              <h2 className="!text-xl !font-bold !tracking-wide !m-0">
                {isSuperAdmin ? 'Platform Revenue Overview' : 'My Revenue Overview'}
              </h2>
              <p className="!text-sm !font-medium !text-white/80 !mt-2 !mb-0">Persistent tracking of all bookings and settlements</p>
            </div>
            <div className="!flex !flex-wrap !gap-8 md:!gap-12">
              <div className="!text-center md:!text-left">
          <p className="!text-xs !font-bold !text-white/70 !uppercase !tracking-wider !mb-1">Gross Revenue</p>
          <p className="!text-3xl !font-black !m-0">₹{summary?.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="!text-center md:!text-left">
          <p className="!text-xs !font-bold !text-white/70 !uppercase !tracking-wider !mb-1">Total Refunded</p>
          <p className="!text-3xl !font-black !m-0">₹{(summary?.refunds?.totalRefunded || 0).toLocaleString()}</p>
        </div>
        <div className="!text-center md:!text-left">
          <p className="!text-xs !font-bold !text-white/70 !uppercase !tracking-wider !mb-1">Net Earned (80%)</p>
          <p className="!text-3xl !font-black !m-0">₹{((summary?.totalRevenue || 0) * 0.8).toLocaleString()}</p>
        </div>
              <div className="!text-center md:!text-left">
                <p className="!text-xs !font-bold !text-white/70 !uppercase !tracking-wider !mb-1">Total Paid</p>
                <p className="!text-3xl !font-black !m-0">
                  ₹{settlements.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
        
            <div className="!bg-slate-50/60 !p-6 !rounded-2xl !border !border-slate-100 !flex !flex-col !group hover:!border-emerald-100 hover:!bg-emerald-50/10 !transition-all">
              <div className="!flex !items-center !justify-between !mb-4">
                <div className="!p-3 !bg-emerald-50 !rounded-xl !text-[#1abc60]">
                  <IndianRupee className="!w-5 !h-5" />
                </div>
                <TrendingUp className="!w-4 !h-4 !text-emerald-500" />
              </div>
              <p className="!text-[11px] !font-bold !text-slate-400 !uppercase !tracking-widest !m-0 !mb-1">Total Revenue</p>
              <h3 className="!text-2xl !font-black !text-slate-900 !m-0">
                ₹{summary?.totalRevenue.toLocaleString() || 0}
              </h3>
              <div className="!mt-4 !pt-4 !border-t !border-slate-200/60 !flex !flex-col !gap-2 !text-xs !font-semibold">
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

            <div className="!bg-slate-50/60 !p-6 !rounded-2xl !border !border-slate-100 !flex !flex-col !group hover:!border-blue-100 hover:!bg-blue-50/10 !transition-all">
              <div className="!flex !items-center !justify-between !mb-4">
                <div className="!p-3 !bg-blue-50 !rounded-xl !text-blue-600">
                  <Calendar className="!w-5 !h-5" />
                </div>
                <span className="!text-[10px] !font-black !text-blue-700 !bg-blue-50 !px-2.5 !py-1 !rounded-md">
                  {summary?.bookings.count || 0} Bookings
                </span>
              </div>
              <p className="!text-[11px] !font-bold !text-slate-400 !uppercase !tracking-widest !m-0 !mb-1">Booking Revenue</p>
              <h3 className="!text-2xl !font-black !text-slate-900 !m-0">
                ₹{summary?.bookings.totalRevenue.toLocaleString() || 0}
              </h3>
              <div className="!mt-4 !pt-4 !border-t !border-slate-200/60 !flex !justify-between !text-xs !font-medium !text-slate-505">
                <span>On: <span className="!font-bold !text-slate-800">₹{summary?.bookings.onlineRevenue.toLocaleString() || 0}</span></span>
                <span>Off: <span className="!font-bold !text-slate-800">₹{summary?.bookings.offlineRevenue.toLocaleString() || 0}</span></span>
              </div>
            </div>

            <div className="!bg-slate-50/60 !p-6 !rounded-2xl !border !border-slate-100 !flex !flex-col !group hover:!border-purple-100 hover:!bg-purple-50/10 !transition-all">
              <div className="!flex !items-center !justify-between !mb-4">
                <div className="!p-3 !bg-purple-50 !rounded-xl !text-purple-600">
                  <Trophy className="!w-5 !h-5" />
                </div>
                <span className="!text-[10px] !font-black !text-purple-700 !bg-purple-50 !px-2.5 !py-1 !rounded-md">
                  {summary?.tournaments.count || 0} Teams
                </span>
              </div>
              <p className="!text-[11px] !font-bold !text-slate-400 !uppercase !tracking-widest !m-0 !mb-1">Tournament Revenue</p>
              <h3 className="!text-2xl !font-black !text-slate-900 !m-0">
                ₹{summary?.tournaments.totalRevenue.toLocaleString() || 0}
              </h3>
            </div>

            <div className="!bg-slate-50/60 !p-6 !rounded-2xl !border !border-slate-100 !flex !flex-col !group hover:!border-orange-100 hover:!bg-orange-50/10 !transition-all">
              <div className="!flex !items-center !justify-between !mb-4">
                <div className="!p-3 !bg-orange-50 !rounded-xl !text-orange-600">
                  <Users className="!w-5 !h-5" />
                </div>
                <CheckCircle2 className="!w-4 !h-4 !text-orange-500" />
              </div>
              <p className="!text-[11px] !font-bold !text-slate-400 !uppercase !tracking-widest !m-0 !mb-1">Active Admins</p>
              <h3 className="!text-2xl !font-black !text-slate-900 !m-0">
                {adminBreakdown.length}
              </h3>
            </div>
          </div>

          {/* Admin Breakdown Table (Only for Super Admin) */}
          {isSuperAdmin && (
            <div className="!border !border-slate-200/60 !rounded-2xl !overflow-hidden">
              <div className="!p-5 md:!p-6 !border-b !border-slate-200 !bg-white !flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
                <h2 className="!text-lg !font-bold !text-slate-900 !m-0">Admin-wise Revenue</h2>
                <div className="!relative !w-full sm:!max-w-xs">
                  <Search className="!w-4 !h-4 !absolute !left-3.5 !top-1/2 !-translate-y-1/2 !text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search admin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="!pl-10 !pr-4 !py-2.5 !bg-slate-50 !border !border-slate-200 !rounded-xl !text-sm !font-medium !outline-none focus:!border-[#1abc60] focus:!bg-white focus:!ring-1 focus:!ring-[#1abc60] !w-full !transition-all placeholder:!text-slate-400"
                  />
                </div>
              </div>
              <div className="!overflow-x-auto !custom-scrollbar">
                <table className="!w-full !text-left !border-collapse !min-w-[900px]">
                  <thead className="!bg-slate-50 !text-slate-500 !text-[10px] !font-black !uppercase !tracking-widest !border-b !border-slate-200">
                    <tr>
                      <th className="!px-6 md:!px-8 !py-4">Admin Info</th>
                      <th className="!px-6 md:!px-8 !py-4">Bookings</th>
                      <th className="!px-6 md:!px-8 !py-4">Tournaments</th>
                      <th className="!px-6 md:!px-8 !py-4">Wallet (80%)</th>
          <th className="!px-6 md:!px-8 !py-4">Refunded</th>
          <th className="!px-6 md:!px-8 !py-4">Paid</th>
          <th className="!px-6 md:!px-8 !py-4">Pending</th>
          <th className="!px-6 md:!px-8 !py-4">Total</th>
                      <th className="!px-6 md:!px-8 !py-4 !text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="!divide-y !divide-slate-100">
                    {filteredAdmins.map((admin) => {
        const stats = getAdminStats(admin.adminId, admin.totalRevenue, admin.totalRefunded);
                      return (
                        <tr key={admin.adminId} className="hover:!bg-slate-50/50 !transition-colors">
                          <td className="!px-6 md:!px-8 !py-4">
                            <div className="!flex !items-center !gap-3">
                              <div className="!w-9 !h-9 !rounded-xl !bg-emerald-50 !text-[#1abc60] !font-bold !flex !items-center !justify-center !text-sm">
                                {getInitials(admin.name)}
                              </div>
                              <div className="!flex !flex-col">
                                <span className="!font-bold !text-[13px] !text-slate-900">{admin.name}</span>
                                <span className="!text-[11px] !font-medium !text-slate-505">{admin.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="!px-6 md:!px-8 !py-4">
                            <div className="!flex !flex-col">
                              <span className="!text-sm !font-semibold !text-slate-900">₹{admin.bookingRevenue.total.toLocaleString()}</span>
                              <div className="!flex !gap-2 !text-[11px] !font-medium !text-slate-400 !mt-0.5">
                                <span>On: ₹{admin.bookingRevenue.online.toLocaleString()}</span>
                                <span>Off: ₹{admin.bookingRevenue.offline.toLocaleString()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="!px-6 md:!px-8 !py-4">
                            <span className="!text-sm !font-semibold !text-slate-900">₹{admin.tournamentRevenue.toLocaleString()}</span>
                          </td>
                          <td className="!px-6 md:!px-8 !py-4">
            <div className="!flex !flex-col">
              <span className="!text-sm !font-bold !text-blue-600">
                ₹{(admin.totalRevenue * 0.8).toLocaleString()}
              </span>
              <span className="!text-[10px] !text-slate-400 !font-medium !uppercase !tracking-wider !mt-0.5">Total Share</span>
            </div>
          </td>
          <td className="!px-6 md:!px-8 !py-4">
            <span className="!text-sm !font-bold !text-red-600">
              ₹{(admin.totalRefunded || 0).toLocaleString()}
            </span>
          </td>
          <td className="!px-6 md:!px-8 !py-4">
            <span className="!text-sm !font-bold !text-emerald-600">
              ₹{stats.totalPaid.toLocaleString()}
            </span>
          </td>
                          <td className="!px-6 md:!px-8 !py-4">
                            <span className={`!text-sm !font-bold ${stats.pending > 0 ? '!text-orange-600' : '!text-slate-400'}`}>
                              ₹{stats.pending.toLocaleString()}
                            </span>
                          </td>
                          <td className="!px-6 md:!px-8 !py-4">
                            <span className="!text-sm !font-bold !text-[#1abc60]">
                              ₹{admin.totalRevenue.toLocaleString()}
                            </span>
                          </td>
                          <td className="!px-6 md:!px-8 !py-4 !text-right">
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
                              className="!px-4 !py-2 !bg-[#1abc60] !text-white !rounded-lg !text-[13px] !font-bold hover:!bg-[#169c4e] !transition-colors disabled:!opacity-50 disabled:!bg-slate-300 disabled:!text-slate-400 !border-none !cursor-pointer"
                            >
                              Settle Now
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredAdmins.length === 0 && (
                      <tr>
                        <td colSpan={8} className="!px-6 !py-12 !text-center !text-slate-400 !text-sm !font-medium">
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
          <div className="!border !border-slate-200/60 !rounded-2xl !overflow-hidden">
            <div className="!p-5 !border-b !border-slate-200 !bg-white">
              <h2 className="!text-lg !font-bold !text-slate-900 !m-0">Recent Transactions</h2>
            </div>
            <div className="!overflow-x-auto !custom-scrollbar">
              <table className="!w-full !text-left !border-collapse !min-w-[900px]">
                <thead className="!bg-slate-50 !text-slate-500 !text-[10px] !font-black !uppercase !tracking-widest !border-b !border-slate-200">
                  <tr>
                    <th className="!px-6 md:!px-8 !py-4">Date</th>
                    <th className="!px-6 md:!px-8 !py-4">Customer</th>
                    <th className="!px-6 md:!px-8 !py-4">Venue</th>
                    <th className="!px-6 md:!px-8 !py-4">Type</th>
                    <th className="!px-6 md:!px-8 !py-4">Wallet (80%)</th>
                    <th className="!px-6 md:!px-8 !py-4">Comm. (20%)</th>
                    <th className="!px-6 md:!px-8 !py-4 !text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="!divide-y !divide-slate-100">
                  {recentTransactions.slice(0, 10).map((tx) => (
                    <tr key={tx._id} className="hover:!bg-slate-50/50 !transition-colors">
                      <td className="!px-6 md:!px-8 !py-4 !text-[13px] !font-semibold !text-slate-550">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="!px-6 md:!px-8 !py-4">
                        <div className="!flex !flex-col">
                          <span className="!text-[13px] !font-bold !text-slate-900">{tx.user?.name || 'Unknown User'}</span>
                          <span className="!text-[11px] !font-medium !text-slate-400">{tx.user?.email || ''}</span>
                        </div>
                      </td>
                      <td className="!px-6 md:!px-8 !py-4">
                        <div className="!flex !items-center !gap-2">
                          <Activity className="!w-4 !h-4 !text-slate-400" />
                          <span className="!text-[13px] !font-semibold !text-slate-700">{tx.turf?.name || 'Unknown Venue'}</span>
                        </div>
                      </td>
                      <td className="!px-6 md:!px-8 !py-4">
                        {(() => {
                          const isOffline = tx.isOffline === true;
                          return (
                            <span className={`!px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider ${
                              isOffline ? '!bg-orange-50 !text-orange-700 !border !border-orange-100' : '!bg-blue-50 !text-blue-700 !border !border-blue-100'
                            }`}>
                              {isOffline ? 'Offline' : 'Online'}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="!px-6 md:!px-8 !py-4">
                        <span className="!text-sm !font-semibold !text-blue-600">
                          ₹{(tx.paidAmount * 0.8).toLocaleString()}
                        </span>
                      </td>
                      <td className="!px-6 md:!px-8 !py-4">
                        <span className="!text-sm !font-semibold !text-orange-600">
                          ₹{(tx.paidAmount * 0.2).toLocaleString()}
                        </span>
                      </td>
                      <td className="!px-6 md:!px-8 !py-4 !text-right">
                        <span className="!text-sm !font-bold !text-slate-900">
                          ₹{tx.paidAmount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="!px-6 !py-12 !text-center !text-slate-400 !text-sm !font-medium">
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
          <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4 !pb-6 !border-b !border-slate-100">
            <div>
              <h2 className="!text-xl !font-bold !text-slate-900 !m-0">Payout & Paid History</h2>
              <p className="!text-sm !font-medium !text-slate-505 !mt-1.5 !mb-0">Track all settlements and weekly payments to ground owners</p>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => setShowSettlementModal(true)}
                className="!flex !items-center !justify-center !gap-2 !bg-[#1abc60] !text-white !px-5 !py-2.5 !rounded-xl !text-[13px] !font-bold hover:!bg-[#169c4e] !transition-all !shadow-md hover:!shadow-lg hover:!shadow-[#1abc60]/20 !cursor-pointer !border-none"
              >
                <Plus className="!w-4 !h-4" /> New Payout
              </button>
            )}
          </div>

          <div className="!border !border-slate-200/60 !rounded-2xl !overflow-hidden">
            <div className="!overflow-x-auto !custom-scrollbar">
              <table className="!w-full !text-left !border-collapse !min-w-[900px]">
                <thead className="!bg-slate-50 !text-slate-500 !text-[10px] !font-black !uppercase !tracking-widest !border-b !border-slate-200">
                  <tr>
                    <th className="!px-6 md:!px-8 !py-4">Date</th>
                    <th className="!px-6 md:!px-8 !py-4">Ground Owner</th>
                    <th className="!px-6 md:!px-8 !py-4">Type</th>
                    <th className="!px-6 md:!px-8 !py-4">Amount</th>
                    <th className="!px-6 md:!px-8 !py-4">Status</th>
                    <th className="!px-6 md:!px-8 !py-4">Weekly Report</th>
                  </tr>
                </thead>
                <tbody className="!divide-y !divide-slate-100">
                  {settlements.map((s) => (
                    <tr key={s._id} className="hover:!bg-slate-50/50 !transition-colors">
                      <td className="!px-6 md:!px-8 !py-4 !text-[13px] !font-semibold !text-slate-550">
                        {new Date(s.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="!px-6 md:!px-8 !py-4">
                        <div className="!flex !flex-col">
                          <span className="!text-[13px] !font-bold !text-slate-900">{s.admin?.name}</span>
                          <span className="!text-[11px] !font-medium !text-slate-400">{s.admin?.email}</span>
                        </div>
                      </td>
                      <td className="!px-6 md:!px-8 !py-4">
                        <span className={`!px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider ${
                          s.type === 'payout' ? '!bg-blue-50 !text-blue-700 !border !border-blue-100' : '!bg-orange-50 !text-orange-700 !border !border-orange-100'
                        }`}>
                          {s.type}
                        </span>
                      </td>
                      <td className="!px-6 md:!px-8 !py-4 !text-sm !font-bold !text-slate-900">
                        ₹{s.amount.toLocaleString()}
                      </td>
                      <td className="!px-6 md:!px-8 !py-4">
                        <div className="!flex !items-center !gap-1.5 !text-emerald-600 !font-bold !text-[13px] !capitalize">
                          <CheckCircle className="!w-4 !h-4" /> {s.status}
                        </div>
                      </td>
                      <td className="!px-6 md:!px-8 !py-4">
                        <span className="!text-[10px] !font-bold !text-slate-500 !bg-slate-100 !px-2.5 !py-1 !rounded-md">
                          Week {Math.ceil(new Date(s.createdAt).getDate() / 7)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {settlements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="!px-6 !py-12 !text-center !text-slate-400 !font-medium !text-sm">
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
          <div className="!fixed !inset-0 !bg-slate-900/60 !z-[100] !flex !items-center !justify-center !p-4 !backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="!bg-white !rounded-[28px] !w-full !max-w-md !shadow-2xl !border !border-slate-200 !overflow-hidden"
            >
              <div className="!px-6 !py-5 !border-b !border-slate-200 !flex !items-center !justify-between !bg-white">
                <h3 className="!text-lg !font-bold !text-slate-900 !m-0">New Settlement</h3>
                <button 
                  onClick={() => setShowSettlementModal(false)} 
                  className="!p-2 !bg-transparent hover:!bg-slate-100 !rounded-full !text-slate-400 hover:!text-slate-600 !transition-colors !border-none !cursor-pointer"
                >
                  <X className="!w-4 !h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateSettlement} className="!p-6 !space-y-5 !m-0">
                <div>
                  <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider !mb-2">Select Admin (Owner)</label>
                  <select
                    required
                    value={newSettlement.adminId}
                    onChange={(e) => setNewSettlement({ ...newSettlement, adminId: e.target.value })}
                    className="!w-full !px-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-slate-200 !rounded-xl !text-sm !font-bold !text-slate-900 focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !transition-all !appearance-none !cursor-pointer"
                  >
                    <option value="">Select Owner</option>
                    {adminBreakdown.map(admin => (
                      <option key={admin.adminId} value={admin.adminId}>{admin.name}</option>
                    ))}
                  </select>
                </div>
                <div className="!grid !grid-cols-2 !gap-4">
                  <div>
                    <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider !mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={newSettlement.amount}
                      onChange={(e) => setNewSettlement({ ...newSettlement, amount: e.target.value })}
                      className="!w-full !px-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-slate-200 !rounded-xl !text-sm !font-bold !text-slate-900 focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !transition-all placeholder:!text-slate-400"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider !mb-2">Type</label>
                    <select
                      value={newSettlement.type}
                      onChange={(e) => setNewSettlement({ ...newSettlement, type: e.target.value as any })}
                      className="!w-full !px-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-slate-200 !rounded-xl !text-sm !font-bold !text-slate-900 focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !transition-all !appearance-none !cursor-pointer"
                    >
                      <option value="payout">Payout (We pay)</option>
                      <option value="recovery">Recovery (They pay)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider !mb-2">Transaction ID</label>
                  <input
                    type="text"
                    value={newSettlement.transactionId}
                    onChange={(e) => setNewSettlement({ ...newSettlement, transactionId: e.target.value })}
                    className="!w-full !px-4 !py-3.5 !bg-slate-50 hover:!bg-slate-100 !border !border-slate-200 !rounded-xl !text-sm !font-bold !text-slate-900 focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !transition-all placeholder:!text-slate-400"
                    placeholder="UTR / Ref No."
                  />
                </div>
                <div>
                  <label className="!block !text-[11px] !font-bold !text-slate-500 !uppercase !tracking-wider !mb-2">Notes</label>
                  <textarea
                    value={newSettlement.notes}
                    onChange={(e) => setNewSettlement({ ...newSettlement, notes: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-slate-50 hover:!bg-slate-100 !border !border-slate-200 !rounded-xl !text-sm !font-bold !text-slate-900 focus:!bg-white focus:!outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !transition-all !h-20 !resize-none placeholder:!text-slate-400"
                    placeholder="Remarks..."
                  />
                </div>
                <button
                  type="submit"
                  className="!w-full !py-3.5 !bg-[#1abc60] !text-white !rounded-xl !font-bold !text-sm hover:!bg-[#169c4e] !transition-all !shadow-md hover:!shadow-lg hover:!shadow-[#1abc60]/20 !mt-2 !cursor-pointer !border-none"
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
          <div className="!fixed !inset-0 !bg-slate-900/60 !z-[100] !flex !items-center !justify-center !p-4 !backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="!bg-white !rounded-[28px] !w-full !max-w-2xl !max-h-[90vh] !overflow-hidden !border !border-slate-200 !flex !flex-col"
            >
              {/* Modal Header */}
              <div className="!px-6 !py-5 !border-b !border-slate-200 !flex !items-center !justify-between !bg-white !shrink-0">
                <div className="!flex !items-center !gap-4">
                  <div className="!w-11 !h-11 !rounded-xl !bg-emerald-50 !text-[#1abc60] !font-bold !flex !items-center !justify-center !text-base">
                    {getInitials(selectedAdmin.name)}
                  </div>
                  <div>
                    <h3 className="!text-lg !font-bold !text-slate-900 !m-0 !leading-tight">{selectedAdmin.name}</h3>
                    <p className="!text-xs !text-slate-500 !m-0 !font-medium !mt-0.5">{selectedAdmin.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdminModal(false)}
                  className="!p-2 !bg-transparent hover:!bg-slate-100 !rounded-full !text-slate-400 hover:!text-slate-600 !transition-colors !border-none !cursor-pointer"
                >
                  <X className="!w-5 !h-5" />
                </button>
              </div>

              <div className="!p-6 md:!p-8 !space-y-6 !overflow-y-auto !custom-scrollbar !bg-slate-50 !flex-1">
                {/* Stats Overview */}
                <div className="!grid !grid-cols-1 sm:!grid-cols-3 !gap-4">
                  <div className="!bg-white !p-5 !rounded-2xl !border !border-slate-200 !shadow-sm">
                    <div className="!flex !items-center !gap-2 !mb-2.5">
                      <Wallet className="!w-4 !h-4 !text-[#1abc60]" />
                      <span className="!text-[10px] !font-bold !text-[#1abc60] !uppercase !tracking-wider">Total Earnings</span>
                    </div>
                    <p className="!text-xl !font-bold !text-slate-900 !m-0">₹{selectedAdmin.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="!bg-white !p-5 !rounded-2xl !border !border-slate-200 !shadow-sm">
                    <div className="!flex !items-center !gap-2 !mb-2.5">
                      <Calendar className="!w-4 !h-4 !text-blue-600" />
                      <span className="!text-[10px] !font-bold !text-blue-600 !uppercase !tracking-wider">Booking Revenue</span>
                    </div>
                    <p className="!text-xl !font-bold !text-slate-900 !m-0">₹{selectedAdmin.bookingRevenue.total.toLocaleString()}</p>
                  </div>
                  <div className="!bg-white !p-5 !rounded-2xl !border !border-slate-200 !shadow-sm">
                    <div className="!flex !items-center !gap-2 !mb-2.5">
                      <Trophy className="!w-4 !h-4 !text-purple-600" />
                      <span className="!text-[10px] !font-bold !text-purple-600 !uppercase !tracking-wider">Tournament Fees</span>
                    </div>
                    <p className="!text-xl !font-bold !text-slate-900 !m-0">₹{selectedAdmin.tournamentRevenue.toLocaleString()}</p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="!space-y-3">
                  <h4 className="!text-xs !font-bold !text-slate-505 !uppercase !tracking-wider !flex !items-center !gap-2 !m-0">
                    <PieChart className="!w-4 !h-4 !text-[#1abc60]" /> Revenue Split
                  </h4>
                  
                  <div className="!space-y-2.5">
                    <div className="!flex !items-center !justify-between !p-4 !bg-white !rounded-xl !border !border-slate-200/60 !shadow-sm">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-2.5 !h-2.5 !rounded-full !bg-blue-500" />
                        <span className="!text-[13px] !font-semibold !text-slate-700">Online Bookings</span>
                      </div>
                      <span className="!text-[15px] !font-bold !text-slate-900">₹{selectedAdmin.bookingRevenue.online.toLocaleString()}</span>
                    </div>
                    
                    <div className="!flex !items-center !justify-between !p-4 !bg-white !rounded-xl !border !border-slate-200/60 !shadow-sm">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-2.5 !h-2.5 !rounded-full !bg-orange-500" />
                        <span className="!text-[13px] !font-semibold !text-slate-700">Offline Bookings</span>
                      </div>
                      <span className="!text-[15px] !font-bold !text-slate-900">₹{selectedAdmin.bookingRevenue.offline.toLocaleString()}</span>
                    </div>

                    <div className="!flex !items-center !justify-between !p-4 !bg-white !rounded-xl !border !border-slate-200/60 !shadow-sm">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-2.5 !h-2.5 !rounded-full !bg-purple-500" />
                        <span className="!text-[13px] !font-semibold !text-slate-700">Tournaments</span>
                      </div>
                      <span className="!text-[15px] !font-bold !text-slate-900">₹{selectedAdmin.tournamentRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="!p-4 !bg-emerald-50 !rounded-xl !border !border-emerald-100 !flex !items-center !gap-3">
                  <div className="!w-9 !h-9 !bg-[#1abc60] !rounded-xl !flex !items-center !justify-center !shrink-0 !text-white">
                    <Activity className="!w-4.5 !h-4.5" />
                  </div>
                  <div>
                    <p className="!text-[10px] !font-bold !text-[#1abc60] !uppercase !tracking-wider !m-0 !mb-0.5">Performance Note</p>
                    <p className="!text-xs !text-emerald-800 !m-0 !font-semibold !leading-snug">
                      This admin accounts for {((selectedAdmin.totalRevenue / (summary?.totalRevenue || 1)) * 100).toFixed(1)}% of the total platform revenue.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="!px-6 !py-4 !border-t !border-slate-200 !flex !justify-end !bg-white !shrink-0">
                <button 
                  onClick={() => setShowAdminModal(false)}
                  className="!px-5 !py-2.5 !bg-white !border !border-slate-200 !text-slate-600 !rounded-xl !text-xs !font-bold hover:!bg-slate-50 !transition-all !cursor-pointer"
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