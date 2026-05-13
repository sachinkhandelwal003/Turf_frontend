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
  const [selectedAdmin, setSelectedAdmin] = useState<AdminRevenue | null>(null);
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

  if (loading && !summary) {
    return (
      <div className="!min-h-[80vh] !flex !flex-col !items-center !justify-center !bg-[#f8fafc]">
        <Loader2 className="!w-8 !h-8 !animate-spin !text-[#1abc60] !mb-4" />
        <p className="!text-sm !font-medium !text-gray-500">Loading Billing Data...</p>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !bg-[#f8fafc] !p-4 lg:!p-8 !font-sans !space-y-6">
      
      {/* Header & Filters */}
      <div className="!flex !flex-col lg:!flex-row lg:!items-center !justify-between !gap-4 !bg-white !p-5 !rounded-xl !border !border-gray-200 !shadow-sm">
        <div>
          <h1 className="!text-2xl !font-bold !text-gray-900 !m-0">
            {isSuperAdmin ? 'Billing Dashboard' : 'Venue Revenue Dashboard'}
          </h1>
          <p className="!text-sm !text-gray-500 !mt-1">
            {isSuperAdmin ? 'Real-time revenue tracking across platform' : 'Track your venue\'s earnings and bookings'}
          </p>
        </div>
        
        <div className="!flex !flex-wrap !items-center !gap-3">
          <div className="!flex !items-center !bg-gray-50 !rounded-lg !p-1 !border !border-gray-200">
            {['all', 'today', 'week', 'month', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`!px-3 !py-1.5 !text-xs !font-medium !rounded-md !transition-colors !capitalize !border-none !cursor-pointer ${
                  dateRange === range 
                  ? '!bg-white !text-[#1abc60] !shadow-sm !border !border-gray-200' 
                  : '!bg-transparent !text-gray-600 hover:!text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="!flex !items-center !gap-2">
              <input 
                type="date" 
                value={customDates.start}
                onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                className="!text-xs !border !border-gray-300 !rounded-lg !px-2 !py-1.5 focus:!outline-none focus:!border-[#1abc60]"
              />
              <span className="!text-xs !text-gray-400">to</span>
              <input 
                type="date" 
                value={customDates.end}
                onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                className="!text-xs !border !border-gray-300 !rounded-lg !px-2 !py-1.5 focus:!outline-none focus:!border-[#1abc60]"
              />
            </div>
          )}

          <button 
            onClick={fetchBillingData}
            disabled={loading}
            className="!p-2 !bg-[#1abc60] !text-white !rounded-lg hover:!bg-[#17a554] !transition-colors disabled:!opacity-50 !border-none !cursor-pointer !flex !items-center !justify-center"
          >
            <RefreshCw className={`!w-4 !h-4 ${loading ? '!animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="!flex !items-center !gap-1 !p-1 !bg-gray-100 !rounded-xl !w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`!px-6 !py-2 !rounded-lg !text-sm !font-bold !transition-all !cursor-pointer ${
            activeTab === 'overview' 
              ? '!bg-white !text-gray-900 !shadow-sm' 
              : '!text-gray-500 hover:!text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('settlements')}
          className={`!px-6 !py-2 !rounded-lg !text-sm !font-bold !transition-all !cursor-pointer ${
            activeTab === 'settlements' 
              ? '!bg-white !text-gray-900 !shadow-sm' 
              : '!text-gray-500 hover:!text-gray-700'
          }`}
        >
          Payment Settlements
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Summary Cards */}
          <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 !gap-6">
        
        <div className="!bg-white !p-5 !rounded-xl !border !border-gray-200 !shadow-sm">
          <div className="!flex !items-center !justify-between !mb-3">
            <div className="!p-2 !bg-emerald-50 !rounded-lg">
              <IndianRupee className="!w-5 !h-5 !text-[#1abc60]" />
            </div>
            <TrendingUp className="!w-4 !h-4 !text-emerald-500" />
          </div>
          <p className="!text-xs !font-medium !text-gray-500 !mb-1 !m-0">Total Revenue</p>
          <h3 className="!text-2xl !font-bold !text-gray-900 !m-0">
            ₹{summary?.totalRevenue.toLocaleString() || 0}
          </h3>
        </div>

        <div className="!bg-white !p-5 !rounded-xl !border !border-gray-200 !shadow-sm">
          <div className="!flex !items-center !justify-between !mb-3">
            <div className="!p-2 !bg-blue-50 !rounded-lg">
              <Calendar className="!w-5 !h-5 !text-blue-600" />
            </div>
            <span className="!text-[10px] !font-medium !text-blue-700 !bg-blue-50 !px-2 !py-1 !rounded-md">
              {summary?.bookings.count || 0} Bookings
            </span>
          </div>
          <p className="!text-xs !font-medium !text-gray-500 !mb-1 !m-0">Booking Revenue</p>
          <h3 className="!text-2xl !font-bold !text-gray-900 !m-0">
            ₹{summary?.bookings.totalRevenue.toLocaleString() || 0}
          </h3>
          <div className="!mt-3 !flex !gap-3 !text-[11px] !text-gray-500 !font-medium">
            <span>Online: ₹{summary?.bookings.onlineRevenue.toLocaleString() || 0}</span>
            <span>Offline: ₹{summary?.bookings.offlineRevenue.toLocaleString() || 0}</span>
          </div>
        </div>

        <div className="!bg-white !p-5 !rounded-xl !border !border-gray-200 !shadow-sm">
          <div className="!flex !items-center !justify-between !mb-3">
            <div className="!p-2 !bg-purple-50 !rounded-lg">
              <Trophy className="!w-5 !h-5 !text-purple-600" />
            </div>
            <span className="!text-[10px] !font-medium !text-purple-700 !bg-purple-50 !px-2 !py-1 !rounded-md">
              {summary?.tournaments.count || 0} Teams
            </span>
          </div>
          <p className="!text-xs !font-medium !text-gray-500 !mb-1 !m-0">Tournament Revenue</p>
          <h3 className="!text-2xl !font-bold !text-gray-900 !m-0">
            ₹{summary?.tournaments.totalRevenue.toLocaleString() || 0}
          </h3>
        </div>

        <div className="!bg-white !p-5 !rounded-xl !border !border-gray-200 !shadow-sm">
          <div className="!flex !items-center !justify-between !mb-3">
            <div className="!p-2 !bg-orange-50 !rounded-lg">
              <Users className="!w-5 !h-5 !text-orange-600" />
            </div>
            <CheckCircle2 className="!w-4 !h-4 !text-orange-500" />
          </div>
          <p className="!text-xs !font-medium !text-gray-500 !mb-1 !m-0">Active Admins</p>
          <h3 className="!text-2xl !font-bold !text-gray-900 !m-0">
            {adminBreakdown.length}
          </h3>
        </div>
      </div>

      {/* Admin Breakdown Table (Only for Super Admin) */}
      {isSuperAdmin && (
        <div className="!bg-white !rounded-xl !border !border-gray-200 !shadow-sm !overflow-hidden">
          <div className="!p-5 !border-b !border-gray-200 !flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
            <h2 className="!text-lg !font-bold !text-gray-900 !m-0">Admin-wise Revenue</h2>
            <div className="!relative">
              <Search className="!w-4 !h-4 !absolute !left-3 !top-1/2 !-translate-y-1/2 !text-gray-400" />
              <input 
                type="text" 
                placeholder="Search admin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!pl-9 !pr-4 !py-2 !bg-white !border !border-gray-300 !rounded-lg !text-sm !outline-none focus:!border-[#1abc60] !w-full md:!w-64"
              />
            </div>
          </div>
          <div className="!overflow-x-auto">
            <table className="!w-full !text-left !min-w-[700px]">
              <thead>
                <tr className="!bg-gray-50 !border-b !border-gray-200">
                  <th className="!px-6 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">Admin Info</th>
                  <th className="!px-6 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">Bookings</th>
                  <th className="!px-6 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">Tournaments</th>
                  <th className="!px-6 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">Total</th>
                  <th className="!px-6 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase !text-right">Action</th>
                </tr>
              </thead>
              <tbody className="!divide-y !divide-gray-100">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.adminId} className="hover:!bg-gray-50 !transition-colors">
                    <td className="!px-6 !py-4">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-8 !h-8 !rounded-full !bg-emerald-50 !text-[#1abc60] !font-bold !flex !items-center !justify-center !text-xs">
                          {getInitials(admin.name)}
                        </div>
                        <div className="!flex !flex-col">
                          <span className="!font-semibold !text-sm !text-gray-900">{admin.name}</span>
                          <span className="!text-xs !text-gray-500">{admin.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-4">
                      <div className="!flex !flex-col">
                        <span className="!text-sm !font-semibold !text-gray-900">₹{admin.bookingRevenue.total.toLocaleString()}</span>
                        <div className="!flex !gap-2 !text-[10px] !text-gray-500 !mt-1">
                          <span>On: ₹{admin.bookingRevenue.online.toLocaleString()}</span>
                          <span>Off: ₹{admin.bookingRevenue.offline.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="!px-6 !py-4">
                      <span className="!text-sm !font-semibold !text-gray-900">₹{admin.tournamentRevenue.toLocaleString()}</span>
                    </td>
                    <td className="!px-6 !py-4">
                      <span className="!text-sm !font-bold !text-[#1abc60]">
                        ₹{admin.totalRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="!px-6 !py-4 !text-right">
                      <button 
                        onClick={() => {
                          setSelectedAdmin(admin);
                          setShowAdminModal(true);
                        }}
                        className="!p-2 !bg-gray-50 !text-gray-600 !rounded-lg hover:!bg-[#1abc60] hover:!text-white !transition-all !border-none !cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="!w-4 !h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="!px-6 !py-8 !text-center !text-gray-500 !text-sm">
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="!bg-white !rounded-xl !border !border-gray-200 !shadow-sm !overflow-hidden">
        <div className="!p-5 !border-b !border-gray-200">
          <h2 className="!text-lg !font-bold !text-gray-900 !m-0">Recent Transactions</h2>
        </div>
        <div className="!overflow-x-auto">
          <table className="!w-full !text-left !min-w-[700px]">
            <thead>
              <tr className="!bg-gray-50 !border-b !border-gray-200">
                <th className="!px-6 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">Date</th>
                <th className="!px-6 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">Customer</th>
                <th className="!px-6 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">Venue</th>
                <th className="!px-6 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase">Type</th>
                <th className="!px-6 !py-3 !text-xs !font-semibold !text-gray-500 !uppercase !text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="!divide-y !divide-gray-100">
              {recentTransactions.slice(0, 10).map((tx) => (
                <tr key={tx._id} className="hover:!bg-gray-50 !transition-colors">
                  <td className="!px-6 !py-4 !text-sm !text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="!px-6 !py-4">
                    <div className="!flex !flex-col">
                      <span className="!text-sm !font-semibold !text-gray-900">{tx.user?.name || 'Unknown User'}</span>
                      <span className="!text-xs !text-gray-500">{tx.user?.email || ''}</span>
                    </div>
                  </td>
                  <td className="!px-6 !py-4">
                    <div className="!flex !items-center !gap-2">
                      <Activity className="!w-4 !h-4 !text-gray-400" />
                      <span className="!text-sm !text-gray-700">{tx.turf?.name || 'Unknown Venue'}</span>
                    </div>
                  </td>
                  <td className="!px-6 !py-4">
                    {(() => {
                      const isOffline = tx.isOffline === true;
                      return (
                        <span className={`!px-2 !py-1 !rounded !text-[10px] !font-semibold !uppercase ${
                          isOffline ? '!bg-orange-50 !text-orange-700' : '!bg-blue-50 !text-blue-700'
                        }`}>
                          {isOffline ? 'Offline' : 'Online'}
                        </span>
                      );
                    })()}
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
                  <td colSpan={5} className="!px-6 !py-8 !text-center !text-gray-500 !text-sm">
                    No recent transactions.
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
          <div className="!flex !justify-between !items-center">
            <div>
              <h2 className="!text-lg !font-black !text-gray-900 !uppercase !tracking-widest">Settlement History</h2>
              <p className="!text-xs !text-gray-500 !font-medium">Track payouts and recoveries with ground owners</p>
            </div>
            <button
              onClick={() => setShowSettlementModal(true)}
              className="!flex !items-center !gap-2 !bg-[#1abc60] !text-white !px-5 !py-2.5 !rounded-xl !text-sm !font-black !uppercase !tracking-widest !hover:!bg-[#169c4e] !transition-all !shadow-lg !shadow-[#1abc60]/20 !cursor-pointer !border-none"
            >
              <Plus className="!w-4 !h-4" /> New Settlement
            </button>
          </div>

          <div className="!bg-white !rounded-2xl !border !border-gray-200 !shadow-sm !overflow-hidden">
            <div className="!overflow-x-auto">
              <table className="!w-full !text-left">
                <thead>
                  <tr className="!bg-gray-50 !border-b !border-gray-200">
                    <th className="!px-6 !py-4 !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest">Date</th>
                    <th className="!px-6 !py-4 !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest">Ground Owner</th>
                    <th className="!px-6 !py-4 !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest">Type</th>
                    <th className="!px-6 !py-4 !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest">Amount</th>
                    <th className="!px-6 !py-4 !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest">Method</th>
                    <th className="!px-6 !py-4 !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="!divide-y !divide-gray-100">
                  {settlements.map((s) => (
                    <tr key={s._id} className="hover:!bg-gray-50 !transition-colors">
                      <td className="!px-6 !py-4 !text-sm !font-medium !text-gray-600">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="!px-6 !py-4">
                        <div className="!flex !flex-col">
                          <span className="!text-sm !font-bold !text-gray-900">{s.admin?.name}</span>
                          <span className="!text-[10px] !text-gray-500">{s.admin?.email}</span>
                        </div>
                      </td>
                      <td className="!px-6 !py-4">
                        <span className={`!px-2 !py-1 !rounded-lg !text-[10px] !font-black !uppercase ${
                          s.type === 'payout' ? '!bg-blue-50 !text-blue-700' : '!bg-orange-50 !text-orange-700'
                        }`}>
                          {s.type}
                        </span>
                      </td>
                      <td className="!px-6 !py-4 !text-sm !font-black !text-gray-900">
                        ₹{s.amount.toLocaleString()}
                      </td>
                      <td className="!px-6 !py-4 !text-sm !font-medium !text-gray-500">
                        {s.paymentMethod}
                      </td>
                      <td className="!px-6 !py-4">
                        <div className="!flex !items-center !gap-1.5 !text-emerald-600 !font-bold !text-xs">
                          <CheckCircle className="!w-4 !h-4" /> {s.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {settlements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="!px-6 !py-12 !text-center !text-gray-400 !font-bold !italic">
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
      {showSettlementModal && (
        <div className="!fixed !inset-0 !bg-black/60 !z-[999] !flex !items-center !justify-center !p-4 !backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="!bg-white !rounded-3xl !w-full !max-w-md !shadow-2xl !border !border-gray-100 !overflow-hidden"
          >
            <div className="!p-6 !border-b !border-gray-100 !flex !items-center !justify-between">
              <h3 className="!text-lg !font-black !text-gray-900 !uppercase !tracking-widest">New Settlement</h3>
              <button onClick={() => setShowSettlementModal(false)} className="!p-2 !hover:!bg-gray-100 !rounded-xl !text-gray-400 !border-none !cursor-pointer">
                <X className="!w-5 !h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSettlement} className="!p-6 !space-y-4">
              <div>
                <label className="!block !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest !mb-1.5">Select Admin (Owner)</label>
                <select
                  required
                  value={newSettlement.adminId}
                  onChange={(e) => setNewSettlement({ ...newSettlement, adminId: e.target.value })}
                  className="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-sm !outline-none focus:!ring-2 focus:!ring-[#1abc60]"
                >
                  <option value="">Select Owner</option>
                  {adminBreakdown.map(admin => (
                    <option key={admin.adminId} value={admin.adminId}>{admin.name}</option>
                  ))}
                </select>
              </div>
              <div className="!grid !grid-cols-2 !gap-4">
                <div>
                  <label className="!block !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest !mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={newSettlement.amount}
                    onChange={(e) => setNewSettlement({ ...newSettlement, amount: e.target.value })}
                    className="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-sm !outline-none focus:!ring-2 focus:!ring-[#1abc60]"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="!block !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest !mb-1.5">Type</label>
                  <select
                    value={newSettlement.type}
                    onChange={(e) => setNewSettlement({ ...newSettlement, type: e.target.value as any })}
                    className="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-sm !outline-none focus:!ring-2 focus:!ring-[#1abc60]"
                  >
                    <option value="payout">Payout (We pay)</option>
                    <option value="recovery">Recovery (They pay)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="!block !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest !mb-1.5">Transaction ID</label>
                <input
                  type="text"
                  value={newSettlement.transactionId}
                  onChange={(e) => setNewSettlement({ ...newSettlement, transactionId: e.target.value })}
                  className="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-sm !outline-none focus:!ring-2 focus:!ring-[#1abc60]"
                  placeholder="UTR / Ref No."
                />
              </div>
              <div>
                <label className="!block !text-[10px] !font-black !text-gray-500 !uppercase !tracking-widest !mb-1.5">Notes</label>
                <textarea
                  value={newSettlement.notes}
                  onChange={(e) => setNewSettlement({ ...newSettlement, notes: e.target.value })}
                  className="!w-full !px-4 !py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl !text-sm !outline-none focus:!ring-2 focus:!ring-[#1abc60] !h-20"
                  placeholder="Any details..."
                />
              </div>
              <button
                type="submit"
                className="!w-full !py-4 !bg-[#1abc60] !text-white !rounded-2xl !font-black !uppercase !tracking-widest !text-sm !hover:!bg-[#169c4e] !transition-all !shadow-lg !shadow-[#1abc60]/20 !mt-2 !cursor-pointer !border-none"
              >
                Confirm Settlement
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Admin Details Modal */}
      {showAdminModal && selectedAdmin && (
        <div className="!fixed !inset-0 !bg-black/60 !z-[999] !flex !items-center !justify-center !p-4 !backdrop-blur-sm">
          <div className="!bg-white !rounded-3xl !w-full !max-w-2xl !max-h-[90vh] !overflow-y-auto !shadow-2xl !border !border-gray-100 !animate-in !fade-in !zoom-in-95 !duration-200">
            {/* Modal Header */}
            <div className="!p-6 !border-b !border-gray-100 !flex !items-center !justify-between !sticky !top-0 !bg-white !z-10">
              <div className="!flex !items-center !gap-4">
                <div className="!w-12 !h-12 !rounded-2xl !bg-emerald-50 !text-[#1abc60] !font-bold !flex !items-center !justify-center !text-xl">
                  {getInitials(selectedAdmin.name)}
                </div>
                <div>
                  <h3 className="!text-xl !font-black !text-gray-900 !m-0">{selectedAdmin.name}</h3>
                  <p className="!text-sm !text-gray-500 !m-0 !font-medium">{selectedAdmin.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAdminModal(false)}
                className="!p-2 !hover:!bg-gray-100 !rounded-xl !text-gray-400 !hover:!text-gray-600 !transition-all !border-none !cursor-pointer"
              >
                <X className="!w-6 !h-6" />
              </button>
            </div>

            <div className="!p-8 !space-y-8">
              {/* Stats Overview */}
              <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-4">
                <div className="!bg-emerald-50/50 !p-5 !rounded-2xl !border !border-emerald-100">
                  <div className="!flex !items-center !gap-2 !mb-2">
                    <Wallet className="!w-4 !h-4 !text-[#1abc60]" />
                    <span className="!text-[10px] !font-black !text-[#1abc60] !uppercase !tracking-widest">Total Earnings</span>
                  </div>
                  <p className="!text-2xl !font-black !text-gray-900 !m-0">₹{selectedAdmin.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="!bg-blue-50/50 !p-5 !rounded-2xl !border !border-blue-100">
                  <div className="!flex !items-center !gap-2 !mb-2">
                    <Calendar className="!w-4 !h-4 !text-blue-600" />
                    <span className="!text-[10px] !font-black !text-blue-600 !uppercase !tracking-widest">Booking Revenue</span>
                  </div>
                  <p className="!text-2xl !font-black !text-gray-900 !m-0">₹{selectedAdmin.bookingRevenue.total.toLocaleString()}</p>
                </div>
                <div className="!bg-purple-50/50 !p-5 !rounded-2xl !border !border-purple-100">
                  <div className="!flex !items-center !gap-2 !mb-2">
                    <Trophy className="!w-4 !h-4 !text-purple-600" />
                    <span className="!text-[10px] !font-black !text-purple-600 !uppercase !tracking-widest">Tournament Fees</span>
                  </div>
                  <p className="!text-2xl !font-black !text-gray-900 !m-0">₹{selectedAdmin.tournamentRevenue.toLocaleString()}</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="!space-y-4">
                <h4 className="!text-sm !font-black !text-gray-900 !uppercase !tracking-widest !flex !items-center !gap-2">
                  <PieChart className="!w-4 !h-4 !text-[#1abc60]" /> Revenue Split
                </h4>
                
                <div className="!space-y-3">
                  <div className="!flex !items-center !justify-between !p-4 !bg-gray-50 !rounded-2xl !border !border-gray-100">
                    <div className="!flex !items-center !gap-3">
                      <div className="!w-2 !h-2 !rounded-full !bg-blue-500" />
                      <span className="!text-sm !font-bold !text-gray-700">Online Bookings</span>
                    </div>
                    <span className="!text-sm !font-black !text-gray-900">₹{selectedAdmin.bookingRevenue.online.toLocaleString()}</span>
                  </div>
                  
                  <div className="!flex !items-center !justify-between !p-4 !bg-gray-50 !rounded-2xl !border !border-gray-100">
                    <div className="!flex !items-center !gap-3">
                      <div className="!w-2 !h-2 !rounded-full !bg-orange-500" />
                      <span className="!text-sm !font-bold !text-gray-700">Offline Bookings</span>
                    </div>
                    <span className="!text-sm !font-black !text-gray-900">₹{selectedAdmin.bookingRevenue.offline.toLocaleString()}</span>
                  </div>

                  <div className="!flex !items-center !justify-between !p-4 !bg-gray-50 !rounded-2xl !border !border-gray-100">
                    <div className="!flex !items-center !gap-3">
                      <div className="!w-2 !h-2 !rounded-full !bg-purple-500" />
                      <span className="!text-sm !font-bold !text-gray-700">Tournaments</span>
                    </div>
                    <span className="!text-sm !font-black !text-gray-900">₹{selectedAdmin.tournamentRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="!p-5 !bg-[#1abc60]/5 !rounded-3xl !border !border-[#1abc60]/20 !flex !items-center !gap-4">
                <div className="!w-10 !h-10 !bg-[#1abc60] !rounded-xl !flex !items-center !justify-center">
                  <Activity className="!w-5 !h-5 !text-white" />
                </div>
                <div>
                  <p className="!text-[10px] !font-black !text-[#1abc60] !uppercase !tracking-widest !m-0">Performance Note</p>
                  <p className="!text-xs !text-emerald-800 !m-0 !font-medium">
                    This admin accounts for {((selectedAdmin.totalRevenue / (summary?.totalRevenue || 1)) * 100).toFixed(1)}% of the total platform revenue.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="!p-6 !border-t !border-gray-100 !flex !justify-end !bg-gray-50/50">
              <button 
                onClick={() => setShowAdminModal(false)}
                className="!px-6 !py-2.5 !bg-white !border !border-gray-200 !text-gray-700 !rounded-xl !text-sm !font-bold !hover:!bg-gray-50 !transition-all !cursor-pointer !shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}