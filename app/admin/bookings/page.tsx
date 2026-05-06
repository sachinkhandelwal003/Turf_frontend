"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Calendar, Clock, MapPin, Search, Loader2, 
  CheckCircle2, XCircle, Clock4, Filter, User as UserIcon
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';

interface Booking {
  _id: string;
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
  };
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function AdminBookingsPage() {
  const { isSuperadmin, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
  }, [authLoading, isSuperadmin]);

  const fetchBookings = async () => {
    try {
      const endpoint = isSuperadmin ? '/bookings/all' : '/bookings/admin/my-turfs'; 
      console.log('Fetching bookings from:', endpoint);
      const res = await api.get(endpoint);
      if (res.data.success) {
        setBookings(res.data.bookings || []);
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

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.turf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getImageUrl = (path: string) => {
    if (!path) return '/placeholder-turf.png'; // Add a fallback
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  if (loading) {
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
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1abc60] transition-colors" />
          <input 
            type="text" 
            placeholder="Search turf or user..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all font-bold text-sm text-gray-700 shadow-sm"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all font-bold text-sm text-gray-700 shadow-sm appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredBookings.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] border border-gray-100 text-center space-y-4 shadow-sm">
            <Calendar className="w-16 h-16 text-gray-100 mx-auto" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No bookings found matching your criteria</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-[#1abc60]">
              <div className="p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                
                {/* Turf Info */}
                <div className="flex items-center gap-6 flex-1 min-w-0 w-full">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 shadow-sm">
                    <img 
                      src={getImageUrl(booking.turf.images?.[0])} 
                      alt={booking.turf.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-gray-900 truncate">{booking.turf.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-[#1abc60]" />
                      {booking.turf.location.city}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="bg-green-50 text-[#1abc60] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                        {booking.sport}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
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
                <div className="flex-1 w-full lg:border-l lg:pl-8 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#1abc60] transition-colors border border-gray-100">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">{booking.user?.name || 'Guest'}</p>
                      <p className="text-[10px] text-gray-400 font-bold lowercase truncate">{booking.user?.email}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold ml-11">{booking.user?.phone}</p>
                </div>

                {/* Slot Info */}
                <div className="flex-1 w-full lg:border-l lg:pl-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-black text-gray-700">{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-black text-gray-700">{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <p className="text-xl font-black text-gray-900 ml-7">₹{booking.price}</p>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 w-full lg:w-auto shrink-0">
                  {booking.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                        className="flex-1 lg:w-32 bg-[#1abc60] text-white py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-100 hover:bg-[#16a085] transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        className="flex-1 lg:w-32 bg-red-50 text-red-600 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button 
                      onClick={() => handleStatusUpdate(booking._id, 'completed')}
                      className="w-full bg-blue-50 text-blue-600 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-blue-100 hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
