"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, User, Settings, LogOut, Calendar, Clock,
  CheckCircle2, XCircle, Clock4, Loader2, ArrowRight,
  AlertCircle, DollarSign, RefreshCw
} from 'lucide-react';
import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

interface Refund {
  _id: string;
  booking: {
    bookingId: string;
    date: string;
    startTime: string;
    turf: {
      name: string;
    };
  };
  reason: string;
  amount: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  rejectionReason?: string;
  createdAt: string;
}

export default function MyRefundsPage() {
  const { user, logout } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/refunds/my');
      if (res.data.success) {
        setRefunds(res.data.refunds);
      }
    } catch (error: any) {
      toast.error("Failed to load refunds");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '/placeholder-turf.png';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSED':
      case 'APPROVED':
        return 'bg-green-50 text-[#1abc60] border-green-100';
      case 'REJECTED':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'venue_closed':
        return 'Venue Closed';
      case 'venue_unavailable':
        return 'Venue Unavailable';
      case 'wrong_booking':
        return 'Wrong Booking';
      case 'user_initiated':
        return 'Cancelled by User';
      case 'other':
        return 'Other';
      default:
        return reason;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* --- SIDEBAR --- */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 sticky top-28">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-green-50">
                    <img 
                      src={user?.profilePhoto ? getImageUrl(user.profilePhoto) : "https://ui-avatars.com/api/?name=" + user?.name} 
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{user?.name}</h2>
                  <p className="text-sm text-gray-500 font-bold lowercase">{user?.email}</p>
                </div>
              </div>

              <div className="mt-10 space-y-2">
                <Link href="/bookings" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-500 hover:bg-gray-50 font-bold text-sm uppercase tracking-wider transition-all">
                  <Calendar className="w-5 h-5" />
                  Grounds Bookings
                </Link>
                <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#1abc60] text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-green-100">
                  <History className="w-5 h-5" />
                  Refunds
                </button>
                <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-500 hover:bg-gray-50 font-bold text-sm uppercase tracking-wider transition-all">
                  <User className="w-5 h-5" />
                  Edit Profile
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 font-bold text-sm uppercase tracking-wider transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-1 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">My Refunds</h1>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Track your refund requests and statuses.</p>
            </div>

            {/* --- REFUNDS LIST --- */}
            <div className="space-y-6">
              {loading ? (
                <div className="bg-white rounded-[40px] p-20 flex flex-col items-center justify-center space-y-4 border border-gray-100">
                  <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Fetching refunds...</p>
                </div>
              ) : refunds.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 flex flex-col items-center justify-center space-y-6 border border-gray-100 shadow-sm text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                    <History className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-gray-900 uppercase">No Refunds</h3>
                    <p className="text-gray-400 font-bold text-sm">You haven't requested any refunds yet.</p>
                  </div>
                  <Link 
                    href="/bookings"
                    className="px-8 py-4 bg-[#1abc60] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-100 hover:scale-105 transition-all"
                  >
                    View Bookings
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {refunds.map((refund) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={refund._id}
                      className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                    >
                      <div className="p-6 lg:p-8 space-y-6">
                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className="text-xl font-black text-gray-900">{refund.booking.turf.name}</h3>
                            <p className="text-sm text-gray-500 font-bold">Booking ID: {refund.booking.bookingId}</p>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(refund.status)}`}>
                            {refund.status}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Refund Amount</p>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-[#1abc60]" />
                              <span className="text-lg font-black text-gray-900">₹{refund.amount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Reason</p>
                            <span className="text-sm font-black text-gray-900">{getReasonText(refund.reason)}</span>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Booking Date</p>
                            <span className="text-sm font-black text-gray-900">{refund.booking.date}</span>
                          </div>
                          <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Requested On</p>
                            <span className="text-sm font-black text-gray-900">{new Date(refund.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Rejection Reason if applicable */}
                        {refund.status === 'REJECTED' && refund.rejectionReason && (
                          <div className="bg-red-50 rounded-2xl p-4 flex items-start gap-3">
                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-black text-red-900 text-sm mb-1">Rejection Reason</p>
                              <p className="text-red-700 text-sm font-medium">{refund.rejectionReason}</p>
                            </div>
                          </div>
                        )}

                        {/* Processed badge */}
                        {refund.status === 'PROCESSED' && (
                          <div className="bg-green-50 rounded-2xl p-4 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#1abc60]" />
                            <p className="font-black text-green-900 text-sm">Refund has been processed successfully!</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
