"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, ChevronRight, Star, 
  Download, History, User, Settings, LogOut,
  CheckCircle2, XCircle, Clock4, Loader2
} from 'lucide-react';
import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

interface Booking {
  _id: string;
  bookingId: string;
  turf: {
    _id: string;
    name: string;
    location: {
      address: string;
      city: string;
    };
    images: string[];
    pricePerHour?: number; // Added for conceptual calculation
  };
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  courts: string[];
  slots?: string[];
  isMultiple?: boolean;
  tournament?: { // Added for tournament bookings
    _id: string;
    title: string;
    entryFee?: number;
  };
}

export default function MyBookingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/my?filter=${activeTab}`);
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (error: any) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getDurationInHours = (start: string, end: string) => {
    try {
      const [sh, sm] = (start || "00:00").split(':').map(Number);
      const [eh, em] = (end || "00:00").split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      return diff > 0 ? diff / 60 : 1;
    } catch (e) {
      return 1;
    }
  };

  const parseSafeNumber = (val: any) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val.replace(/[^0-9.]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getBookingTotal = (booking: Booking) => {
    // 1. Try direct amounts from booking object
    const directAmount = parseSafeNumber(booking.totalAmount || booking.price || booking.paidAmount);
    if (directAmount > 0) return directAmount;

    // 2. Fallback conceptual calculation
    try {
      const basePrice = parseSafeNumber(booking.turf?.pricePerHour);
      const effectivePrice = basePrice > 0 ? basePrice : 500; // Final absolute fallback
      
      const numCourts = booking.courts?.length || 1;

      if (booking.isMultiple && booking.slots) {
        const totalHours = booking.slots.reduce((sum, slot) => {
          const [s, e] = slot.split(' - ');
          return sum + getDurationInHours(s, e);
        }, 0);
        return totalHours * effectivePrice * numCourts;
      }

      return getDurationInHours(booking.startTime, booking.endTime) * effectivePrice * numCourts;
    } catch (e) {
      return 500; // Last resort default
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '/placeholder-turf.png';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
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
                <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#1abc60] text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-green-100">
                  <Calendar className="w-5 h-5" />
                  Grounds Bookings
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
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">My Bookings</h1>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Review and manage your upcoming athletic sessions and tournament histories.</p>
            </div>

            {/* --- TABS --- */}
            <div className="flex flex-wrap gap-4">
              {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    activeTab === tab 
                    ? 'bg-[#1abc60] text-white shadow-lg shadow-green-100' 
                    : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200 shadow-sm'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* --- BOOKINGS LIST --- */}
            <div className="space-y-6">
              {loading ? (
                <div className="bg-white rounded-[40px] p-20 flex flex-col items-center justify-center space-y-4 border border-gray-100">
                  <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Fetching your bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 flex flex-col items-center justify-center space-y-6 border border-gray-100 shadow-sm text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                    <History className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-gray-900 uppercase">No {activeTab} bookings</h3>
                    <p className="text-gray-400 font-bold text-sm">Looks like you haven't booked any ground recently.</p>
                  </div>
                  <Link 
                    href="/ground"
                    className="px-8 py-4 bg-[#1abc60] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-green-100 hover:scale-105 transition-all"
                  >
                    Explore Grounds
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {bookings.map((booking) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={booking._id}
                      className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                      <div className="flex flex-col md:flex-row p-6 lg:p-8 gap-8 items-center">
                        {/* Image */}
                        <div className="w-full md:w-56 lg:w-72 h-48 lg:h-56 rounded-3xl overflow-hidden shrink-0 shadow-md">
                          <img 
                            src={getImageUrl(booking.turf.images?.[0])} 
                            alt={booking.turf.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-6 w-full">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-1">
                              <h3 className="text-2xl font-black text-gray-900">{booking.turf.name}</h3>
                              <div className="flex items-center gap-2 text-[#1abc60] font-black text-[10px] uppercase tracking-widest">
                                <Settings className="w-3 h-3" />
                                {booking.sport} | {booking.courts.join(', ')}
                              </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              booking.status === 'confirmed' ? 'bg-green-50 text-[#1abc60] border-green-100' :
                              booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-gray-50 text-gray-500 border-gray-100'
                            }`}>
                              {booking.status}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-b border-gray-50 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1abc60] border border-gray-100">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Date</p>
                                <p className="text-sm font-black text-gray-900">{booking.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#1abc60] border border-gray-100">
                                <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Time</p>
                                <p className="text-sm font-black text-gray-900">{booking.startTime} - {booking.endTime}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total:</span>
                                <span className="text-xl font-black text-gray-900">₹ {getBookingTotal(booking).toLocaleString()}</span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-[10px] font-black text-[#1abc60] uppercase tracking-widest">Paid:</span>
                                <span className="text-2xl font-black text-[#1abc60]">₹ {parseSafeNumber(booking.paidAmount).toLocaleString()}</span>
                              </div>
                              {parseSafeNumber(booking.balanceAmount) > 0 ? (
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                                  Balance: ₹{parseSafeNumber(booking.balanceAmount).toLocaleString()} due at ground
                                </p>
                              ) : null}
                            </div>
                            <div className="flex gap-3">
                              {activeTab === 'completed' && (
                                <button className="px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                                  Write Review
                                </button>
                              )}
                              <Link 
                                href={`/payment-success/${booking._id}`}
                                className="px-8 py-3 bg-[#1abc60] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100 hover:scale-105 transition-all"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
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
