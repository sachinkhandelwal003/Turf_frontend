"use client";

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  RefreshCw, Loader2, Search, Filter, XCircle, CheckCircle2,
  ChevronLeft, ChevronRight, X, User, Phone, Calendar, DollarSign,
  CreditCard, FileText
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface Refund {
  _id: string;
  booking: {
    _id: string;
    bookingId?: string;
    date: string;
    startTime: string;
    endTime: string;
    turf?: {
      name: string;
      location?: {
        city: string;
      };
    };
  };
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  userInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  admin?: {
    name: string;
    email: string;
  };
  reason: string;
  description?: string;
  amount: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  upiDetails?: {
    upiId?: string;
    upiName?: string;
    upiNote?: string;
  };
  rejectionReason?: string;
  processedBy?: any;
  processedAt?: string;
  createdAt: string;
}

export default function AdminRefundsPage() {
  return (
    <Suspense fallback={<div className="!min-h-[80vh] !flex !items-center !justify-center"><Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" /></div>}>
      <AdminRefundsContent />
    </Suspense>
  );
}

function AdminRefundsContent() {
  const { isSuperadmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRefunds, setTotalRefunds] = useState(0);
  const itemsPerPage = 10;

  // Modal for viewing/processing refund
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchRefunds();
    }
  }, [authLoading, isAuthenticated, currentPage, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!authLoading && isAuthenticated) {
        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          fetchRefunds();
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [authLoading, isAuthenticated, searchTerm]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      console.log('Fetching refunds from /api/refunds/admin with params:', params);
      const res = await api.get('/refunds/admin', { params });
      console.log('Refunds API response:', res);

      if (res.data.success) {
        let filteredRefunds = res.data.refunds || [];

        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredRefunds = filteredRefunds.filter((refund: Refund) => 
            ((refund.userInfo?.name && refund.userInfo.name.toLowerCase().includes(searchLower)) ||
            (refund.user?.name && refund.user.name.toLowerCase().includes(searchLower))) ||
            ((refund.userInfo?.email && refund.userInfo.email.toLowerCase().includes(searchLower)) ||
            (refund.user?.email && refund.user.email.toLowerCase().includes(searchLower))) ||
            ((refund.userInfo?.phone && refund.userInfo.phone.includes(searchTerm)) ||
            (refund.user?.phone && refund.user.phone.includes(searchTerm))) ||
            (refund.booking?.bookingId && refund.booking.bookingId.toLowerCase().includes(searchLower)) ||
            refund._id.toLowerCase().includes(searchLower)
          );
        }

        setRefunds(filteredRefunds);
        setTotalPages(res.data.pages || 1);
        setTotalRefunds(res.data.total || 0);
      }
    } catch (error: any) {
      console.error('Error fetching refunds - full error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      toast.error(error.response?.data?.error || error.response?.data?.msg || 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      return new Date(dateStr).toLocaleDateString('en-IN', options);
    } catch (e) {
      return dateStr;
    }
  };

  const to12h = (time24: string) => {
    const [hhRaw, mmRaw] = (time24 || '00:00').split(':');
    const hh = Number(hhRaw);
    const mm = Number(mmRaw);
    const h = (hh % 12) || 12;
    const ampm = hh < 12 ? 'AM' : 'PM';
    return `${h}:${String(mm || 0).padStart(2, '0')} ${ampm}`;
  };

  const handleProcessRefund = async () => {
    if (!selectedRefund || !processingAction) return;

    if (processingAction === 'REJECT' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      const payload: any = {
        refundId: selectedRefund._id,
        action: processingAction,
      };

      if (processingAction === 'REJECT') {
        payload.rejectionReason = rejectionReason;
      }

      const res = await api.post('/refunds/admin/process', payload);

      if (res.data.success) {
        toast.success(`Refund ${processingAction.toLowerCase()}ed successfully`);
        setShowRefundModal(false);
        setSelectedRefund(null);
        setProcessingAction(null);
        setRejectionReason('');
        fetchRefunds();
      }
    } catch (error: any) {
      console.error('Error processing refund:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '!bg-yellow-50 !text-yellow-700 !border-yellow-200/60';
      case 'UNDER_REVIEW':
        return '!bg-blue-50 !text-blue-700 !border-blue-200/60';
      case 'APPROVED':
        return '!bg-emerald-50 !text-emerald-700 !border-emerald-200/60';
      case 'PROCESSED':
        return '!bg-[#1abc60] !text-white !border-[#1abc60]';
      case 'REJECTED':
        return '!bg-red-50 !text-red-700 !border-red-200/60';
      default:
        return '!bg-slate-50 !text-slate-600 !border-slate-200';
    }
  };

  return (
    <div className="!w-full !font-sans !bg-white !rounded-[24px] !border !border-slate-200/80 !shadow-sm !p-6 md:!p-8 !space-y-6">
      
      {/* Header Section */}
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4 !pb-6 !border-b !border-slate-100">
        <div>
          <h1 className="!text-2xl md:!text-3xl !font-black !text-slate-900 !tracking-tight !m-0 !mb-1.5">Refund Requests</h1>
          <p className="!text-sm !font-medium !text-slate-500 !m-0">Manage and process user refund requests</p>
        </div>
        <div className="!flex !items-center !gap-4">
          <div className="!bg-slate-50 !px-5 !py-2 !rounded-xl !border !border-slate-200 !flex !flex-col !items-center !min-w-[120px]">
            <p className="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-0.5 !m-0">Total</p>
            <p className="!text-xl !font-black !text-[#1abc60] !leading-none !m-0">{totalRefunds}</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="!space-y-4">
        <div className="!grid !grid-cols-1 md:!grid-cols-12 !gap-4 !bg-slate-50/60 !p-5 !rounded-2xl !border !border-slate-100">
          
          {/* Search */}
          <div className="md:!col-span-6 !relative !group">
            <div className="!absolute !inset-y-0 !left-0 !pl-3.5 !flex !items-center !pointer-events-none">
              <Search className="!w-4 !h-4 !text-slate-400 group-focus-within:!text-[#1abc60] !transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search by user name, email, phone or refund ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!w-full !pl-10 !pr-4 !py-2.5 !bg-white !border !border-slate-200 focus:!outline-none focus:!ring-1 focus:!ring-[#1abc60] focus:!border-[#1abc60] !text-[13px] !font-medium !text-slate-900 !rounded-xl !transition-all placeholder:!text-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div className="md:!col-span-4 !relative !group">
            <div className="!absolute !inset-y-0 !left-0 !pl-3.5 !flex !items-center !pointer-events-none">
              <Filter className="!w-4 !h-4 !text-slate-400 group-focus-within:!text-[#1abc60] !transition-colors" />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !pl-10 !pr-8 !py-2.5 !bg-white !border !border-slate-200 focus:!outline-none focus:!ring-1 focus:!ring-[#1abc60] focus:!border-[#1abc60] !text-[13px] !font-medium !text-slate-900 !rounded-xl !appearance-none !cursor-pointer !transition-all"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="PROCESSED">Processed</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <div className="!absolute !inset-y-0 !right-0 !pr-3 !flex !items-center !pointer-events-none">
              <ChevronLeft className="!w-4 !h-4 !text-gray-400 !-rotate-90" />
            </div>
          </div>

          {/* Clear Button */}
          <div className="md:!col-span-2">
            <button 
              onClick={clearFilters}
              className="!w-full !flex !items-center !justify-center !gap-2 !bg-white !text-slate-600 !border !border-slate-200 !py-2.5 !px-4 !rounded-xl !text-[13px] !font-semibold hover:!bg-slate-50 hover:!text-slate-900 !transition-all !cursor-pointer"
            >
              <XCircle className="!w-4 !h-4 !block !shrink-0" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Refunds List Area */}
      <div className="!relative !min-h-[400px]">
        {loading && refunds.length > 0 && (
          <div className="!absolute !inset-0 !bg-white/50 !backdrop-blur-sm !z-10 !flex !items-center !justify-center !rounded-2xl">
            <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {!loading && refunds.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="!bg-white !py-16 !px-6 !rounded-2xl !border !border-gray-100 !text-center !shadow-sm"
            >
              <div className="!w-16 !h-16 !bg-slate-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4 !border !border-gray-200">
                <RefreshCw className="!w-6 !h-6 !text-slate-400" />
              </div>
              <h3 className="!text-slate-900 !font-bold !text-lg !mb-1.5 !m-0">No Refund Requests</h3>
              <p className="!text-slate-500 !text-sm !font-medium !m-0">There are no refund requests matching your filters.</p>
            </motion.div>
          ) : (
            <div className="!space-y-4">
              {refunds.map((refund) => (
                <motion.div 
                  layout
                  key={refund._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="!bg-white !rounded-2xl !border !border-slate-200/80 !overflow-hidden hover:!border-emerald-100 hover:!bg-emerald-50/5 !transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedRefund(refund);
                    setShowRefundModal(true);
                  }}
                >
                  <div className="!p-5 md:!p-6 !flex !flex-col lg:!flex-row !gap-6 !items-start lg:!items-center">
                    
                    {/* Booking & Turf Info */}
                    <div className="!flex !items-center !gap-4 !flex-1 !min-w-0 !w-full">
                      <div className="!w-16 !h-16 !rounded-xl !overflow-hidden !shrink-0 !bg-slate-50 !border !border-slate-100 !flex !items-center !justify-center">
                        <FileText className="!w-5 !h-5 !text-slate-300" />
                      </div>
                      <div className="!min-w-0">
                        <div className="!flex !items-center !gap-1.5 !mb-1 !text-slate-400">
                          <span className="!text-[10px] !font-bold !uppercase !tracking-wider">{(refund.booking?.bookingId) || `#${refund._id.slice(-8)}`}</span>
                        </div>
                        <h3 className="!text-[15px] !font-bold !text-slate-900 !truncate !m-0">
                          {(refund.booking?.turf?.name) || 'Unknown Venue'}
                        </h3>
                        <div className="!flex !items-center !text-xs !font-medium !text-slate-550 !mt-1">
                          <Calendar className="!w-3.5 !h-3.5 !mr-1 !text-slate-400 !shrink-0" />
                          <span className="!truncate">{formatDate((refund.booking?.date) || refund.createdAt)}</span>
                        </div>
                        <div className="!mt-3 !flex !flex-wrap !gap-1.5">
                          <span className={`!px-2.5 !py-1 !rounded-md !text-[9px] !font-bold !uppercase !tracking-wider !border ${getStatusBadgeClass(refund.status)}`}>
                            {(refund.status || 'PENDING').replace('_', ' ')}
                          </span>
                          <span className="!bg-slate-50 !text-slate-600 !px-2.5 !py-1 !rounded-md !text-[9px] !font-bold !uppercase !tracking-wider !border !border-slate-200">
                            {(refund.reason || 'other')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="!flex-1 !w-full lg:!border-l lg:!border-slate-100 lg:!px-6 !space-y-2">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-10 !h-10 !rounded-full !bg-emerald-50 !flex !items-center !justify-center !border !border-emerald-100 !shrink-0 !overflow-hidden !text-[#1abc60]">
                          <User className="!w-4.5 !h-4.5" />
                        </div>
                        <div className="!min-w-0">
                          <p className="!text-[14px] !font-bold !text-slate-900 !truncate !m-0">{(refund.userInfo?.name) || (refund.user?.name) || 'Guest User'}</p>
                          <p className="!text-[12px] !font-medium !text-slate-555 !truncate !m-0">{(refund.userInfo?.email) || (refund.user?.email) || ''}</p>
                        </div>
                      </div>
                      <div className="!pl-[52px]">
                        <span className="!text-[10px] !font-bold !text-slate-500 !bg-slate-50 !px-2.5 !py-1 !rounded-md !border !border-slate-200">
                          {(refund.userInfo?.phone) || (refund.user?.phone) || 'No phone'}
                        </span>
                      </div>
                    </div>

                    {/* Refund Amount */}
                    <div className="!flex-1 !w-full lg:!border-l lg:!border-slate-100 lg:!px-6 !space-y-3">
                      <div className="!flex !flex-col !items-end !gap-1">
                        <p className="!text-[10px] !font-bold !text-slate-400 !m-0 !uppercase !tracking-wider">Refund Amount</p>
                        <p className="!text-lg !font-black !text-[#1abc60] !m-0">₹{Number(refund.amount || 0).toLocaleString()}</p>
                        <p className="!text-[10px] !text-slate-500 !m-0">
                          Requested on {formatDate(refund.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="!flex !flex-row lg:!flex-col !gap-2 !w-full lg:!w-32 !shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRefund(refund);
                          setShowRefundModal(true);
                        }}
                        className="!flex-1 !w-full !bg-[#1abc60] !text-white !py-2.5 !px-3 !rounded-xl !text-[13px] !font-bold hover:!bg-[#169c4e] !transition-all !flex !items-center !justify-center !gap-1.5 !border-none !cursor-pointer !shadow-md hover:!shadow-lg hover:!shadow-[#1abc60]/20"
                      >
                        View
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="!flex !flex-col sm:!flex-row !items-center !justify-between !gap-4 !pt-6 !border-t !border-slate-100">
          <p className="!text-[13px] !font-medium !text-slate-505 !m-0">
            Showing <span className="!font-bold !text-slate-900">{refunds.length}</span> of <span className="!font-bold !text-slate-900">{totalRefunds}</span> results
          </p>
          <div className="!flex !items-center !gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="!p-2 !bg-white !border !border-slate-200 !text-slate-505 !rounded-xl disabled:!opacity-50 disabled:!cursor-not-allowed hover:!bg-slate-50 !transition-all !cursor-pointer"
            >
              <ChevronLeft className="!w-4 !h-4 !block !shrink-0" />
            </button>
            
            <div className="!flex !items-center !gap-1.5 !px-1.5">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`!min-w-[36px] !h-9 !rounded-xl !text-[13px] !font-bold !transition-all !cursor-pointer ${
                        currentPage === pageNum 
                          ? '!bg-[#1abc60] !text-white !border !border-[#1abc60] !shadow-md' 
                          : '!bg-white !text-slate-655 !border !border-slate-200 hover:!bg-slate-50 hover:!border-slate-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="!text-slate-400 !px-1.5 !font-bold">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="!p-2 !bg-white !border !border-slate-200 !text-slate-505 !rounded-xl disabled:!opacity-50 disabled:!cursor-not-allowed hover:!bg-slate-50 !transition-all !cursor-pointer"
            >
              <ChevronRight className="!w-4 !h-4 !block !shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* Refund Details Modal */}
      <AnimatePresence>
        {showRefundModal && selectedRefund && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setShowRefundModal(false);
                setSelectedRefund(null);
                setProcessingAction(null);
                setRejectionReason('');
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Refund Request Details</h2>
                  <p className="text-sm text-slate-500 mt-1">ID: {selectedRefund._id}</p>
                </div>
                <button
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedRefund(null);
                    setProcessingAction(null);
                    setRejectionReason('');
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${getStatusBadgeClass(selectedRefund.status)}`}>
                    {selectedRefund.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-slate-500">
                    {formatDate(selectedRefund.createdAt)}
                  </span>
                </div>

                {/* Refund Amount */}
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Refund Amount</p>
                  <p className="text-3xl font-black text-[#1abc60]">₹{Number(selectedRefund.amount).toLocaleString()}</p>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">User Information</h3>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                      <p className="text-sm"><span className="font-semibold text-slate-700">Name:</span> {(selectedRefund.userInfo?.name) || (selectedRefund.user?.name) || '-'}</p>
                      <p className="text-sm"><span className="font-semibold text-slate-700">Email:</span> {(selectedRefund.userInfo?.email) || (selectedRefund.user?.email) || '-'}</p>
                      <p className="text-sm"><span className="font-semibold text-slate-700">Phone:</span> {(selectedRefund.userInfo?.phone) || (selectedRefund.user?.phone) || '-'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Booking Information</h3>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                      <p className="text-sm"><span className="font-semibold text-slate-700">Booking ID:</span> {selectedRefund.booking?.bookingId || '-'}</p>
                      <p className="text-sm"><span className="font-semibold text-slate-700">Venue:</span> {selectedRefund.booking?.turf?.name || '-'}</p>
                      <p className="text-sm"><span className="font-semibold text-slate-700">Date:</span> {selectedRefund.booking?.date ? formatDate(selectedRefund.booking.date) : '-'}</p>
                      <p className="text-sm"><span className="font-semibold text-slate-700">Time:</span> {selectedRefund.booking?.startTime && selectedRefund.booking?.endTime ? `${to12h(selectedRefund.booking.startTime)} - ${to12h(selectedRefund.booking.endTime)}` : '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Reason & Description */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Reason & Description</h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    <p className="text-sm"><span className="font-semibold text-slate-700">Reason:</span> {selectedRefund.reason}</p>
                    {selectedRefund.description && (
                      <p className="text-sm"><span className="font-semibold text-slate-700">Description:</span> {selectedRefund.description}</p>
                    )}
                  </div>
                </div>

                {/* UPI Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">UPI Details</h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                    {selectedRefund.upiDetails?.upiId ? (
                      <>
                        <p className="text-sm"><span className="font-semibold text-slate-700">UPI ID:</span> {selectedRefund.upiDetails.upiId}</p>
                        <p className="text-sm"><span className="font-semibold text-slate-700">Account Holder:</span> {selectedRefund.upiDetails.upiName || '-'}</p>
                        {selectedRefund.upiDetails.upiNote && (
                          <p className="text-sm"><span className="font-semibold text-slate-700">Note:</span> {selectedRefund.upiDetails.upiNote}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">No UPI details provided yet</p>
                    )}
                  </div>
                </div>

                {/* Rejection Reason (if applicable) */}
                {selectedRefund.status === 'REJECTED' && selectedRefund.rejectionReason && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Rejection Reason</h3>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <p className="text-sm text-red-700">{selectedRefund.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Processing Section - Only for Pending/Under Review/Approved */}
                {['PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(selectedRefund.status) && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Process Refund</h3>
                    
                    {!processingAction ? (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setProcessingAction('APPROVE')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve & Process
                        </button>
                        <button
                          onClick={() => setProcessingAction('REJECT')}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-red-200"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {processingAction === 'REJECT' && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Rejection Reason</label>
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Please provide a reason for rejection..."
                              rows={3}
                              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleProcessRefund()}
                            disabled={isProcessing}
                            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                              processingAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              processingAction === 'APPROVE' ? 'Confirm Approve' : 'Confirm Reject'
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setProcessingAction(null);
                              setRejectionReason('');
                            }}
                            disabled={isProcessing}
                            className="py-2.5 px-4 border border-slate-300 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-50 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
