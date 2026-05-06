"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Calendar, MapPin, Search, Loader2, 
  CheckCircle2, XCircle, Clock4, Filter, User as UserIcon,
  ChevronLeft, ChevronRight, Hash
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  _id: string;
  bookingId?: string;
  turf: {
    name: string;
    location: {
      city: string;
    };
    images: string[];
  };
  user: {
    name: string;
    email: string;
    phone: string;
    profilePhoto?: string;
  };
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  totalAmount?: number;
  courts: string[];
  paymentStatus?: string;
  paymentMethod?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function AdminBookingsPage() {
  const { isSuperadmin, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
  }, [authLoading, isSuperadmin, currentPage, statusFilter]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!authLoading) {
        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          fetchBookings();
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const endpoint = isSuperadmin ? '/bookings/all' : '/bookings/admin/my-turfs'; 
      const res = await api.get(endpoint, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          status: statusFilter
        }
      });
      if (res.data.success) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.pages || 1);
        setTotalBookings(res.data.total || 0);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await api.patch(`/bookings/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus as any } : b));
        toast.success(`Booking ${newStatus} successfully`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '/placeholder-turf.png';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
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

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Manage Bookings</h1>
          <p className="text-gray-500 font-bold text-sm mt-1 uppercase tracking-widest">Monitor and moderate venue reservations</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-[24px] border border-gray-100 shadow-sm flex flex-col items-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Bookings</p>
          <p className="text-xl font-black text-[#1abc60]">{totalBookings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="md:col-span-8 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1abc60] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by ID, User, or Venue..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all font-bold text-sm text-gray-700"
          />
        </div>

        <div className="md:col-span-4 relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-10 py-4 bg-gray-50/50 border border-transparent rounded-[20px] outline-none focus:bg-white focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all font-bold text-sm text-gray-700 appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronLeft className="w-4 h-4 text-gray-400 rotate-270" />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-6 min-h-[400px] relative">
        {loading && bookings.length > 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[40px]">
            <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
          </div>
        )}
        
        <AnimatePresence mode="popLayout">
          {bookings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-24 rounded-[48px] border border-gray-100 text-center space-y-6 shadow-sm"
            >
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="w-10 h-10 text-gray-200" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">No Bookings Found</h3>
                <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">Try adjusting your search or filters</p>
              </div>
            </motion.div>
          ) : (
            bookings.map((booking) => (
              <motion.div 
                layout
                key={booking._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-green-100 transition-all group border-l-8 border-l-[#1abc60]"
              >
                <div className="p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                  
                  {/* Turf Info */}
                  <div className="flex items-center gap-6 flex-1 min-w-0 w-full">
                    <div className="w-24 h-24 rounded-[28px] overflow-hidden shrink-0 shadow-sm bg-gray-50 flex items-center justify-center border border-gray-100">
                      {booking.turf?.images?.[0] ? (
                        <img 
                          src={getImageUrl(booking.turf.images[0])} 
                          alt={booking.turf.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      ) : (
                        <MapPin className="w-8 h-8 text-gray-200" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 bg-gray-100 rounded-md flex items-center gap-1.5">
                          <Hash className="w-3 h-3 text-gray-400" />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{booking.bookingId || booking._id.slice(-8)}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 truncate tracking-tight">{booking.turf?.name || 'Unknown Venue'}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
                        <MapPin className="w-3 h-3 text-[#1abc60]" />
                        {booking.turf?.location?.city || 'Unknown City'}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="bg-green-50 text-[#1abc60] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                          {booking.sport}
                        </span>
                        {booking.courts?.map((court, idx) => (
                          <span key={idx} className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                            {court}
                          </span>
                        ))}
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          booking.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' : 
                          booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' : 
                          'bg-gray-50 text-gray-600 border-gray-100'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 w-full lg:border-l lg:pl-10 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-gray-50 flex items-center justify-center border border-gray-100">
                        {booking.user?.profilePhoto ? (
                          <img 
                            src={getImageUrl(booking.user.profilePhoto)} 
                            alt={booking.user.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <UserIcon className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{booking.user?.name || 'Guest'}</p>
                        <p className="text-[10px] text-gray-400 font-bold lowercase truncate">{booking.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <p className="text-[10px] text-gray-500 font-black tracking-widest">{booking.user?.phone || 'No phone'}</p>
                    </div>
                  </div>

                  {/* Slot Info */}
                  <div className="flex-1 w-full lg:border-l lg:pl-10 space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                          <Calendar className="w-3.5 h-3.5 text-[#1abc60]" />
                        </div>
                        <span className="text-sm font-black text-gray-700 tracking-tight">{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                          <Clock4 className="w-3.5 h-3.5 text-[#1abc60]" />
                        </div>
                        <span className="text-sm font-black text-gray-700 tracking-tight">{booking.startTime} - {booking.endTime}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-50">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment: {booking.paymentStatus || 'Pending'}</p>
                      <p className="text-2xl font-black text-gray-900 tracking-tighter">₹{booking.totalAmount || booking.price}</p>
                      {booking.paymentMethod && <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Via {booking.paymentMethod}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                        className="flex-1 lg:w-36 bg-[#1abc60] text-white py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest hover:bg-[#16a085] hover:scale-105 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        className="flex-1 lg:w-36 bg-white text-red-500 border-2 border-red-50 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                        className="flex-1 lg:w-36 bg-blue-600 text-white py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </button>
                    )}
                    {['cancelled', 'completed'].includes(booking.status) && (
                      <div className="flex-1 lg:w-36 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest text-center text-gray-400 border border-dashed border-gray-200">
                        {booking.status}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900">{bookings.length}</span> of <span className="text-gray-900">{totalBookings}</span> reservations
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-3.5 bg-white border border-gray-100 rounded-[20px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm group"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Simple logic to show pages
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-12 h-12 rounded-[20px] font-black text-sm transition-all shadow-sm ${
                        currentPage === pageNum 
                          ? 'bg-[#1abc60] text-white' 
                          : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="text-gray-300 font-black px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-3.5 bg-white border border-gray-100 rounded-[20px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm group"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
