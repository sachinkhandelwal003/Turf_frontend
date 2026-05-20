"use client";

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Calendar, MapPin, Search, Loader2, 
  CheckCircle2, XCircle, Clock4, Filter, User as UserIcon,
  ChevronLeft, ChevronRight, Hash, Plus, X, Star, Save, Trash2,
  Trophy, Settings, Phone, Info
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface Booking {
  _id: string;
  bookingId?: string;
  turf: {
    name: string;
    location: {
      city: string;
    };
    images: string[];
    pricePerHour?: number;
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
  paidAmount?: number;
  balanceAmount?: number;
  courts: string[];
  paymentStatus?: string;
  paymentMethod?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  tournament?: {
    _id: string;
    title: string;
    entryFee?: number;
  };
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
  upiId?: string;
}

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<div className="!min-h-[80vh] !flex !items-center !justify-center"><Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" /></div>}>
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
    price: 0,
    manualPrice: 0,
    paymentMethod: 'offline'
  });

  const [isManualPrice, setIsManualPrice] = useState(false);
  const [bookedSlotsForOffline, setBookedSlotsForOffline] = useState<any[]>([]);
  const [isCreatingOffline, setIsCreatingOffline] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [upiId, setUpiId] = useState('platform@upi');

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

  useEffect(() => {
    if (offlineData.turfId && !isManualPrice) {
      // Handled by calculatedOfflineTotal
    }
  }, [offlineData.turfId, offlineData.slots, offlineData.courts]);

  const handleCreateOffline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineData.turfId || !offlineData.slots.length || !offlineData.courts.length) {
      toast.error("Please fill all required fields");
      return;
    }

    if (offlineData.paymentMethod === 'online' && !showQRModal) {
      const selectedTurf = availableTurfs.find(t => t._id === offlineData.turfId);
      if (selectedTurf?.upiId) {
        setUpiId(selectedTurf.upiId);
      } else {
        setUpiId('platform@upi');
      }
      setShowQRModal(true);
      return;
    }

    setIsCreatingOffline(true);
    try {
      const finalPrice = isManualPrice ? offlineData.manualPrice : calculatedOfflineTotal;
      const res = await api.post("/bookings", {
        ...offlineData,
        isOffline: true,
        sport: offlineData.sport || 'General',
        price: finalPrice
      });

      if (res.data.success) {
        toast.success("Offline booking recorded!");
        setShowOfflineModal(false);
        setShowQRModal(false);
        fetchBookings();
        setOfflineData({
            turfId: '',
            sport: '',
            date: new Date().toISOString().split('T')[0],
            slots: [],
            courts: [],
            userName: '',
            userPhone: '',
            price: 0,
            manualPrice: 0,
            paymentMethod: 'offline'
          });
        setIsManualPrice(false);
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
      const endpoint = isSuperadmin ? '/turfs' : '/turfs/my/all';
      const res = await api.get(endpoint);
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

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This booking will be permanently deleted from the system!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/bookings/${id}`);
        if (res.data.success) {
          setBookings(bookings.filter(b => b._id !== id));
          setTotalBookings(prev => prev - 1);
          Swal.fire({
            title: "Deleted!",
            text: "Booking has been deleted.",
            icon: "success",
            confirmButtonColor: "#1abc60"
          });
        }
      } catch (error: any) {
        Swal.fire({
          title: "Error!",
          text: error.response?.data?.error || "Failed to delete booking",
          icon: "error",
          confirmButtonColor: "#1abc60"
        });
      }
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '/placeholder-turf.png';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
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
    const amount = parseSafeNumber(booking.totalAmount || booking.price || (parseSafeNumber(booking.paidAmount) + parseSafeNumber(booking.balanceAmount)));
    if (amount > 0) return amount;
    
    try {
      const turf = availableTurfs.find(t => t.name === booking.turf.name || t._id === (booking.turf as any)._id);
      const basePrice = Number(turf?.pricePerHour || 1000); 
      
      const numCourts = booking.courts?.length || 1;
      
      if (booking.slots && booking.slots.length > 0) {
        const totalMinutes = booking.slots.reduce((sum, slot) => {
          const [s, e] = slot.split(' - ');
          const [sh, sm] = (s || "00:00").split(':').map(Number);
          const [eh, em] = (e || "00:00").split(':').map(Number);
          return sum + ((eh * 60 + em) - (sh * 60 + sm));
        }, 0);
        const durationHours = Math.max(1, totalMinutes / 60);
        return durationHours * basePrice * numCourts;
      }
      
      const [sh, sm] = (booking.startTime || "00:00").split(':').map(Number);
      const [eh, em] = (booking.endTime || "00:00").split(':').map(Number);
      const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
      const durationHours = Math.max(1, totalMinutes / 60);
      return durationHours * basePrice * numCourts;
    } catch (e) {
      return 1000; 
    }
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
    
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const operatingDay = turf.operatingHours?.find(
      (d: any) => d.day.toLowerCase() === dayName.toLowerCase()
    );
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
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  const getBookedCourtsForRange = (timeVal: string) => {
    const [start, end] = timeVal.split(" - ");
    if (!start || !end) return new Set<string>();
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
    
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    const dayRate = turf.rates?.find((r: any) => r.day.toLowerCase() === dayName.toLowerCase())?.price;
    return parseSafeNumber(dayRate ?? turf.pricePerHour ?? 0);
  };

  const calculatedOfflineTotal = (() => {
    const turf = availableTurfs.find((t) => t._id === offlineData.turfId) as any;
    if (!turf || !offlineData.slots.length || !offlineData.courts.length) return 0;

    const basePrice = getEffectiveSlotPrice(offlineData.turfId, offlineData.date);
    const numCourts = offlineData.courts.length;

    return offlineData.slots.reduce((total, slotRange) => {
      const [startTime] = slotRange.split(" - ");
      const slotMinutes = getSlotMinutes(slotRange);
      const slotHours = slotMinutes / 60;
      
      let extra = 0;
      if (turf.priceHikes && Array.isArray(turf.priceHikes)) {
        const matchingHike = turf.priceHikes.find((hike: any) => {
          const hikeStart = parseTimeToMinutes(hike.startTime);
          const hikeEnd = parseTimeToMinutes(hike.endTime);
          const slotStart = parseTimeToMinutes(startTime);
          return slotStart >= hikeStart && slotStart < hikeEnd;
        });
        if (matchingHike) extra = Number(matchingHike.extraPrice || 0);
      }

      return total + (basePrice + extra) * slotHours * numCourts;
    }, 0);
  })();

  useEffect(() => {
    if (!offlineData.slots.length || !offlineData.courts.length) return;
    setOfflineData((prev) => ({
      ...prev,
      courts: prev.courts.filter(
        (courtName) => !prev.slots.some((slot) => getBookedCourtsForRange(slot).has(courtName))
      ),
    }));
  }, [offlineData.slots, bookedSlotsForOffline]);

  return (
    <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8 !space-y-6 !font-sans">
      
      {/* Header Section */}
      <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4 !bg-white !p-6 !rounded-2xl !border !border-gray-100 !shadow-sm">
        <div>
          <h1 className="!text-2xl !font-bold !text-gray-900 !tracking-tight !m-0">Manage Bookings</h1>
          <p className="!text-[13px] !font-medium !text-gray-500 !mt-1.5 !m-0">Monitor and moderate venue reservations</p>
        </div>
        <div className="!flex !items-center !gap-4">
          {!isSuperadmin && (
            <button 
              onClick={() => setShowOfflineModal(true)}
              className="!flex !items-center !gap-2 !bg-[#1abc60] !text-white !px-4 !py-2.5 !rounded-xl !font-semibold !text-[13px] !shadow-sm hover:!shadow-md hover:!bg-[#17a554] !transition-all !border-none !cursor-pointer"
            >
              <Plus className="!w-4 !h-4 !block !shrink-0" /> New Offline Booking
            </button>
          )}
          <div className="!bg-gray-50 !px-5 !py-2.5 !rounded-xl !border !border-gray-200 !flex !flex-col !items-center !min-w-[120px]">
            <p className="!text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !mb-0.5 !m-0">Total</p>
            <p className="!text-xl !font-bold !text-[#1abc60] !leading-none !m-0">{totalBookings}</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="!space-y-4">
        {/* Main Search & Primary Filters */}
        <div className="!grid !grid-cols-1 md:!grid-cols-12 !gap-4 !bg-white !p-5 !rounded-2xl !border !border-gray-100 !shadow-sm">
          
          {/* Search */}
          <div className="md:!col-span-5 !relative !group">
            <div className="!absolute !inset-y-0 !left-0 !pl-3.5 !flex !items-center !pointer-events-none">
              <Search className="!w-4 !h-4 !text-gray-400 group-focus-within:!text-[#1abc60] !transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search ID, User, Email, Venue..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!w-full !pl-10 !pr-4 !py-2.5 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !transition-all placeholder:!text-gray-400"
            />
          </div>

          {/* Turf Filter */}
          <div className="md:!col-span-3 !relative !group">
            <div className="!absolute !inset-y-0 !left-0 !pl-3.5 !flex !items-center !pointer-events-none">
              <MapPin className="!w-4 !h-4 !text-gray-400 group-focus-within:!text-[#1abc60] !transition-colors" />
            </div>
            <select 
              value={turfIdFilter}
              onChange={(e) => {
                setTurfIdFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !pl-10 !pr-8 !py-2.5 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !appearance-none !cursor-pointer !transition-all"
            >
              <option value="">All Venues</option>
              {availableTurfs.map((turf) => (
                <option key={turf._id} value={turf._id}>{turf.name}</option>
              ))}
            </select>
            <div className="!absolute !inset-y-0 !right-0 !pr-3 !flex !items-center !pointer-events-none">
              <ChevronLeft className="!w-4 !h-4 !text-gray-400 !-rotate-90" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:!col-span-2 !relative !group">
            <div className="!absolute !inset-y-0 !left-0 !pl-3.5 !flex !items-center !pointer-events-none">
              <Filter className="!w-4 !h-4 !text-gray-400 group-focus-within:!text-[#1abc60] !transition-colors" />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="!w-full !pl-10 !pr-8 !py-2.5 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !appearance-none !cursor-pointer !transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <div className="!absolute !inset-y-0 !right-0 !pr-3 !flex !items-center !pointer-events-none">
              <ChevronLeft className="!w-4 !h-4 !text-gray-400 !-rotate-90" />
            </div>
          </div>

          {/* Clear Button */}
          <div className="md:!col-span-2">
            <button 
              onClick={clearFilters}
              className="!w-full !flex !items-center !justify-center !gap-2 !bg-white !text-gray-600 !border !border-gray-200 !py-2.5 !px-4 !rounded-xl !text-[13px] !font-semibold hover:!bg-gray-50 hover:!text-gray-900 !transition-all !cursor-pointer"
            >
              <XCircle className="!w-4 !h-4 !block !shrink-0" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Date and Time Range Filters */}
        <div className="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-4 !bg-white !p-5 !rounded-2xl !border !border-gray-100 !shadow-sm">
          <div className="!space-y-2">
            <label className="!text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !ml-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="!w-full !px-3 !py-2.5 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !transition-all"
            />
          </div>
          <div className="!space-y-2">
            <label className="!text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !ml-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="!w-full !px-3 !py-2.5 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !transition-all"
            />
          </div>
          <div className="!space-y-2">
            <label className="!text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !ml-1">Start Time</label>
            <input 
              type="time" 
              value={startTime}
              onChange={(e) => { setStartTime(e.target.value); setCurrentPage(1); }}
              className="!w-full !px-3 !py-2.5 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !transition-all"
            />
          </div>
          <div className="!space-y-2">
            <label className="!text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !ml-1">End Time</label>
            <input 
              type="time" 
              value={endTime}
              onChange={(e) => { setEndTime(e.target.value); setCurrentPage(1); }}
              className="!w-full !px-3 !py-2.5 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !transition-all"
            />
          </div>
        </div>
      </div>

      {/* Bookings List Area */}
      <div className="!relative !min-h-[400px]">
        {loading && bookings.length > 0 && (
          <div className="!absolute !inset-0 !bg-white/50 !backdrop-blur-sm !z-10 !flex !items-center !justify-center !rounded-2xl">
            <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {bookings.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="!bg-white !py-16 !px-6 !rounded-2xl !border !border-gray-100 !text-center !shadow-sm"
            >
              <div className="!w-16 !h-16 !bg-gray-50 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4 !border !border-gray-200">
                <Calendar className="!w-8 !h-8 !text-gray-300" />
              </div>
              <h3 className="!text-lg !font-bold !text-gray-900 !m-0">No Bookings Found</h3>
              <p className="!text-gray-500 !text-[13px] !mt-1.5 !font-medium !m-0">Try adjusting your search or filters to find what you're looking for.</p>
            </motion.div>
          ) : (
            <div className="!space-y-4">
              {bookings.map((booking) => (
                <motion.div 
                  layout
                  key={booking._id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="!bg-white !rounded-2xl !border !border-gray-100 !overflow-hidden !shadow-sm hover:!shadow-md !transition-shadow"
                >
                  <div className="!p-6 !flex !flex-col lg:!flex-row !gap-6 !items-start lg:!items-center">
                    
                    {/* Turf Info */}
                    <div className="!flex !items-center !gap-4 !flex-1 !min-w-0 !w-full">
                      <div className="!w-20 !h-20 !rounded-xl !overflow-hidden !shrink-0 !bg-gray-50 !border !border-gray-100 !flex !items-center !justify-center">
                        {booking.turf?.images?.[0] ? (
                          <img src={getImageUrl(booking.turf.images[0])} alt={booking.turf.name} className="!w-full !h-full !object-cover" />
                        ) : (
                          <MapPin className="!w-6 !h-6 !text-gray-300" />
                        )}
                      </div>
                      <div className="!min-w-0">
                        <div className="!flex !items-center !gap-1.5 !mb-1 !text-gray-500">
                          <Hash className="!w-3.5 !h-3.5 !shrink-0" />
                          <span className="!text-[11px] !font-bold !uppercase !tracking-wider">{booking.bookingId || booking._id.slice(-8)}</span>
                        </div>
                        <h3 className="!text-[15px] !font-bold !text-gray-900 !truncate !m-0">{booking.turf?.name || 'Unknown Venue'}</h3>
                        <div className="!flex !items-center !text-[13px] !font-medium !text-gray-500 !mt-1">
                          <MapPin className="!w-3.5 !h-3.5 !mr-1.5 !text-gray-400 !shrink-0" />
                          <span className="!truncate">{booking.turf?.location?.city || 'Unknown City'}</span>
                        </div>
                        <div className="!mt-3 !flex !flex-wrap !gap-2">
                          <span className="!bg-gray-50 !text-gray-700 !px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider !border !border-gray-200">
                            {booking.sport}
                          </span>
                          {booking.courts?.map((court, idx) => (
                            <span key={idx} className="!bg-gray-50 !text-gray-700 !px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider !border !border-gray-200">
                              {court}
                            </span>
                          ))}
                          <span className={`!px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider !border ${
                            booking.status === 'confirmed' ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200' : 
                            booking.status === 'completed' ? '!bg-[#1abc60] !text-white !border-[#1abc60]' : 
                            booking.status === 'pending' ? '!bg-yellow-50 !text-yellow-700 !border-yellow-200' : 
                            booking.status === 'cancelled' ? '!bg-red-50 !text-red-700 !border-red-200' : 
                            '!bg-gray-50 !text-gray-700 !border-gray-200'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="!flex-1 !w-full lg:!border-l !border-gray-100 lg:!px-6 !space-y-2">
                      <div className="!flex !items-center !gap-3">
                        <div className="!w-11 !h-11 !rounded-full !bg-emerald-50 !flex !items-center !justify-center !border !border-emerald-100 !shrink-0 !overflow-hidden !text-[#1abc60]">
                          {booking.user?.profilePhoto ? (
                            <img src={getImageUrl(booking.user.profilePhoto)} alt={booking.user.name} className="!w-full !h-full !object-cover" />
                          ) : (
                            <UserIcon className="!w-5 !h-5" />
                          )}
                        </div>
                        <div className="!min-w-0">
                          <p className="!text-[14px] !font-bold !text-gray-900 !truncate !m-0">{booking.user?.name || 'Guest User'}</p>
                          <p className="!text-[12px] !font-medium !text-gray-500 !truncate !m-0">{booking.user?.email}</p>
                        </div>
                      </div>
                      <div className="!pl-[56px]">
                        <span className="!text-[11px] !font-semibold !text-gray-600 !bg-gray-50 !px-2.5 !py-1 !rounded-md !border !border-gray-200">
                          {booking.user?.phone || 'No phone'}
                        </span>
                      </div>
                    </div>

                    {/* Slot & Payment Info */}
                    <div className="!flex-1 !w-full lg:!border-l !border-gray-100 lg:!px-6 !space-y-3">
                      <div className="!space-y-2 !border-b !border-gray-100 !pb-3">
                        <div className="!flex !items-center !text-[13px] !font-semibold !text-gray-800">
                          <Calendar className="!w-4 !h-4 !mr-2.5 !text-gray-400" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="!flex !items-center !text-[13px] !font-semibold !text-gray-800">
                          <Clock4 className="!w-4 !h-4 !mr-2.5 !text-gray-400" />
                          <span>{to12h(booking.startTime)} - {to12h(booking.endTime)}</span>
                        </div>
                        {!!booking.slots?.length && (
                          <div className="!flex !flex-wrap !gap-1.5 !mt-2 !pl-6.5">
                            <span className="!bg-gray-50 !text-gray-600 !px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !border !border-gray-200">
                              {booking.slots.length} Slot{booking.slots.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="!flex !flex-col !items-end !gap-1">
                        <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-wider !m-0">
                          {booking.paymentStatus === 'paid' ? 'Paid via ' + (booking.paymentMethod || 'online') : 'Payment Pending'}
                        </p>
                        <p className="!text-lg !font-bold !text-gray-900 !m-0">₹{getBookingTotal(booking)}</p>
                        <div className="!flex !gap-4 !mt-1.5">
                          <div className="!flex !flex-col !items-end">
                            <span className="!text-[9px] !font-bold !text-blue-500 !uppercase !tracking-wider">Wallet</span>
                            <span className="!text-[13px] !font-bold !text-blue-700">₹{(getBookingTotal(booking) * 0.8).toLocaleString()}</span>
                          </div>
                          <div className="!flex !flex-col !items-end">
                            <span className="!text-[9px] !font-bold !text-orange-500 !uppercase !tracking-wider">Comm.</span>
                            <span className="!text-[13px] !font-bold !text-orange-700">₹{(getBookingTotal(booking) * 0.2).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="!flex !flex-row lg:!flex-col !gap-2 !w-full lg:!w-32 !shrink-0">
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                          className="!flex-1 !w-full !bg-[#1abc60] !text-white !py-2.5 !px-3 !rounded-xl !text-[13px] !font-semibold hover:!bg-[#17a554] !transition-all !flex !items-center !justify-center !gap-1.5 !border-none !cursor-pointer !shadow-sm"
                        >
                          <CheckCircle2 className="!w-4 !h-4 !block !shrink-0" /> Confirm
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button 
                          onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                          className="!flex-1 !w-full !bg-white !text-red-600 !border !border-red-200 !py-2.5 !px-3 !rounded-xl !text-[13px] !font-semibold hover:!bg-red-50 !transition-all !flex !items-center !justify-center !gap-1.5 !cursor-pointer !shadow-sm"
                        >
                          <XCircle className="!w-4 !h-4 !block !shrink-0" /> Cancel
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => handleStatusUpdate(booking._id, 'completed')}
                          className="!flex-1 !w-full !bg-blue-600 !text-white !py-2.5 !px-3 !rounded-xl !text-[13px] !font-semibold hover:!bg-blue-700 !transition-all !flex !items-center !justify-center !gap-1.5 !border-none !cursor-pointer !shadow-sm"
                        >
                          <CheckCircle2 className="!w-4 !h-4 !block !shrink-0" /> Complete
                        </button>
                      )}
                      {['cancelled', 'completed'].includes(booking.status) && (
                        <div className="!flex !gap-2 !w-full">
                          <div className="!flex-1 !py-2.5 !px-3 !rounded-xl !text-[11px] !font-bold !uppercase !tracking-wider !text-center !text-gray-500 !bg-gray-50 !border !border-gray-200">
                            {booking.status}
                          </div>
                          <button 
                            onClick={() => handleDelete(booking._id)}
                            className="!p-2.5 !bg-white !text-gray-400 hover:!text-red-600 !border !border-gray-200 hover:!border-red-200 !rounded-xl !transition-all !cursor-pointer !shadow-sm"
                            title="Delete Booking"
                          >
                            <Trash2 className="!w-4 !h-4 !block !shrink-0" />
                          </button>
                        </div>
                      )}
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
        <div className="!flex !flex-col sm:!flex-row !items-center !justify-between !gap-4 !pt-6 !border-t !border-gray-100">
          <p className="!text-[13px] !font-medium !text-gray-500 !m-0">
            Showing <span className="!font-bold !text-gray-900">{bookings.length}</span> of <span className="!font-bold !text-gray-900">{totalBookings}</span> results
          </p>
          <div className="!flex !items-center !gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="!p-2 !bg-white !border !border-gray-200 !text-gray-500 !rounded-xl disabled:!opacity-50 disabled:!cursor-not-allowed hover:!bg-gray-50 !transition-all !cursor-pointer !shadow-sm"
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
                      className={`!min-w-[36px] !h-9 !rounded-xl !text-[13px] !font-bold !transition-all !cursor-pointer !shadow-sm ${
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
                  return <span key={pageNum} className="!text-gray-400 !px-1.5 !font-bold">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="!p-2 !bg-white !border !border-gray-200 !text-gray-500 !rounded-xl disabled:!opacity-50 disabled:!cursor-not-allowed hover:!bg-gray-50 !transition-all !cursor-pointer !shadow-sm"
            >
              <ChevronRight className="!w-4 !h-4 !block !shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. UPGRADED OFFLINE BOOKING MODAL                              */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showOfflineModal && (
          <div className="!fixed !inset-0 !bg-gray-900/40 !z-[100] !flex !items-center !justify-center !p-4 !backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="!bg-[#f8fafc] !rounded-[24px] !w-full !max-w-4xl !max-h-[90vh] !shadow-2xl !flex !flex-col !overflow-hidden !border !border-gray-100"
            >
              {/* Modal Header */}
              <div className="!px-6 !py-5 !border-b !border-gray-200 !flex !justify-between !items-center !bg-white !shrink-0">
                <div className="!flex !items-center !gap-3.5">
                  <div className="!w-12 !h-12 !rounded-2xl !bg-emerald-50 !flex !items-center !justify-center !text-[#1abc60] !border !border-emerald-100">
                    <Plus className="!w-6 !h-6" />
                  </div>
                  <div>
                    <h2 className="!text-xl !font-bold !text-gray-900 !leading-tight !m-0">New Offline Booking</h2>
                    <p className="!text-[13px] !text-gray-500 !font-medium !mt-1 !m-0">Record a walk-in reservation quickly</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowOfflineModal(false)} 
                  className="!p-2 !bg-white !text-gray-400 hover:!text-gray-600 hover:!bg-gray-100 !border !border-gray-200 !rounded-xl !transition-all !cursor-pointer"
                >
                  <X className="!w-5 !h-5 !block !shrink-0" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleCreateOffline} className="!flex !flex-col !flex-1 !overflow-hidden">
                <div className="!p-6 md:!p-8 !space-y-6 !overflow-y-auto !custom-scrollbar !flex-1">
                  
                  {/* Card 1: Venue & Sport */}
                  <div className="!bg-white !p-6 !rounded-2xl !border !border-gray-100 !shadow-sm">
                    <h3 className="!text-[13px] !font-bold !text-gray-900 !mb-5 !flex !items-center !gap-2.5">
                      <span className="!w-6 !h-6 !rounded-full !bg-[#1abc60] !text-white !flex !items-center !justify-center !text-xs !font-bold">1</span> 
                      Venue Details
                    </h3>
                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider">Select Venue <span className="!text-red-500">*</span></label>
                        <select 
                          required
                          value={offlineData.turfId} 
                          onChange={(e) => setOfflineData({...offlineData, turfId: e.target.value, slots: [], courts: []})}
                          className="!w-full !px-4 !py-3 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !transition-all !appearance-none !cursor-pointer"
                        >
                          <option value="">Choose a Venue</option>
                          {availableTurfs.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                      </div>

                      <div className="!space-y-2">
                        <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider">Select Sport <span className="!text-red-500">*</span></label>
                        <select 
                          required
                          value={offlineData.sport}
                          onChange={(e) => setOfflineData({...offlineData, sport: e.target.value})}
                          className="!w-full !px-4 !py-3 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !transition-all !appearance-none !cursor-pointer"
                        >
                          <option value="">Choose a Sport</option>
                          {availableTurfs.find(t => t._id === offlineData.turfId)?.sports?.map((sport: string) => (
                            <option key={sport} value={sport}>{sport}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Date, Time & Courts (Only visible if Turf is selected) */}
                  {offlineData.turfId && (
                    <div className="!bg-white !p-6 !rounded-2xl !border !border-gray-100 !shadow-sm">
                       <h3 className="!text-[13px] !font-bold !text-gray-900 !mb-5 !flex !items-center !gap-2.5">
                        <span className="!w-6 !h-6 !rounded-full !bg-[#1abc60] !text-white !flex !items-center !justify-center !text-xs !font-bold">2</span> 
                        Schedule & Courts
                      </h3>
                      
                      <div className="!space-y-6">
                        {/* Date */}
                        <div className="!space-y-2 !max-w-xs">
                          <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider">Select Date <span className="!text-red-500">*</span></label>
                          <input 
                            type="date"
                            required
                            value={offlineData.date}
                            onChange={(e) => setOfflineData({...offlineData, date: e.target.value})}
                            className="!w-full !px-4 !py-3 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !transition-all"
                          />
                        </div>

                        {/* Courts */}
                        <div className="!space-y-2">
                          <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider">Select Courts <span className="!text-red-500">*</span></label>
                          <div className="!flex !flex-wrap !gap-3">
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
                                  className={`!px-5 !py-3 !rounded-xl !font-bold !text-[13px] !transition-all !border !flex !flex-col !items-center !gap-1 !min-w-[120px] !cursor-pointer ${
                                    isBookedForSelectedSlots
                                      ? '!bg-gray-50 !text-gray-400 !border-gray-200 !cursor-not-allowed'
                                      : isSelected
                                      ? '!bg-emerald-50 !text-emerald-700 !border-emerald-500 !shadow-sm !ring-1 !ring-emerald-500'
                                      : '!bg-white !text-gray-700 !border-gray-200 hover:!border-gray-400 hover:!bg-gray-50'
                                  }`}
                                >
                                  <span className="!uppercase !tracking-wider">{courtName}</span>
                                  {court.courtType && (
                                    <span className="!text-[10px] !opacity-70 !font-semibold">({court.courtType})</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Time Slots */}
                        <div className="!space-y-2">
                          <div className="!flex !justify-between !items-center">
                            <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider">Time Slots <span className="!text-red-500">*</span></label>
                            <span className="!text-[10px] !text-emerald-700 !font-bold !uppercase !tracking-wider !bg-emerald-50 !px-2.5 !py-1 !rounded-md">Select multiple for 2+ hours</span>
                          </div>
                          <div className="!grid !grid-cols-2 sm:!grid-cols-3 md:!grid-cols-4 lg:!grid-cols-5 !gap-3 !max-h-56 !overflow-y-auto !p-4 !bg-gray-50/80 !rounded-2xl !border !border-gray-200 !custom-scrollbar">
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
                                  className={`!px-3 !py-2.5 !rounded-xl !border !font-bold !text-[13px] !transition-all !cursor-pointer ${
                                    (isFullyBooked || clashesWithSelectedCourts)
                                      ? '!bg-gray-100 !border-gray-200 !text-gray-400 !cursor-not-allowed' 
                                      : isSelected 
                                        ? '!bg-[#1abc60] !border-[#1abc60] !text-white !shadow-sm' 
                                        : '!bg-white !border-gray-200 !text-gray-700 hover:!border-[#1abc60] hover:!text-[#1abc60]'
                                  }`}
                                >
                                  {slot.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card 3: Customer & Payment */}
                  <div className="!bg-white !p-6 !rounded-2xl !border !border-gray-100 !shadow-sm">
                    <h3 className="!text-[13px] !font-bold !text-gray-900 !mb-5 !flex !items-center !gap-2.5">
                      <span className="!w-6 !h-6 !rounded-full !bg-[#1abc60] !text-white !flex !items-center !justify-center !text-xs !font-bold">3</span> 
                      Customer & Payment
                    </h3>
                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
                      
                      {/* Customer Details */}
                      <div className="!space-y-4">
                        <div className="!space-y-2">
                          <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider">Customer Name</label>
                          <div className="!relative">
                            <UserIcon className="!absolute !left-3.5 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-gray-400 !z-10" />
                            <input 
                              type="text"
                              placeholder="Walk-in Customer"
                              value={offlineData.userName}
                              onChange={(e) => setOfflineData({...offlineData, userName: e.target.value})}
                              className="!w-full !pl-10 !pr-4 !py-3 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !transition-all placeholder:!text-gray-400"
                            />
                          </div>
                        </div>
                        <div className="!space-y-2">
                          <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider">Phone Number</label>
                          <div className="!relative">
                            <Phone className="!absolute !left-3.5 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-gray-400 !z-10" />
                            <input 
                              type="text"
                              placeholder="Optional"
                              value={offlineData.userPhone}
                              onChange={(e) => setOfflineData({...offlineData, userPhone: e.target.value})}
                              className="!w-full !pl-10 !pr-4 !py-3 !bg-gray-50 hover:!bg-white !border !border-gray-200 focus:!bg-white focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-medium !text-gray-900 !rounded-xl !transition-all placeholder:!text-gray-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="!space-y-4 !bg-gray-50/80 !p-5 !rounded-2xl !border !border-gray-100">
                        <div className="!space-y-2">
                          <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider">Payment Mode <span className="!text-red-500">*</span></label>
                          <select 
                            required
                            value={offlineData.paymentMethod} 
                            onChange={(e) => setOfflineData({...offlineData, paymentMethod: e.target.value})}
                            className="!w-full !px-4 !py-3 !bg-white !border !border-gray-200 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-[13px] !font-bold !text-gray-900 !rounded-xl !transition-all !appearance-none !cursor-pointer"
                          >
                            <option value="offline">Offline (Cash/Manual)</option>
                            <option value="online">Online (UPI/QR Scan)</option>
                          </select>
                        </div>
                        <div className="!space-y-2">
                          <div className="!flex !justify-between !items-center">
                            <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider">Final Amount <span className="!text-red-500">*</span></label>
                            <button 
                              type="button"
                              onClick={() => setIsManualPrice(!isManualPrice)}
                              className="!text-[10px] !font-bold !text-[#1abc60] !bg-emerald-50 !px-2.5 !py-1 !rounded-md !uppercase !tracking-wider hover:!bg-emerald-100 !transition-colors !border-none !cursor-pointer"
                            >
                              {isManualPrice ? 'Use Calculated' : 'Edit Manually'}
                            </button>
                          </div>
                          <div className="!relative">
                            <span className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !text-gray-600 !font-bold !text-lg">₹</span>
                            <input 
                              type="number"
                              value={isManualPrice ? offlineData.manualPrice : (calculatedOfflineTotal || getEffectiveSlotPrice(offlineData.turfId, offlineData.date))}
                              onChange={(e) => {
                                setIsManualPrice(true);
                                setOfflineData({...offlineData, manualPrice: Number(e.target.value)});
                              }}
                              className="!w-full !pl-9 !pr-4 !py-3 !bg-white !border !border-gray-200 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !text-lg !text-gray-900 !rounded-xl !transition-all !font-bold"
                              placeholder="0"
                            />
                            {!isManualPrice && offlineData.turfId && !offlineData.slots.length && (
                              <span className="!absolute !right-4 !top-1/2 !-translate-y-1/2 !text-[9px] !font-bold !text-[#1abc60] !bg-emerald-50 !px-2 !py-1 !rounded-md !uppercase !tracking-widest !animate-pulse !border !border-emerald-100">
                                Base Price
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
                
                {/* Modal Footer */}
                <div className="!px-6 md:!px-8 !py-5 !border-t !border-gray-200 !bg-white !flex !justify-end !gap-3 !shrink-0 !shadow-[0_-4px_15px_rgba(0,0,0,0.02)]">
                  <button 
                    type="button" 
                    onClick={() => setShowOfflineModal(false)}
                    className="!px-6 !py-3 !bg-white !border !border-gray-200 !text-gray-600 !rounded-xl !text-[13px] !font-bold hover:!bg-gray-50 !transition-colors !cursor-pointer !shadow-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreatingOffline || !offlineData.turfId || !offlineData.slots.length || !offlineData.courts.length}
                    className="!px-8 !py-3 !bg-[#1abc60] !text-white !rounded-xl !text-[13px] !font-bold !flex !items-center !justify-center !gap-2 hover:!bg-[#17a554] !transition-colors !shadow-md disabled:!opacity-50 disabled:!cursor-not-allowed !cursor-pointer !border-none"
                  >
                    {isCreatingOffline ? <Loader2 className="!w-4 !h-4 !animate-spin !block !shrink-0" /> : <Save className="!w-4 !h-4 !block !shrink-0" />}
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 2. UPGRADED PAYMENT QR MODAL                                  */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showQRModal && (
          <div className="!fixed !inset-0 !bg-gray-900/40 !z-[110] !flex !items-center !justify-center !p-4 !backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="!bg-white !rounded-[24px] !w-full !max-w-md !shadow-2xl !overflow-hidden !border !border-gray-100"
            >
              <div className="!p-8 !text-center !space-y-6">
                
                {/* Header */}
                <div className="!flex !justify-between !items-start">
                  <div className="!text-left">
                    <h3 className="!text-xl !font-bold !text-gray-900 !m-0 !leading-none">Scan to Pay</h3>
                    <p className="!text-[13px] !font-medium !text-gray-500 !mt-1.5 !m-0">Customer needs to scan this code</p>
                  </div>
                  <button 
                    onClick={() => setShowQRModal(false)} 
                    className="!p-2 !bg-white !border !border-gray-200 !text-gray-400 hover:!text-gray-600 hover:!bg-gray-50 !rounded-xl !transition-all !cursor-pointer !-mt-2 !-mr-2"
                  >
                    <X className="!w-5 !h-5 !block" />
                  </button>
                </div>

                {/* Amount Display */}
                <div className="!bg-emerald-50/50 !border !border-emerald-100 !rounded-2xl !p-5">
                  <p className="!text-[11px] !font-bold !text-[#1abc60] !uppercase !tracking-wider !mb-1 !m-0">Total Amount Payable</p>
                  <p className="!text-4xl !font-bold !text-gray-900 !tracking-tight !m-0">₹{isManualPrice ? offlineData.manualPrice : calculatedOfflineTotal}</p>
                </div>

                {/* QR Code */}
                <div className="!bg-white !p-4 !rounded-2xl !border-2 !border-dashed !border-gray-200 !inline-block !mx-auto !shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=VenueAdmin&am=${isManualPrice ? offlineData.manualPrice : calculatedOfflineTotal}&cu=INR`)}`}
                    alt="Payment QR Code"
                    className="!w-48 !h-48 !mx-auto !rounded-lg"
                  />
                </div>

                <div className="!space-y-5">
                  {/* UPI Input */}
                  <div className="!space-y-2">
                    <label className="!block !text-[11px] !font-bold !text-gray-500 !uppercase !tracking-wider !text-left !ml-1">Receiving UPI ID</label>
                    <div className="!flex !gap-2">
                      <input 
                        type="text" 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. name@upi"
                        className="!flex-1 !px-4 !py-3 !bg-gray-50 hover:!bg-white !border !border-gray-200 !rounded-xl !text-[13px] !font-medium !text-gray-900 focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !outline-none !transition-all"
                      />
                      {availableTurfs.find(t => t._id === offlineData.turfId)?.upiId === upiId && (
                        <div className="!flex !items-center !gap-1.5 !px-3 !bg-emerald-50 !text-[#1abc60] !rounded-xl !border !border-emerald-100 !shrink-0" title="Venue's verified UPI ID">
                          <CheckCircle2 className="!w-4 !h-4" />
                          <span className="!text-[11px] !font-bold !uppercase !tracking-wide">Saved</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="!bg-blue-50/80 !border !border-blue-100 !p-4 !rounded-xl !flex !items-start !gap-3">
                    <Info className="!w-5 !h-5 !text-blue-500 !shrink-0" />
                    <p className="!text-[12px] !text-blue-800 !leading-relaxed !text-left !font-medium !m-0">
                      Show this QR to the customer. Once they pay, click "Payment Verified" to confirm the booking.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="!flex !gap-3 !pt-2">
                    <button 
                      onClick={() => setShowQRModal(false)}
                      className="!flex-1 !py-3.5 !px-4 !bg-white !border !border-gray-200 !text-gray-600 !rounded-xl !text-[13px] !font-bold hover:!bg-gray-50 !transition-all !cursor-pointer !shadow-sm"
                    >
                      Go Back
                    </button>
                    <button 
                      onClick={handleCreateOffline}
                      disabled={isCreatingOffline}
                      className="!flex-[1.5] !py-3.5 !px-4 !bg-[#1abc60] !text-white !rounded-xl !text-[13px] !font-bold hover:!bg-[#17a554] !transition-all !cursor-pointer !shadow-md disabled:!opacity-50 !flex !items-center !justify-center !gap-2 !border-none"
                    >
                      {isCreatingOffline ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <CheckCircle2 className="!w-4 !h-4" />}
                      Payment Verified
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}