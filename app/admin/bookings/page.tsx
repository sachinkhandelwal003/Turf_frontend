"use client";

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Calendar, MapPin, Search, Loader2, 
  CheckCircle2, XCircle, Clock4, Filter, User as UserIcon,
  ChevronLeft, ChevronRight, Hash, Plus, X, Star, Save, Trash2,
  Trophy, Settings
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
  slots?: string[];
  price: number;
  totalAmount?: number;
  courts: string[];
  paymentStatus?: string;
  paymentMethod?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface Turf {
  _id: string;
  name: string;
  pricePerHour?: number;
  slotDuration?: number;
  rates?: { day: string; price: number; isPeak?: boolean }[];
  operatingHours?: { day: string; open: string; close: string; isOpen: boolean }[];
  courts?: { name: string; courtType?: string }[];
  sports?: string[];
}

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" /></div>}>
      <AdminBookingsContent />
    </Suspense>
  );
}

function AdminBookingsContent() {
  const { isSuperadmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [turfIdFilter, setTurfIdFilter] = useState('');
  const [availableTurfs, setAvailableTurfs] = useState<Turf[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const itemsPerPage = 10;

  // Offline Booking Modal States
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineData, setOfflineData] = useState({
    turfId: '',
    sport: '',
    date: new Date().toISOString().split('T')[0],
    slots: [] as string[],
    courts: [] as string[],
    userName: '',
    userPhone: '',
    price: 0
  });
  const [bookedSlotsForOffline, setBookedSlotsForOffline] = useState<any[]>([]);
  const [isCreatingOffline, setIsCreatingOffline] = useState(false);

  useEffect(() => {
    if (showOfflineModal && offlineData.turfId && offlineData.date) {
      fetchAvailability(offlineData.turfId, offlineData.date);
    }
  }, [showOfflineModal, offlineData.turfId, offlineData.date]);

  const fetchAvailability = async (turfId: string, date: string) => {
    try {
      const res = await api.get(`/bookings/check-availability?turfId=${turfId}&date=${date}`);
      if (res.data.success) {
        setBookedSlotsForOffline(res.data.bookedSlots || []);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    }
  };

  const handleCreateOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineData.turfId || !offlineData.slots.length || !offlineData.courts.length) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsCreatingOffline(true);
    try {
      const res = await api.post("/bookings", {
        ...offlineData,
        isOffline: true,
        sport: offlineData.sport || 'General',
        // Always send computed total for accurate billing
        price: calculatedOfflineTotal
      });

      if (res.data.success) {
        toast.success("Offline booking recorded!");
        setShowOfflineModal(false);
        fetchBookings();
        // Reset form
        setOfflineData({
          turfId: '',
          sport: '',
          date: new Date().toISOString().split('T')[0],
          slots: [],
          courts: [],
          userName: '',
          userPhone: '',
          price: 0
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create offline booking");
    } finally {
      setIsCreatingOffline(false);
    }
  };

  const getTurfCourts = (turfId: string) => {
    const turf = availableTurfs.find(t => t._id === turfId) as any;
    return turf?.courts || [];
  };

  // Handle query params for offline booking
  useEffect(() => {
    const turfId = searchParams.get('turfId');
    const action = searchParams.get('action');

    if (action === 'offline' && turfId && availableTurfs.length > 0) {
      const turf = availableTurfs.find(t => t._id === turfId) as any;
      if (turf) {
        setOfflineData(prev => ({
          ...prev,
          turfId: turfId,
          sport: turf.sports?.[0] || ''
        }));
        setShowOfflineModal(true);
        // Clear params without refresh
        router.replace('/admin/bookings', { scroll: false });
      }
    }
  }, [searchParams, availableTurfs, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookings();
      fetchTurfs();
    }
  }, [authLoading, isAuthenticated, isSuperadmin]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setCurrentPage(1);
      fetchBookings();
    }
  }, [authLoading, isAuthenticated, statusFilter, startDate, endDate, startTime, endTime, turfIdFilter]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchBookings();
    }
  }, [authLoading, isAuthenticated, currentPage]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!authLoading) {
        if (!isAuthenticated) return;
        if (currentPage !== 1) {
          setCurrentPage(1);
        } else {
          fetchBookings();
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [authLoading, isAuthenticated, searchTerm]);

  const fetchTurfs = async () => {
    try {
      const res = await api.get('/turfs/my/all');
      if (res.data.success) {
        setAvailableTurfs(res.data.turfs || []);
      }
    } catch (error) {
      console.error('Error fetching turfs:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const endpoint = isSuperadmin ? '/bookings/all' : '/bookings/admin/my-turfs'; 
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter
      };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;
      if (turfIdFilter) params.turfId = turfIdFilter;
      
      const res = await api.get(endpoint, { params });
      if (res.data.success) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.pages || 1);
        setTotalBookings(res.data.total || 0);
        
        // If admin endpoint returns myTurfs, use it
        if (res.data.myTurfs && res.data.myTurfs.length > 0) {
          setAvailableTurfs(res.data.myTurfs);
        }
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setTurfIdFilter('');
    setCurrentPage(1);
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

  const to12h = (time24: string) => {
    const [hhRaw, mmRaw] = (time24 || '00:00').split(':');
    const hh = Number(hhRaw);
    const mm = Number(mmRaw);
    const h = (hh % 12) || 12;
    const ampm = hh < 12 ? 'AM' : 'PM';
    return `${h}:${String(mm || 0).padStart(2, '0')} ${ampm}`;
  };

  const formatRange = (range: string) => {
    const [start, end] = range.split(' - ').map((s) => s.trim());
    if (!start || !end) return range;
    return `${to12h(start)} - ${to12h(end)}`;
  };

  const parseTimeToMinutes = (time: string) => {
    const [h, m] = (time || '00:00').split(':').map((v) => Number(v));
    return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
  };
  const formatMinutes = (mins: number) =>
    String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');

  const buildSlotsForTurf = (turfId: string, date: string) => {
    const turf = availableTurfs.find((t) => t._id === turfId) as any;
    if (!turf) return [];
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const operatingDay = turf.operatingHours?.find((d: any) => d.day === dayName);
    if (!operatingDay || operatingDay.isOpen === false) return [];
    const open = operatingDay.open || '06:00';
    const close = operatingDay.close || '23:00';
    const duration = Number(turf.slotDuration || 60);
    const d = Math.max(15, duration || 60);
    let cur = parseTimeToMinutes(open);
    const end = parseTimeToMinutes(close);
    const slots: { value: string; label: string; startTime: string; endTime: string }[] = [];
    while (cur + d <= end) {
      const start = formatMinutes(cur);
      const endTime = formatMinutes(cur + d);
      const value = `${start} - ${endTime}`;
      slots.push({ value, label: formatRange(value), startTime: start, endTime });
      cur += d;
    }
    return slots;
  };

  const getSlotMinutes = (slotValue: string) => {
    const [start, end] = slotValue.split(" - ");
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  const getBookedCourtsForRange = (timeVal: string) => {
    const [start, end] = timeVal.split(" - ");
    const booked = new Set<string>();
    bookedSlotsForOffline.forEach((b) => {
      if (start < b.endTime && end > b.startTime) {
        b.courts.forEach((c: string) => booked.add(c));
      }
    });
    return booked;
  };

  const getEffectiveSlotPrice = (turfId: string, date: string) => {
    const turf = availableTurfs.find((t) => t._id === turfId) as any;
    if (!turf) return 0;
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const dayRate = turf.rates?.find((r: any) => r.day === dayName)?.price;
    return Number(dayRate ?? turf.pricePerHour ?? 0);
  };

  const calculatedOfflineTotal =
    getEffectiveSlotPrice(offlineData.turfId, offlineData.date) *
    (offlineData.slots.reduce((sum, slot) => sum + Math.max(0, getSlotMinutes(slot)), 0) / 60) *
    offlineData.courts.length;

  useEffect(() => {
    if (!offlineData.slots.length || !offlineData.courts.length) return;
    setOfflineData((prev) => ({
      ...prev,
      courts: prev.courts.filter(
        (courtName) => !prev.slots.some((slot) => getBookedCourtsForRange(slot).has(courtName))
      ),
    }));
  }, [offlineData.slots, bookedSlotsForOffline]);

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 px-4 sm:px-6 md:px-8 pb-8 !pt-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and moderate venue reservations</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowOfflineModal(true)}
            className="flex items-center gap-2 bg-[#1abc60] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#16a085] transition-all"
          >
            <Plus className="w-4 h-4" /> New Offline Booking
          </button>
          <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center min-w-[120px]">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-semibold text-[#1abc60]">{totalBookings}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="md:col-span-5 group flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-green-100 focus-within:border-[#1abc60] transition-all">
            <div className="pl-4 pr-3 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search by ID, User Name, Email, or Venue..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!w-full !px-2 !py-2.5 !bg-transparent !outline-none !text-sm !text-gray-700 placeholder:!text-gray-400 !border-none focus:!ring-0"
            />
          </div>

          <div className="md:col-span-3 relative group flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-green-100 focus-within:border-[#1abc60] transition-all">
            <div className="pl-4 pr-3 text-gray-400">
              <MapPin className="w-4 h-4" />
            </div>
            <select 
              value={turfIdFilter}
              onChange={(e) => {
                setTurfIdFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !px-2 !py-2.5 !bg-transparent !outline-none !text-sm !text-gray-700 !appearance-none !cursor-pointer !border-none focus:!ring-0"
            >
              <option value="">All Venues</option>
              {availableTurfs.map((turf) => (
                <option key={turf._id} value={turf._id}>{turf.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronLeft className="w-4 h-4 -rotate-90" />
            </div>
          </div>

          <div className="md:col-span-2 relative group flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-green-100 focus-within:border-[#1abc60] transition-all">
            <div className="pl-4 pr-3 text-gray-400">
              <Filter className="w-4 h-4" />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !px-2 !py-2.5 !bg-transparent !outline-none !text-sm !text-gray-700 !appearance-none !cursor-pointer !border-none focus:!ring-0"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronLeft className="w-4 h-4 -rotate-90" />
            </div>
          </div>

          <div className="md:col-span-2">
            <button 
              onClick={clearFilters}
              className="!w-full !flex !items-center !justify-center !gap-2 !bg-white !text-gray-600 !border !border-gray-200 !py-2.5 !px-4 !rounded-lg !text-sm !font-medium hover:!bg-gray-50 !transition-all !cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Date and Time Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !px-3 !py-2.5 !bg-gray-50 !border !border-gray-200 !rounded-lg !text-sm focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-green-100 focus:!border-[#1abc60] transition-all"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-medium text-gray-600">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !px-3 !py-2.5 !bg-gray-50 !border !border-gray-200 !rounded-lg !text-sm focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-green-100 focus:!border-[#1abc60] transition-all"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Start Time</label>
            <input 
              type="time" 
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !px-3 !py-2.5 !bg-gray-50 !border !border-gray-200 !rounded-lg !text-sm focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-green-100 focus:!border-[#1abc60] transition-all"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-medium text-gray-600">End Time</label>
            <input 
              type="time" 
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !px-3 !py-2.5 !bg-gray-50 !border !border-gray-200 !rounded-lg !text-sm focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-green-100 focus:!border-[#1abc60] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-4 min-h-[400px] relative">
        {loading && bookings.length > 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
          </div>
        )}
        
        <AnimatePresence mode="popLayout">
          {bookings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white py-16 px-6 rounded-xl border border-gray-200 text-center shadow-sm"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Bookings Found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters to find what you're looking for.</p>
            </motion.div>
          ) : (
            bookings.map((booking) => (
              <motion.div 
                layout
                key={booking._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                  
                  {/* Turf Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center border border-gray-200">
                      {booking.turf?.images?.[0] ? (
                        <img 
                          src={getImageUrl(booking.turf.images[0])} 
                          alt={booking.turf.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <MapPin className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center text-gray-500">
                          <Hash className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs font-medium uppercase">{booking.bookingId || booking._id.slice(-8)}</span>
                        </div>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 truncate">{booking.turf?.name || 'Unknown Venue'}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                        {booking.turf?.location?.city || 'Unknown City'}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
                          {booking.sport}
                        </span>
                        {booking.courts?.map((court, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium border border-gray-200">
                            {court}
                          </span>
                        ))}
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                          booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                          booking.status === 'completed' ? 'bg-[#1abc60] text-white border-[#1abc60]' : 
                          booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 w-full lg:border-l border-gray-100 lg:px-6 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center border border-gray-200">
                        {booking.user?.profilePhoto ? (
                          <img 
                            src={getImageUrl(booking.user.profilePhoto)} 
                            alt={booking.user.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{booking.user?.name || 'Guest User'}</p>
                        <p className="text-xs text-gray-500 truncate">{booking.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-[52px]">
                      <span className="text-xs text-gray-600">{booking.user?.phone || 'No phone provided'}</span>
                    </div>
                  </div>

                  {/* Slot & Payment Info */}
                  <div className="flex-1 w-full lg:border-l border-gray-100 lg:px-6 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Clock4 className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{to12h(booking.startTime)} - {to12h(booking.endTime)}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between items-baseline">
                        <p className="text-xs font-medium text-gray-500">
                          {booking.paymentStatus === 'paid' ? 'Paid via ' + (booking.paymentMethod || 'online') : 'Payment Pending'}
                        </p>
                        <p className="text-base font-semibold text-gray-900">₹{booking.totalAmount || booking.price}</p>
                      </div>
                      {!!booking.slots?.length && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="bg-gray-50 text-gray-700 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-gray-200">
                            {booking.slots.length} slot{booking.slots.length !== 1 ? 's' : ''}
                          </span>
                          {booking.slots.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="bg-gray-50 text-gray-700 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-gray-200"
                            >
                              {formatRange(s)}
                            </span>
                          ))}
                          {booking.slots.length > 3 && (
                            <span className="text-[11px] font-semibold text-gray-500 px-2 py-1">
                              +{booking.slots.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 w-full lg:w-32 shrink-0">
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                        className="!flex-1 !w-full !bg-[#1abc60] !text-white !py-2 !px-3 !rounded-lg !text-sm !font-medium hover:!bg-[#17a554] !transition-colors !flex !items-center !justify-center !gap-1.5 !border-none !cursor-pointer !shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Confirm
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        className="!flex-1 !w-full !bg-white !text-red-600 !border !border-red-200 !py-2 !px-3 !rounded-lg !text-sm !font-medium hover:!bg-red-50 !transition-colors !flex !items-center !justify-center !gap-1.5 !cursor-pointer !shadow-sm"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button 
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                        className="!flex-1 !w-full !bg-[#1abc60] !text-white !py-2 !px-3 !rounded-lg !text-sm !font-medium hover:!bg-[#17a554] !transition-colors !flex !items-center !justify-center !gap-1.5 !border-none !cursor-pointer !shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Complete
                      </button>
                    )}
                    {booking.status === 'completed' && (
                      <div className="!flex-1 !w-full !py-2 !px-3 !rounded-lg !text-sm !font-medium !text-center !text-[#1abc60] !bg-green-50 !border !border-green-200 !capitalize">
                        Completed
                      </div>
                    )}
                    {booking.status === 'cancelled' && (
                      <div className="!flex-1 !w-full !py-2 !px-3 !rounded-lg !text-sm !font-medium !text-center !text-red-600 !bg-red-50 !border !border-red-200 !capitalize">
                        Cancelled
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{bookings.length}</span> of <span className="font-medium text-gray-900">{totalBookings}</span> results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="!p-2 !bg-white !border !border-gray-200 !rounded-lg disabled:!opacity-50 disabled:!cursor-not-allowed hover:!bg-gray-50 !transition-colors !cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-1 px-2">
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
                      className={`!min-w-[36px] !h-9 !px-3 !rounded-lg !text-sm !font-medium !transition-colors !cursor-pointer ${
                        currentPage === pageNum 
                          ? '!bg-[#1abc60] !text-white !border !border-[#1abc60]' 
                          : '!bg-white !text-gray-700 !border !border-gray-200 hover:!bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 || 
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="!p-2 !bg-white !border !border-gray-200 !rounded-lg disabled:!opacity-50 disabled:!cursor-not-allowed hover:!bg-gray-50 !transition-colors !cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* --- OFFLINE BOOKING MODAL --- */}
      <AnimatePresence>
        {showOfflineModal && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">New Offline Booking</h2>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Record a walk-in reservation</p>
                </div>
                <button onClick={() => setShowOfflineModal(false)} className="p-2 hover:bg-white rounded-2xl transition-colors shadow-sm"><X className="text-gray-400" /></button>
              </div>

              <form onSubmit={handleCreateOffline} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Turf Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Select Venue</label>
                    <select 
                      required
                      value={offlineData.turfId} 
                      onChange={(e) => setOfflineData({...offlineData, turfId: e.target.value, slots: [], courts: []})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-[#1abc60] transition-all"
                    >
                      <option value="">Select a Venue</option>
                      {availableTurfs.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>

                  {/* Sport Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Select Sport</label>
                    <input 
                      type="text"
                      placeholder="e.g. Football"
                      value={offlineData.sport}
                      onChange={(e) => setOfflineData({...offlineData, sport: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-[#1abc60] transition-all"
                    />
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Date</label>
                    <input 
                      type="date"
                      required
                      value={offlineData.date}
                      onChange={(e) => setOfflineData({...offlineData, date: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-[#1abc60] transition-all"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Calculated Total (₹)</label>
                    <div className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-black text-sm text-gray-900">
                      ₹{calculatedOfflineTotal}
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">
                      Day rate × selected slots × selected courts
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Customer Name</label>
                    <input 
                      type="text"
                      placeholder="Walk-in Customer"
                      value={offlineData.userName}
                      onChange={(e) => setOfflineData({...offlineData, userName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-[#1abc60] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Phone Number</label>
                    <input 
                      type="text"
                      placeholder="Optional"
                      value={offlineData.userPhone}
                      onChange={(e) => setOfflineData({...offlineData, userPhone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-[#1abc60] transition-all"
                    />
                  </div>
                </div>

                {offlineData.turfId && (
                  <>
                    {/* Court Selection */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Select Courts</label>
                      <div className="flex flex-wrap gap-3">
                        {getTurfCourts(offlineData.turfId).map((court: any) => {
                          const courtName = typeof court === 'string' ? court : (court.name || 'Court');
                          const isSelected = offlineData.courts.includes(courtName);
                          const isBookedForSelectedSlots = offlineData.slots.some((slot) =>
                            getBookedCourtsForRange(slot).has(courtName)
                          );
                          return (
                            <button
                              key={courtName}
                              type="button"
                              disabled={isBookedForSelectedSlots}
                              onClick={() => {
                                if (isSelected) setOfflineData({...offlineData, courts: offlineData.courts.filter(c => c !== courtName)});
                                else setOfflineData({...offlineData, courts: [...offlineData.courts, courtName]});
                              }}
                              className={`px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                                isBookedForSelectedSlots
                                  ? 'bg-gray-100 text-gray-300 border border-gray-100 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {courtName}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Slot Selection */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Available Time Slots</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {buildSlotsForTurf(offlineData.turfId, offlineData.date).map((slot: any) => {
                          const timeVal = slot.value;
                          const bookedCourts = getBookedCourtsForRange(timeVal);
                          const isFullyBooked = bookedCourts.size >= (getTurfCourts(offlineData.turfId).length || 1);
                          const clashesWithSelectedCourts =
                            offlineData.courts.length > 0 &&
                            offlineData.courts.some((c) => bookedCourts.has(c));
                          const isSelected = offlineData.slots.includes(timeVal);

                          return (
                            <button
                              key={timeVal}
                              type="button"
                              disabled={isFullyBooked || clashesWithSelectedCourts}
                              onClick={() => {
                                if (isSelected) setOfflineData({...offlineData, slots: offlineData.slots.filter(s => s !== timeVal)});
                                else setOfflineData({...offlineData, slots: [...offlineData.slots, timeVal]});
                              }}
                              className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                                (isFullyBooked || clashesWithSelectedCourts)
                                  ? 'bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed' 
                                  : isSelected 
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isCreatingOffline || !offlineData.turfId || !offlineData.slots.length || !offlineData.courts.length}
                    className="w-full bg-[#1abc60] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-[#16a085] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCreatingOffline ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Confirm Offline Booking</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}