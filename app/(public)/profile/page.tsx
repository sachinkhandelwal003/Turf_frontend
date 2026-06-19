"use client";

import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Mail, Phone, Loader2, LogOut, 
  Calendar, MapPin, Clock, Camera, Settings, History, 
  CreditCard, ChevronRight, Activity, Bell, Award, CheckCircle2,
  X, ExternalLink, Ticket, Star, Send, LayoutList, Trophy, Trash2, Lock
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  _id: string;
  type?: 'ground' | 'tournament';
  turf?: {
    _id: string;
    name: string;
    location: {
      city: string;
      address: string;
    };
    images: string[];
    pricePerHour?: number;
  };
  tournament?: {
    _id: string;
    title: string;
    image?: string;
    entryFee?: number;
    location?: string;
  };
  sport: string;
  date: string;
  displayDate?: string;
  startTime: string;
  endTime: string;
  price: number;
  totalAmount?: number;
  paidAmount?: number;
  balanceAmount?: number;
  status: string;
  paymentStatus: string;
  bookingId: string;
  courts?: string[];
  slots?: string[];
  isMultiple?: boolean;
  createdAt: string;
  updatedAt: string;
  hasReviewed?: boolean;
  tournamentId?: string;
  teamName?: string;
}

interface ActivityItem {
  icon: LucideIcon;
  title: string;
  desc: string;
  time: string;
  color: string;
  bg: string;
  timestamp: Date;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
      msg?: string;
    };
  };
}

const getApiError = (error: unknown) => error as ApiError;

// --- Helper Functions Moved Outside Component to Prevent Reference Errors ---

const isTournamentBooking = (b: Booking) => {
  return b.type === 'tournament' || !!b.tournament || !!b.tournamentId || !!b.teamName;
};

const isBookingCompleted = (booking: Booking) => {
  if (booking.status === 'completed' || booking.status === 'finished') return true;
  if (booking.status === 'cancelled' || booking.status === 'rejected') return false;
  
  try {
    // For tournament registrations, check tournament end date if available
    if (isTournamentBooking(booking)) {
      if ((booking as any).tournament?.status === 'completed' || (booking as any).tournament?.status === 'finished') return true;
      
      const endDate = (booking as any).tournament?.endDate || (booking as any).endDate;
      if (endDate) {
        return new Date(endDate) <= new Date();
      }
      return false;
    }

    // Ground booking completion check
    const [year, month, day] = booking.date.includes('-') 
      ? booking.date.split('-').map(Number)
      : booking.date.split('/').map(Number);
    
    // Handle different date formats (YYYY-MM-DD vs DD/MM/YYYY or MM/DD/YYYY)
    let dateObj;
    if (booking.date.includes('-')) {
      dateObj = new Date(year, month - 1, day);
    } else {
      // Fallback for toLocaleDateString formats
      dateObj = new Date(booking.date);
    }

    const endTime = booking.endTime || '23:59';
    const [hours, minutes] = endTime.split(':').map(Number);
    dateObj.setHours(hours || 23, minutes || 59, 0);

    return !Number.isNaN(dateObj.getTime()) && dateObj <= new Date();
  } catch (e) {
    return false;
  }
};

const getDisplayStatus = (booking: Booking) => {
  if (booking.status === 'cancelled' || booking.status === 'rejected') return booking.status;
  if (isBookingCompleted(booking)) return 'completed';
  if (booking.status === 'confirmed') return 'upcoming';
  if (booking.status === 'pending') return 'upcoming';
  return booking.status;
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
  const directAmount = parseSafeNumber(booking.totalAmount || booking.price);
  if (directAmount > 0) return directAmount;

  // Fallback for older data or partial objects
  if (parseSafeNumber(booking.paidAmount) > 0 && !booking.balanceAmount) {
    return parseSafeNumber(booking.paidAmount);
  }

  if (isTournamentBooking(booking)) {
    const tournFee = parseSafeNumber((booking as any).tournament?.entryFee);
    if (tournFee > 0) return tournFee;
  }

  try {
    const basePrice = parseSafeNumber(booking.turf?.pricePerHour);
    const effectivePrice = basePrice > 0 ? basePrice : 500; 
    
    const numCourts = booking.courts?.length || 1;

    if (booking.isMultiple && booking.slots) {
      const totalHours = booking.slots.reduce((sum, slot) => {
        const [s, e] = slot.split(' - ');
        return sum + getDurationInHours(s, e);
      }, 0);
      return totalHours * effectivePrice * numCourts;
    }

    const duration = getDurationInHours(booking.startTime, booking.endTime);
    return Math.max(1, duration) * effectivePrice * numCourts;
  } catch (e) {
    return 500; 
  }
};

const getImageUrl = (path: string | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${path}`;
};

// --- Main Component ---

export default function ProfilePage() {
  const { user, isLoading, logout, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'settings' | 'activity'>('bookings');
  
  // Filters
  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ground' | 'tournament'>('all');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewModal, setReviewModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showCoinPopup, setShowCoinPopup] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Cancel Booking States
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [refundPreview, setRefundPreview] = useState<any>(null);
  const [cancelModalStep, setCancelModalStep] = useState<'confirm' | 'form'>('confirm');
  // Cancel Form Inputs
  const [cancelFormData, setCancelFormData] = useState({
    name: '',
    phone: '',
    email: '',
    upiId: ''
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Refs for file inputs and scrolling
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: 'bookings' | 'settings' | 'activity') => {
    setActiveTab(tab);
    if (window.innerWidth < 1024 && mainContentRef.current) {
      setTimeout(() => {
        mainContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Profile Update States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Password Update States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user && !hasInitialized) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setHasInitialized(true);
    }

    // Sync tab and type filter from URL search params
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const type = params.get('type');
    
    if (tab === 'bookings') {
      setActiveTab('bookings');
      if (type === 'tournament') {
        setTypeFilter('tournament');
      } else if (type === 'ground') {
        setTypeFilter('ground');
      }
    } else if (tab === 'activity') {
      setActiveTab('activity');
    } else if (tab === 'settings') {
      setActiveTab('settings');
    }
  }, [isLoading, isAuthenticated, router, user, hasInitialized]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setIsUpdatingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      if (res.data.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.response?.data?.msg || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profilePhoto' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type, file);

    const loadingToast = toast.loading(`Uploading ${type === 'profilePhoto' ? 'profile' : 'cover'} photo...`);
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.dismiss(loadingToast);
        toast.success(`${type === 'profilePhoto' ? 'Profile' : 'Cover'} photo updated!`);
        await refreshUser();
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.dismiss(loadingToast);
      toast.error(apiError.response?.data?.msg || 'Upload failed');
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('All password fields are required');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setIsUpdatingPassword(true);
    try {
      const res = await api.put('/auth/update-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      if (res.data.success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.response?.data?.msg || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const params: Record<string, string> = {};
      if (bookingFilter !== 'all') {
        params.filter = bookingFilter;
      }
      
      let groundBookings: Booking[] = [];
      let tournamentRegistrations: Booking[] = [];

      // 1. Fetch Ground Bookings
      try {
        const res = await api.get('/bookings/my', { params });
        const data = res.data?.bookings || res.data?.data || res.data || [];
        if (Array.isArray(data)) {
          groundBookings = data.map((b: any) => {
            // Check if this "ground booking" is actually a tournament registration
            const isTourn = !!(b.tournament || b.tournamentId || b.teamName || b.type === 'tournament');
            return { 
              ...b, 
              type: isTourn ? 'tournament' : (b.type || 'ground')
            };
          });
        }
      } catch (err) {
        console.error("Ground bookings fetch error:", err);
      }

      // 2. Fetch Tournament Registrations (Try multiple possible endpoints)
      const tournamentEndpoints = [
        '/tournaments/registrations/my',
        '/registrations/my',
        '/tournaments/my-registrations',
        '/my-registrations',
        '/auth/my-registrations',
        '/bookings/my?type=tournament'
      ];

      for (const endpoint of tournamentEndpoints) {
        try {
          const res = await api.get(endpoint);
          let rawRegs = res.data?.registrations || res.data?.data || res.data;
          
          if (rawRegs && !Array.isArray(rawRegs) && typeof rawRegs === 'object' && rawRegs !== null) {
            rawRegs = rawRegs.registrations || rawRegs.data || [];
          }

          if (Array.isArray(rawRegs) && rawRegs.length > 0) {
            tournamentRegistrations = rawRegs.map((reg: any) => {
              const tInfo = reg.tournamentId || reg.tournament || reg.tournamentDetails || {};
              const tId = tInfo._id || (typeof tInfo === 'string' ? tInfo : reg.tournamentId);
              const tTitle = reg.tournamentTitle || tInfo.title || reg.title || "Tournament Event";
              const tImage = reg.tournamentImage || tInfo.image || reg.image || "";
              
              const tLocation = reg.location || 
                                 (tInfo.location && typeof tInfo.location === 'object' && tInfo.location !== null ? tInfo.location.city : tInfo.location) || 
                                 tInfo.venue || 
                                 'Multiple Locations';
              
              return {
                ...reg,
                _id: reg._id || reg.bookingId || `tourn-${Math.random()}`,
                type: 'tournament' as const,
                tournament: {
                  ...tInfo,
                  _id: tId,
                  title: tTitle,
                  image: tImage,
                  entryFee: reg.entryFee || tInfo.entryFee || reg.price || 0,
                  location: tLocation
                },
                sport: reg.sport || tInfo.sport || 'Sports',
                date: reg.registeredAt || reg.date || reg.createdAt || new Date().toISOString(),
                displayDate: reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : 
                             reg.date ? (reg.date.includes('T') ? new Date(reg.date).toLocaleDateString() : reg.date) : 'N/A',
                price: reg.entryFee || tInfo.entryFee || reg.price || 0,
                paidAmount: reg.paidAmount || reg.entryFee || tInfo.entryFee || reg.price || 0,
                status: reg.status || 'confirmed',
                paymentStatus: reg.paymentStatus || 'paid',
                bookingId: reg.bookingId || reg._id || 'N/A',
                location: tLocation
              };
            });
            break; // Stop if we successfully got registrations
          }
        } catch (err) {
          // Only log 404 for the first one, keep trying others quietly
          if (endpoint === tournamentEndpoints[0]) console.warn("Primary tournament endpoint failed, trying fallbacks...");
        }
      }

      // 3. Combine and Deduplicate
      const combined = [...groundBookings, ...tournamentRegistrations];
      const uniqueBookings = Array.from(
        combined.reduce((map, booking) => {
          // Deduplicate by ID, but prefer the one with type 'tournament' if it's a registration
          const existing = map.get(booking._id);
          if (!existing || (booking.type === 'tournament' && existing.type !== 'tournament')) {
            map.set(booking._id, booking);
          }
          return map;
        }, new Map<string, Booking>()).values()
      );

      setBookings(uniqueBookings);
    } catch (error) {
      console.error("Profile bookings main error:", error);
      toast.error('Failed to load history');
    } finally {
      setLoadingBookings(false);
    }
  }, [bookingFilter]);

  const handleDeleteItem = async (booking: Booking | null) => {
    if (!booking) return;
    const isTourn = isTournamentBooking(booking);
    const itemType = isTourn ? 'registration' : 'booking';
    
    if (!window.confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(booking._id);
    try {
      let res;
      if (isTourn) {
        // Tournament registration delete
        res = await api.delete(`/tournaments/${booking.tournament?._id}/registrations/${booking._id}`);
      } else {
        // Ground booking delete
        res = await api.delete(`/bookings/${booking._id}`);
      }

      if (res.data.success) {
        toast.success(`${isTourn ? 'Registration' : 'Booking'} deleted successfully`);
        setBookings(prev => prev.filter(b => b._id !== booking._id));
      }
    } catch (error: unknown) {
      console.error('Delete error:', error);
      const apiError = getApiError(error);
      toast.error(apiError.response?.data?.msg || `Failed to delete ${itemType}`);
    } finally {
      setIsDeleting(null);
    }
  };

  // Get Refund Preview
  const getRefundPreview = async (bookingId: string) => {
    try {
      const res = await api.get(`/bookings/${bookingId}/refund-preview`);
      if (res.data.success) {
        setRefundPreview(res.data.data);
      }
    } catch (error: unknown) {
      console.error('Refund preview error:', error);
    }
  };

  // Open Cancel Modal
  const openCancelModal = async (booking: Booking) => {
    if (booking.status === 'cancelled') {
      toast.error('Booking is already cancelled');
      return;
    }
    setBookingToCancel(booking);
    setCancelModalStep('confirm');
    // Reset form with user's current info
    setCancelFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      upiId: ''
    });
    setShowCancelModal(true);
    await getRefundPreview(booking._id);
  };

  // Handle Cancel Booking
  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    if (bookingToCancel.status === 'cancelled') {
      toast.error('Booking is already cancelled');
      setShowCancelModal(false);
      setBookingToCancel(null);
      return;
    }

    // If we're on the confirm step, show the form
    if (cancelModalStep === 'confirm') {
      setCancelModalStep('form');
      return;
    }

    // If we're on the form step, submit the data
    setCancelLoading(true);
    try {
      const res = await api.post(`/bookings/${bookingToCancel._id}/cancel`, {
        upiDetails: {
          upiId: cancelFormData.upiId,
          upiName: cancelFormData.name,
          upiNote: ''
        },
        userInfo: {
          name: cancelFormData.name,
          phone: cancelFormData.phone,
          email: cancelFormData.email
        }
      });
      if (res.data.success) {
        toast.success('Booking cancelled successfully');
        setBookings(prev => prev.map(b => b._id === bookingToCancel._id ? { ...b, status: 'cancelled' } : b));
        setShowCancelModal(false);
        setBookingToCancel(null);
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.response?.data?.msg || apiError.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, fetchBookings]);

  const handleOpenReviewModal = (booking: Booking) => {
    setReviewModal({ open: true, booking });
    setReviewRating(0);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!reviewModal.booking || reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        bookingId: reviewModal.booking._id,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.data.success) {
        toast.success('Review submitted successfully!');
        setReviewModal({ open: false, booking: null });
        setSelectedBooking(null);

        const reviewedCount = bookings.filter(b => b.hasReviewed).length;
        const isFirstReview = reviewedCount === 0;
        const coinsEarned = isFirstReview ? 100 : 50;

        setBookings(bookings.map(b =>
          b._id === reviewModal.booking?._id ? { ...b, hasReviewed: true } : b
        ));

        if (coinsEarned > 0) {
          setRewardAmount(coinsEarned);
          setShowCoinPopup(true);
          await refreshUser();
        }
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Apply frontend filters for booking type and status (for tournaments)
  const filteredBookings = bookings.filter(b => {
    // 1. Filter by Type (Ground vs Tournament)
    if (typeFilter === 'ground' && isTournamentBooking(b)) return false;
    if (typeFilter === 'tournament' && !isTournamentBooking(b)) return false;

    // 2. Filter by Status (Mainly for tournaments since grounds are filtered by API)
    if (bookingFilter !== 'all') {
      const displayStatus = getDisplayStatus(b);
      if (displayStatus !== bookingFilter) return false;
    }
    
    return true;
  });

  const recentActivities = useCallback((): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    bookings.forEach(b => {
      const isTourn = isTournamentBooking(b);
      const name = isTourn ? (b.tournament?.title || "Tournament") : (b.turf?.name || "Venue");

      activities.push({
        icon: isTourn ? Trophy : Ticket,
        title: isTourn ? "Tournament Registered" : "Booking Initiated",
        desc: `You booked ${name} for ${b.sport}`,
        time: new Date(b.createdAt).toLocaleDateString(),
        color: "text-blue-600",
        bg: "bg-blue-50",
        timestamp: new Date(b.createdAt)
      });

      if (b.paymentStatus === 'paid') {
        activities.push({
          icon: CreditCard,
          title: "Payment Successful",
          desc: `Paid ₹${parseSafeNumber(b.paidAmount).toLocaleString()} for ${isTourn ? 'registration' : 'booking'} #${b.bookingId?.slice(-6)}`,
          time: new Date(b.updatedAt).toLocaleDateString(),
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          timestamp: new Date(b.updatedAt)
        });
      }

      if (b.status === 'confirmed' || b.status === 'completed') {
        activities.push({
          icon: isTourn ? CheckCircle2 : Bell,
          title: isTourn ? "Registration Confirmed" : "Booking Confirmed",
          desc: isTourn ? `Registered for ${name}` : `Your slot at ${b.startTime} on ${b.date} is confirmed`,
          time: new Date(b.updatedAt).toLocaleDateString(),
          color: "text-purple-600",
          bg: "bg-purple-50",
          timestamp: new Date(b.updatedAt)
        });
      }
    });

    if (user?.createdAt) {
      activities.push({
        icon: Award,
        title: "Joined GameOn",
        desc: "Welcome to the elite community of sports enthusiasts!",
        time: new Date(user.createdAt).toLocaleDateString(),
        color: "text-amber-600",
        bg: "bg-amber-50",
        timestamp: new Date(user.createdAt)
      });
    }

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }, [bookings, user?.createdAt]);

  if (!mounted || isLoading) {
    return (
      <div className="!min-h-screen !flex !items-center !justify-center !bg-gray-50">
        <div className="!flex !flex-col !items-center !gap-4">
          <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" />
          <p className="!text-sm !font-semibold !text-gray-500 !animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activitiesList = recentActivities();

  return (
    <div className="!min-h-screen !bg-gray-50 !pb-20 !pt-24 font-sans text-gray-900">
      <div className="!max-w-6xl !mx-auto !px-4 sm:!px-6 lg:!px-8">
        
        {/* Hidden File Inputs */}
        <input type="file" ref={profileInputRef} className="hidden" onChange={(e) => handlePhotoUpload(e, 'profilePhoto')} accept="image/*" />
        <input type="file" ref={coverInputRef} className="hidden" onChange={(e) => handlePhotoUpload(e, 'coverPhoto')} accept="image/*" />

        {/* Profile Header Card - CLEAN UI */}
        <div className="!bg-white !rounded-2xl !border !border-gray-200 !shadow-sm !overflow-hidden !relative !mb-8">
          {/* Cover Photo */}
          <div className="!h-48 sm:!h-56 !bg-gradient-to-r !from-[#1abc60] !to-[#16a085] !relative">
            {user.coverPhoto && (
              <img src={getImageUrl(user.coverPhoto)} className="!w-full !h-full !object-cover !opacity-80" alt="Cover" />
            )}
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="!absolute !top-4 !right-4 !bg-black/40 hover:!bg-black/60 !backdrop-blur-sm !text-white !px-4 !py-2 !rounded-lg !flex !items-center !gap-2 !transition-all !text-xs !font-semibold !border !border-white/10 !cursor-pointer"
            >
              <Camera className="!w-4 !h-4" /> Edit Cover
            </button>
          </div>

          <div className="!px-6 sm:!px-10 !pb-8">
            <div className="!flex !flex-col sm:!flex-row !items-center sm:!items-end !gap-6 !-mt-16 sm:!-mt-20 !relative !z-10">
              
              {/* Profile Avatar */}
              <div className="!relative !group">
                <div className="!w-32 !h-32 sm:!w-40 sm:!h-40 !rounded-full !bg-white !p-1.5 !shadow-md">
                  <div className="!w-full !h-full !rounded-full !bg-gray-100 !flex !items-center !justify-center !overflow-hidden">
                    {user.profilePhoto ? (
                      <img src={getImageUrl(user.profilePhoto)} className="!w-full !h-full !object-cover" alt="Profile" />
                    ) : (
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                        alt={user.name}
                        className="!w-full !h-full !object-cover"
                      />
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => profileInputRef.current?.click()}
                  className="!absolute !bottom-2 !right-2 !bg-[#1abc60] !text-white !p-2.5 !rounded-full !shadow-lg hover:!scale-105 !transition-transform !border-2 !border-white !cursor-pointer"
                >
                  <Camera className="!w-4 !h-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="!flex-1 !text-center sm:!text-left !pb-2">
                <div className="!flex !flex-col sm:!flex-row sm:!items-center !gap-3 !mb-2">
                  <h1 className="!text-3xl !font-bold !text-gray-900 !tracking-tight !m-0">{user.name}</h1>
                  <span className="!inline-flex !items-center !justify-center !gap-1.5 !px-3 !py-1 !bg-emerald-50 !text-[#1abc60] !rounded-md !text-xs !font-semibold !border !border-emerald-100">
                    <Award className="!w-3.5 !h-3.5" /> Elite Member
                  </span>
                </div>
                <div className="!flex !flex-wrap !justify-center sm:!justify-start !gap-4 !text-sm !font-medium !text-gray-500">
                  <div className="!flex !items-center !gap-1.5">
                    <Mail className="!w-4 !h-4 !text-gray-400" /> {user.email}
                  </div>
                  <div className="!flex !items-center !gap-1.5">
                    <Phone className="!w-4 !h-4 !text-gray-400" /> {user.phone || '+91 98765 43210'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="!flex !items-center !gap-3 !pb-2 !w-full sm:!w-auto !justify-center">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="!p-2.5 !bg-white !border !border-gray-200 !text-gray-600 hover:!text-gray-900 hover:!bg-gray-50 !rounded-lg !transition-colors !shadow-sm !cursor-pointer"
                  title="Settings"
                >
                  <Settings className="!w-5 !h-5" />
                </button>
                <button 
                  onClick={logout}
                  className="!px-4 !py-2.5 !bg-red-50 !text-red-600 !border !border-red-100 !rounded-lg !font-semibold !text-sm hover:!bg-red-100 !transition-colors !flex !items-center !gap-2 !cursor-pointer"
                >
                  <LogOut className="!w-4 !h-4" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="!grid !grid-cols-1 lg:!grid-cols-12 !gap-8">
          
          {/* Left Sidebar: Navigation & Stats */}
          <div className="lg:!col-span-4 !space-y-6">
            
            {/* Custom Tabs */}
            <div className="!bg-white !p-2 !rounded-xl !shadow-sm !border !border-gray-200 !space-y-1">
              <button 
                onClick={() => handleTabChange('bookings')}
                className={`!w-full !flex !items-center !justify-between !px-4 !py-3 !rounded-lg !transition-all !group !cursor-pointer !border-none ${activeTab === 'bookings' ? '!bg-[#1abc60] !text-white !shadow-sm' : 'hover:!bg-gray-50 !text-gray-600 !bg-transparent'}`}
              >
                <div className="!flex !items-center !gap-3">
                  <History className={`!w-4 !h-4 ${activeTab === 'bookings' ? '!text-white' : '!text-gray-400 group-hover:!text-[#1abc60]'}`} />
                  <span className="!font-semibold !text-sm">My Bookings</span>
                </div>
                <ChevronRight className={`!w-4 !h-4 ${activeTab === 'bookings' ? '!text-white' : '!text-gray-400'}`} />
              </button>
              
              <button 
                onClick={() => handleTabChange('activity')}
                className={`!w-full !flex !items-center !justify-between !px-4 !py-3 !rounded-lg !transition-all !group !cursor-pointer !border-none ${activeTab === 'activity' ? '!bg-[#1abc60] !text-white !shadow-sm' : 'hover:!bg-gray-50 !text-gray-600 !bg-transparent'}`}
              >
                <div className="!flex !items-center !gap-3">
                  <Activity className={`!w-4 !h-4 ${activeTab === 'activity' ? '!text-white' : '!text-gray-400 group-hover:!text-[#1abc60]'}`} />
                  <span className="!font-semibold !text-sm">Recent Activity</span>
                </div>
                <ChevronRight className={`!w-4 !h-4 ${activeTab === 'activity' ? '!text-white' : '!text-gray-400'}`} />
              </button>

              <button 
                onClick={() => handleTabChange('settings')}
                className={`!w-full !flex !items-center !justify-between !px-4 !py-3 !rounded-lg !transition-all !group !cursor-pointer !border-none ${activeTab === 'settings' ? '!bg-[#1abc60] !text-white !shadow-sm' : 'hover:!bg-gray-50 !text-gray-600 !bg-transparent'}`}
              >
                <div className="!flex !items-center !gap-3">
                  <Settings className={`!w-4 !h-4 ${activeTab === 'settings' ? '!text-white' : '!text-gray-400 group-hover:!text-[#1abc60]'}`} />
                  <span className="!font-semibold !text-sm">Account Settings</span>
                </div>
                <ChevronRight className={`!w-4 !h-4 ${activeTab === 'settings' ? '!text-white' : '!text-gray-400'}`} />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="!bg-white !p-6 !rounded-xl !shadow-sm !border !border-gray-200 !space-y-6">
              <h3 className="!text-sm !font-bold !text-gray-900 !uppercase !tracking-wider">Quick Stats</h3>
              <div className="!grid !grid-cols-2 !gap-4">
                <div className="!p-4 !bg-gray-50 !rounded-lg !border !border-gray-100">
                  <p className="!text-2xl !font-bold !text-gray-900 !mb-1">{bookings.length}</p>
                  <p className="!text-xs !font-semibold !text-gray-500 !uppercase">Total Bookings</p>
                </div>
                <div className="!p-4 !bg-emerald-50 !rounded-lg !border !border-emerald-100">
                  <p className="!text-2xl !font-bold !text-[#1abc60] !mb-1">
                    ₹{bookings.reduce((sum, b) => sum + parseSafeNumber(b.paidAmount), 0).toLocaleString()}
                  </p>
                  <p className="!text-xs !font-semibold !text-emerald-700 !uppercase">Total Spent</p>
                </div>
                <div className="!col-span-2 !p-4 !bg-yellow-50 !rounded-lg !border !border-yellow-100 !flex !items-center !justify-between">
                  <div>
                    <p className="!text-xs !font-semibold !text-yellow-700 !uppercase !mb-1">Available Coins</p>
                    <p className="!text-2xl !font-black !text-yellow-700">{user.coins || 0}</p>
                  </div>
                  <div className="!p-3 !bg-yellow-100 !rounded-xl">
                    <Award className="!w-6 !h-6 !text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div ref={mainContentRef} className="lg:!col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="!space-y-6"
                >
                  <div className="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !gap-4">
                    <h2 className="!text-xl !font-bold !text-gray-900">My Booking History</h2>
                    
                    {/* Status Filters */}
                    <div className="!flex !gap-2 !p-1 !bg-gray-100 !rounded-lg !border !border-gray-200 !overflow-x-auto !custom-scrollbar">
                      <button 
                        onClick={() => setBookingFilter('all')}
                        className={`!px-3 !py-1.5 !rounded-md !text-xs !font-semibold !transition-all !whitespace-nowrap !border-none !cursor-pointer ${bookingFilter === 'all' ? '!bg-white !text-gray-900 !shadow-sm' : '!text-gray-500 hover:!text-gray-700 !bg-transparent'}`}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setBookingFilter('upcoming')}
                        className={`!px-3 !py-1.5 !rounded-md !text-xs !font-semibold !transition-all !whitespace-nowrap !border-none !cursor-pointer ${bookingFilter === 'upcoming' ? '!bg-white !text-gray-900 !shadow-sm' : '!text-gray-500 hover:!text-gray-700 !bg-transparent'}`}
                      >
                        Upcoming
                      </button>
                      <button 
                        onClick={() => setBookingFilter('completed')}
                        className={`!px-3 !py-1.5 !rounded-md !text-xs !font-semibold !transition-all !whitespace-nowrap !border-none !cursor-pointer ${bookingFilter === 'completed' ? '!bg-white !text-gray-900 !shadow-sm' : '!text-gray-500 hover:!text-gray-700 !bg-transparent'}`}
                      >
                        Completed
                      </button>
                      <button 
                        onClick={() => setBookingFilter('cancelled')}
                        className={`!px-3 !py-1.5 !rounded-md !text-xs !font-semibold !transition-all !whitespace-nowrap !border-none !cursor-pointer ${bookingFilter === 'cancelled' ? '!bg-white !text-gray-900 !shadow-sm' : '!text-gray-500 hover:!text-gray-700 !bg-transparent'}`}
                      >
                        Cancelled
                      </button>
                    </div>
                  </div>

                  {/* Booking Type Filter (Ground vs Tournament) */}
                  <div className="!flex !gap-2">
                    <button 
                      onClick={() => setTypeFilter('all')}
                      className={`!px-4 !py-2 !rounded-lg !text-sm !font-semibold !transition-all !border !cursor-pointer ${typeFilter === 'all' ? '!bg-[#1abc60] !text-white !border-[#1abc60]' : '!bg-white !text-gray-600 !border-gray-200 hover:!bg-gray-50'}`}
                    >
                      All Types
                    </button>
                    <button 
                      onClick={() => setTypeFilter('ground')}
                      className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-lg !text-sm !font-semibold !transition-all !border !cursor-pointer ${typeFilter === 'ground' ? '!bg-[#1abc60] !text-white !border-[#1abc60]' : '!bg-white !text-gray-600 !border-gray-200 hover:!bg-gray-50'}`}
                    >
                      <LayoutList className="!w-4 !h-4" /> Grounds
                    </button>
                    <button 
                      onClick={() => setTypeFilter('tournament')}
                      className={`!flex !items-center !gap-2 !px-4 !py-2 !rounded-lg !text-sm !font-semibold !transition-all !border !cursor-pointer ${typeFilter === 'tournament' ? '!bg-[#1abc60] !text-white !border-[#1abc60]' : '!bg-white !text-gray-600 !border-gray-200 hover:!bg-gray-50'}`}
                    >
                      <Trophy className="!w-4 !h-4" /> Tournaments
                    </button>
                  </div>

                  {loadingBookings ? (
                    <div className="!bg-white !p-20 !rounded-2xl !border !border-gray-200 !flex !flex-col !items-center !justify-center !gap-4 !shadow-sm">
                      <Loader2 className="!w-8 !h-8 !animate-spin !text-[#1abc60]" />
                      <p className="!text-sm !font-semibold !text-gray-500">Syncing History...</p>
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="!bg-white !p-16 !rounded-2xl !border !border-gray-200 !text-center !space-y-4 !shadow-sm">
                      <div className="!w-16 !h-16 !bg-gray-50 !rounded-full !flex !items-center !justify-center !mx-auto !border !border-gray-100">
                        <Calendar className="!w-8 !h-8 !text-gray-400" />
                      </div>
                      <div className="!space-y-1">
                        <h3 className="!text-lg !font-bold !text-gray-900">No Bookings Found</h3>
                        <p className="!text-gray-500 !text-sm">Try adjusting your filters or book a new session.</p>
                      </div>
                      <button 
                        onClick={() => router.push('/ground')}
                        className="!mt-4 !inline-flex !bg-[#1abc60] !text-white !px-6 !py-2.5 !rounded-lg !font-semibold !text-sm !shadow-sm hover:!bg-[#17a554] !transition-colors !border-none !cursor-pointer"
                      >
                        Find a Ground
                      </button>
                    </div>
                  ) : (
                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-5">
                      {filteredBookings.map((booking) => {
                        const isTourn = isTournamentBooking(booking);
                        const itemName = isTourn ? (booking.tournament?.title || "Tournament Details") : (booking.turf?.name || "Venue Deleted");
            const itemImage = isTourn ? booking.tournament?.image : booking.turf?.images?.[0];
            const itemLocation = isTourn ? (booking.tournament?.location || "Tournament Event") : (booking.turf?.location?.city || "Unknown Location");
            const total = parseSafeNumber(booking.totalAmount || getBookingTotal(booking));
            const paid = parseSafeNumber(booking.paidAmount);
            const balance = Math.max(0, total - paid);
            
            return (
                          <motion.div 
                            layout
                            key={booking._id} 
                            className="!bg-white !rounded-xl !border !border-gray-200 !overflow-hidden !flex !flex-col !shadow-sm hover:!shadow-md hover:!border-green-200 !transition-all !cursor-default"
                          >
                            {/* Image Header */}
                            <div className="!h-32 !relative !overflow-hidden !bg-gray-100">
                              {itemImage ? (
                                <img 
                                  src={getImageUrl(itemImage)} 
                                  alt={itemName} 
                                  className="!w-full !h-full !object-cover" 
                                />
                              ) : (
                                <div className="!w-full !h-full !flex !items-center !justify-center">
                                  {isTourn ? <Trophy className="!w-8 !h-8 !text-gray-300" /> : <MapPin className="!w-8 !h-8 !text-gray-300" />}
                                </div>
                              )}
                              {/* Status Badge */}
                              <div className="!absolute !top-3 !left-3">
                                <span className={`!px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider !backdrop-blur-md !border ${
                                  getDisplayStatus(booking) === 'completed'
                                    ? '!bg-blue-500/90 !text-white !border-blue-400'
                                    : booking.status === 'confirmed' 
                                    ? '!bg-emerald-500/90 !text-white !border-emerald-400' 
                                    : booking.status === 'pending' 
                                      ? '!bg-amber-500/90 !text-white !border-amber-400' 
                                      : '!bg-red-500/90 !text-white !border-red-400'
                                }`}>
                                  {getDisplayStatus(booking)}
                                </span>
                              </div>
                              {/* Type Badge */}
                              <div className="!absolute !top-3 !right-3">
                                <span className={`!px-2.5 !py-1 !rounded-md !text-[10px] !font-bold !uppercase !tracking-wider !backdrop-blur-md !border !text-white ${isTourn ? '!bg-purple-500/90 !border-purple-400' : '!bg-gray-900/80 !border-gray-700'}`}>
                                  {isTourn ? 'Tournament' : 'Ground'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Card Body */}
                            <div className="!p-5 !flex-1 !flex !flex-col !justify-between">
                              <div className="!space-y-3">
                                <div className="!flex !justify-between !items-start !gap-2">
                                  <div className="!min-w-0 !flex-1">
                                    <div className="!flex !items-center !gap-1.5 !mb-1">
                        {isTourn ? <Trophy className="!w-3 !h-3 !text-[#1abc60]" /> : <Activity className="!w-3 !h-3 !text-[#1abc60]" />}
                        <span className="!text-[10px] !font-bold !text-[#1abc60] !uppercase !tracking-wider">
                          {isTourn ? "Tournament" : booking.sport}
                        </span>
                      </div>
                                    <h3 className="!text-base !font-bold !text-gray-900 !truncate" title={itemName}>{itemName}</h3>
                                    <div className="!flex !items-center !gap-1.5 !text-[11px] !text-gray-500 !mt-1 !font-medium">
                                      <MapPin className="!w-3 !h-3" />
                                      <span className="!truncate">{itemLocation}</span>
                                    </div>
                                  </div>
                                  <div className="!text-right !shrink-0">
                                    <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-wider !mb-0.5">
                                      Total Amount
                                    </p>
                                    <p className="!text-sm !font-bold !text-gray-600">
                                      ₹{total.toLocaleString()}
                                    </p>
                                    <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-wider !mt-1.5">
                                      Paid Amount
                                    </p>
                                    <p className="!text-base !font-bold !text-[#1abc60]">
                                      ₹{paid.toLocaleString()}
                                    </p>
                                    {balance > 0 ? (
                                      <p className="!text-[9px] !font-bold !text-red-500 !uppercase !mt-0.5">
                                        ₹{balance.toLocaleString()} Balance
                                      </p>
                                    ) : (
                                      <p className="!text-[9px] !font-bold !text-[#1abc60] !uppercase !mt-0.5">
                                        Fully Paid
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="!flex !items-center !gap-4 !pt-3 !border-t !border-gray-100">
                                  <div className="!flex !items-center !gap-2">
                                    <Calendar className="!w-4 !h-4 !text-gray-400" />
                                    <span className="!text-xs !font-semibold !text-gray-700">
                                      {isTourn ? (booking.displayDate || booking.date) : booking.date}
                                    </span>
                                  </div>
                                  {!isTourn && (
                                    <div className="!flex !items-center !gap-2">
                                      <Clock className="!w-4 !h-4 !text-gray-400" />
                                      <span className="!text-xs !font-semibold !text-gray-700">{booking.startTime}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="!mt-4 !pt-4 !border-t !border-gray-100 !flex !items-center !justify-between">
                                <span className="!text-[10px] !font-bold !text-gray-500 !uppercase !tracking-wider !flex !items-center !gap-1.5">
                                  <div className={`!w-2 !h-2 !rounded-full ${booking.paymentStatus === 'paid' ? '!bg-[#1abc60]' : '!bg-amber-400'}`} />
                                  {booking.paymentStatus}
                                </span>
                                <div className="!flex !items-center !gap-3">
                                  {!isTourn && booking.status === 'confirmed' && getDisplayStatus(booking) === 'upcoming' && booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                                  <button 
                                    onClick={() => openCancelModal(booking)}
                                    className="!text-[11px] !font-bold !text-red-600 !uppercase !tracking-wider hover:!text-red-700 !transition-all !bg-transparent !border-none !cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                )}
                                  {isTourn ? (
                                    <button 
                                      onClick={() => router.push(`/tournament/${booking.tournament?._id || booking.tournamentId}`)}
                                      className="!text-[11px] !font-bold !text-[#1abc60] !uppercase !tracking-wider !flex !items-center !gap-1 hover:!gap-2 !transition-all !bg-transparent !border-none !cursor-pointer"
                                    >
                                      View Tournament <ExternalLink className="!w-3.5 !h-3.5" />
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => setSelectedBooking(booking)}
                                      className="!text-[11px] !font-bold !text-[#1abc60] !uppercase !tracking-wider !flex !items-center !gap-1 hover:!gap-2 !transition-all !bg-transparent !border-none !cursor-pointer"
                                    >
                                      Details <ChevronRight className="!w-3.5 !h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {isBookingCompleted(booking) && !isTourn && (
                                <button
                                  onClick={() => handleOpenReviewModal(booking)}
                                  disabled={booking.hasReviewed}
                                  className={`!mt-3 !w-full !py-2.5 !rounded-lg !font-bold !text-xs !transition-all !flex !items-center !justify-center !gap-2 !border !cursor-pointer ${
                                    booking.hasReviewed
                                      ? '!bg-gray-50 !text-gray-400 !border-gray-200 cursor-not-allowed'
                                      : '!bg-amber-50 !text-amber-600 !border-amber-200 hover:!bg-amber-100'
                                  }`}
                                >
                                  <Star className="!w-4 !h-4" />
                                  {booking.hasReviewed ? 'Reviewed' : 'Write a Review'}
                                </button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="!bg-white !p-8 sm:!p-10 !rounded-2xl !border !border-gray-200 !shadow-sm !space-y-8"
                >
                  <div>
                    <h2 className="!text-xl !font-bold !text-gray-900">Account Settings</h2>
                    <p className="!text-sm !text-gray-500 !font-medium !mt-1">Manage your personal information and security</p>
                  </div>

                  <div className="!space-y-6">
                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
                      <div className="!space-y-1.5">
                        <label className="!text-sm !font-semibold !text-gray-700">Full Name</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="!w-full !px-4 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !font-medium !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all" 
                        />
                      </div>
                      <div className="!space-y-1.5">
                        <label className="!text-sm !font-semibold !text-gray-700">Phone Number</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setPhone(val);
                          }}
                          className="!w-full !px-4 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !font-medium !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all" 
                        />
                      </div>
                    </div>
                    
                    <div className="!space-y-1.5">
                      <label className="!text-sm !font-semibold !text-gray-700">Email Address</label>
                      <input 
                        type="email" 
                        disabled
                        defaultValue={user.email}
                        className="!w-full !px-4 !py-2.5 !bg-gray-50 !border !border-gray-200 !rounded-lg !font-medium !text-gray-500 !cursor-not-allowed" 
                      />
                    </div>

                    <div className="!pt-4 !border-t !border-gray-100">
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                        className="!bg-[#1abc60] !text-white !px-6 !py-2.5 !rounded-lg !font-semibold !text-sm !shadow-sm hover:!bg-[#17a554] !transition-colors !flex !items-center !gap-2 disabled:!opacity-70 !border-none !cursor-pointer"
                      >
                        {isUpdatingProfile ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <CheckCircle2 className="!w-4 !h-4" />}
                        Save Changes
                      </button>
                    </div>

                    {/* Password Update Section */}
                    <div className="!pt-8 !border-t !border-gray-100 !space-y-6">
                      <div>
                        <h3 className="!text-lg !font-bold !text-gray-900">Security</h3>
                        <p className="!text-sm !text-gray-500 !font-medium !mt-1">Update your password to keep your account secure</p>
                      </div>
                      
                      <div className="!space-y-5">
                        <div className="!space-y-1.5">
                          <label className="!text-sm !font-semibold !text-gray-700">Current Password</label>
                          <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="!w-full !max-w-md !px-4 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !font-medium !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all" 
                          />
                        </div>
                        
                        <div className="!grid !grid-cols-1 sm:!grid-cols-2 !gap-6 !max-w-3xl">
                          <div className="!space-y-1.5">
                            <label className="!text-sm !font-semibold !text-gray-700">New Password</label>
                            <input 
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="••••••••"
                              className="!w-full !px-4 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !font-medium !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all" 
                            />
                          </div>
                          <div className="!space-y-1.5">
                            <label className="!text-sm !font-semibold !text-gray-700">Confirm New Password</label>
                            <input 
                              type="password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="!w-full !px-4 !py-2.5 !bg-white !border !border-gray-300 !rounded-lg !font-medium !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all" 
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleUpdatePassword}
                          disabled={isUpdatingPassword}
                          className="!bg-gray-900 !text-white !px-6 !py-2.5 !rounded-lg !font-semibold !text-sm !shadow-sm hover:!bg-gray-800 !transition-colors !flex !items-center !gap-2 disabled:!opacity-70 !border-none !cursor-pointer"
                        >
                          {isUpdatingPassword ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <Lock className="!w-4 !h-4" />}
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="!space-y-6"
                >
                  <h2 className="!text-xl !font-bold !text-gray-900">Recent Activity</h2>
                  
                  <div className="!bg-white !rounded-2xl !border !border-gray-200 !shadow-sm !overflow-hidden">
                    {activitiesList.length === 0 ? (
                      <div className="!p-16 !text-center !space-y-4">
                        <div className="!w-16 !h-16 !bg-gray-50 !rounded-full !flex !items-center !justify-center !mx-auto !border !border-gray-100">
                          <Activity className="!w-8 !h-8 !text-gray-300" />
                        </div>
                        <p className="!text-gray-500 !font-semibold !text-sm">No activity recorded yet</p>
                      </div>
                    ) : (
                      <div className="!divide-y !divide-gray-100">
                        {activitiesList.map((item, idx) => (
                          <div key={idx} className="!p-5 !flex !items-center !gap-4 hover:!bg-gray-50 !transition-colors !group">
                            <div className={`!w-10 !h-10 ${item.bg} !rounded-lg !flex !items-center !justify-center ${item.color} !shrink-0 border border-current/10`}>
                              <item.icon className="!w-5 !h-5" />
                            </div>
                            <div className="!flex-1 !min-w-0">
                              <p className="!text-sm !font-bold !text-gray-900 !truncate">{item.title}</p>
                              <p className="!text-xs !font-medium !text-gray-500 !truncate !mt-0.5">{item.desc}</p>
                            </div>
                            <div className="!text-right !shrink-0">
                              <p className="!text-xs !font-semibold !text-gray-400">{item.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="!fixed !inset-0 !z-[100] !flex !items-center !justify-center !p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="!absolute !inset-0 !bg-gray-900/60 !backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="!relative !w-full !max-w-xl !bg-white !rounded-2xl !shadow-2xl !overflow-hidden !border !border-gray-200 !flex !flex-col !max-h-[90vh]"
            >
              {/* Header Image */}
              <div className="!h-48 !relative !overflow-hidden !shrink-0">
                {selectedBooking.turf ? (
                  <img 
                    src={getImageUrl(selectedBooking.turf.images[0])} 
                    className="!w-full !h-full !object-cover" 
                    alt={selectedBooking.turf.name} 
                  />
                ) : (
                  <div className="!w-full !h-full !bg-gray-100 !flex !items-center !justify-center">
                    <Activity className="!w-10 !h-10 !text-gray-300" />
                  </div>
                )}
                <div className="!absolute !inset-0 !bg-gradient-to-t !from-gray-900/80 !to-transparent" />
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="!absolute !top-4 !right-4 !p-2 !bg-black/40 hover:!bg-black/60 !backdrop-blur-sm !text-white !rounded-lg !transition-all !border-none !cursor-pointer"
                >
                  <X className="!w-5 !h-5" />
                </button>
                <div className="!absolute !bottom-4 !left-6 !right-6">
                  <span className="!inline-flex !px-2.5 !py-1 !bg-[#1abc60] !text-white !rounded !text-[10px] !font-bold !uppercase !tracking-wider !mb-2">
                    {selectedBooking.sport}
                  </span>
                  <h2 className="!text-2xl !font-bold !text-white !leading-tight !truncate">
                    {isTournamentBooking(selectedBooking) ? (selectedBooking.tournament?.title || "Tournament") : (selectedBooking.turf?.name || "Venue Deleted")}
                  </h2>
                </div>
              </div>

              <div className="!p-6 !overflow-y-auto !custom-scrollbar !flex-1">
                {(() => {
                  const total = parseSafeNumber(selectedBooking.totalAmount || getBookingTotal(selectedBooking));
                  const paid = parseSafeNumber(selectedBooking.paidAmount);
                  const balance = Math.max(0, total - paid);
                  return (
                    <>
                      <div className="!grid !grid-cols-2 gap-6">
                        <div className="!space-y-1">
                          <p className="!flex !items-center !gap-1.5 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wider">
                            <Ticket className="!w-3.5 !h-3.5" /> ID
                          </p>
                          <p className="!text-sm !font-bold !text-gray-900">#{selectedBooking.bookingId}</p>
                        </div>
                        <div className="!space-y-1">
                          <p className="!flex !items-center !gap-1.5 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wider">
                            <Calendar className="!w-3.5 !h-3.5" /> Date
                          </p>
                          <p className="!text-sm !font-bold !text-gray-900">{selectedBooking.date}</p>
                        </div>
                        {!isTournamentBooking(selectedBooking) && (
                          <>
                            <div className="!space-y-1">
                              <p className="!flex !items-center !gap-1.5 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wider">
                                <Clock className="!w-3.5 !h-3.5" /> Time
                              </p>
                              <p className="!text-sm !font-bold !text-gray-900">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                            </div>
                            <div className="!space-y-1">
                              <p className="!flex !items-center !gap-1.5 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wider">
                                <LayoutList className="!w-3.5 !h-3.5" /> Courts
                              </p>
                              <p className="!text-sm !font-bold !text-gray-900">{selectedBooking.courts?.join(', ') || 'N/A'}</p>
                            </div>
                          </>
                        )}
                        <div className="!space-y-1">
                          <p className="!flex !items-center !gap-1.5 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wider">
                            <CreditCard className="!w-3.5 !h-3.5" /> Total Price
                          </p>
                          <p className="!text-sm !font-bold !text-gray-900">₹{total.toLocaleString()}</p>
                        </div>
                        <div className="!space-y-1">
                          <p className="!flex !items-center !gap-1.5 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wider">
                            <CheckCircle2 className="!w-3.5 !h-3.5" /> Paid Amount
                          </p>
                          <p className="!text-sm !font-bold !text-[#1abc60]">₹{paid.toLocaleString()}</p>
                          {balance > 0 ? (
                            <p className="!text-[10px] !font-bold !text-red-500 !mt-1">
                              (₹{balance.toLocaleString()} due at venue)
                            </p>
                          ) : null}
                        </div>
                        <div className="!space-y-1">
                          <p className="!flex !items-center !gap-1.5 !text-xs !font-semibold !text-gray-500 !uppercase !tracking-wider">
                            <CheckCircle2 className="!w-3.5 !h-3.5" /> Status
                          </p>
                          <span className={`!inline-flex !px-2 !py-0.5 !rounded !text-[10px] !font-bold !uppercase !tracking-wider !border ${
                            getDisplayStatus(selectedBooking) === 'completed'
                              ? '!bg-blue-50 !text-blue-600 !border-blue-200'
                              : selectedBooking.status === 'confirmed'
                                ? '!bg-emerald-50 !text-emerald-600 !border-emerald-200'
                                : selectedBooking.status === 'cancelled'
                                  ? '!bg-red-50 !text-red-600 !border-red-200'
                                  : '!bg-amber-50 !text-amber-600 !border-amber-200'
                          }`}>
                            {getDisplayStatus(selectedBooking)}
                          </span>
                        </div>
                      </div>

                      <div className="!mt-8 !pt-6 !border-t !border-gray-100 !flex !items-center !gap-4">
                        <div className="!w-12 !h-12 !bg-gray-50 !rounded-lg !flex !items-center !justify-center !text-gray-500 !shrink-0 !border !border-gray-200">
                          <MapPin className="!w-6 !h-6" />
                        </div>
                        <div className="!flex-1">
                          <p className="!text-xs !font-semibold !text-gray-500 !uppercase !tracking-wider !mb-0.5">Location</p>
                          <p className="!text-sm !font-bold !text-gray-900">
                            {isTournamentBooking(selectedBooking) 
                              ? (selectedBooking.tournament?.location || "Tournament Event")
                              : (selectedBooking.turf?.location 
                                  ? `${selectedBooking.turf.location.address}, ${selectedBooking.turf.location.city}` 
                                  : "Location Unavailable")}
                          </p>
                        </div>
                        {isTournamentBooking(selectedBooking) && (
                          <button 
                            onClick={() => router.push(`/tournament/${selectedBooking.tournament?._id || selectedBooking.tournamentId}`)}
                            className="!p-3 !bg-[#1abc60]/10 hover:!bg-[#1abc60]/20 !text-[#1abc60] !rounded-lg !transition-colors !border !border-[#1abc60]/20 !cursor-pointer !flex !items-center !gap-2 !font-bold !text-xs"
                            title="View Tournament"
                          >
                            <Trophy className="!w-4 !h-4" />
                            VIEW TOURNAMENT
                          </button>
                        )}
                        {selectedBooking.turf && !isTournamentBooking(selectedBooking) && (
                          <button 
                            onClick={() => router.push(`/ground/${selectedBooking.turf?._id}`)}
                            className="!p-3 !bg-gray-50 hover:!bg-gray-100 !text-gray-600 !rounded-lg !transition-colors !border !border-gray-200 !cursor-pointer"
                            title="View Venue"
                          >
                            <ExternalLink className="!w-5 !h-5" />
                          </button>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Modal Actions */}
              <div className="!p-6 !border-t !border-gray-100 !bg-gray-50 !flex !gap-3 !shrink-0">
                <button 
                  className="!flex-1 !py-2.5 !bg-white !border !border-gray-300 !text-gray-700 !rounded-lg !font-semibold !text-sm hover:!bg-gray-50 !transition-colors !cursor-pointer !shadow-sm"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
                <button className="!flex-[2] !py-2.5 !bg-[#1abc60] !text-white !rounded-lg !font-semibold !text-sm !shadow-sm hover:!bg-[#17a554] !transition-colors !border-none !cursor-pointer">
                  Download Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal.open && reviewModal.booking && (
          <div className="!fixed !inset-0 !z-[120] !flex !items-center !justify-center !p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewModal({ open: false, booking: null })}
              className="!absolute !inset-0 !bg-gray-900/60 !backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="!relative !w-full !max-w-md !bg-white !rounded-2xl !shadow-2xl !overflow-hidden !border !border-gray-200"
            >
              <div className="!px-6 !py-4 !border-b !border-gray-100 !flex !justify-between !items-center !bg-gray-50/50">
                <div>
                  <h3 className="!text-lg !font-bold !text-gray-900 !leading-tight">Write a Review</h3>
                  <p className="!text-xs !font-medium !text-gray-500 !mt-0.5">For {reviewModal.booking.turf?.name || reviewModal.booking.tournament?.title || "Ground"}</p>
                </div>
                <button
                  onClick={() => setReviewModal({ open: false, booking: null })}
                  className="!p-2 !text-gray-400 hover:!text-gray-600 hover:!bg-gray-100 !rounded-lg !transition-colors !bg-transparent !border-none !cursor-pointer"
                >
                  <X className="!w-5 !h-5" />
                </button>
              </div>

              <div className="!p-6 !space-y-6">
                <div className="!flex !flex-col !items-center !gap-3">
                  <p className="!text-sm !font-semibold !text-gray-700">How was your experience?</p>
                  <div className="!flex !items-center !gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setReviewRating(rating)}
                        className="!p-1 !bg-transparent !border-none !cursor-pointer hover:!scale-110 !transition-transform"
                      >
                        <Star
                          className={`!w-10 !h-10 ${
                            rating <= reviewRating
                              ? '!fill-amber-400 !text-amber-400'
                              : '!text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="!space-y-2">
                  <label className="!text-xs !font-semibold !text-gray-600 !uppercase !tracking-wider">Your Feedback</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    placeholder="Tell us what you liked or what could be better..."
                    className="!w-full !px-4 !py-3 !bg-white !border !border-gray-300 !rounded-xl !font-medium !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all !resize-none"
                  />
                </div>
              </div>

              <div className="!p-6 !border-t !border-gray-100 !bg-gray-50">
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="!w-full !bg-[#1abc60] !text-white !py-3 !rounded-lg !font-bold !text-sm !shadow-sm hover:!bg-[#17a554] !transition-colors !flex !items-center !justify-center !gap-2 disabled:!opacity-60 disabled:!cursor-not-allowed !border-none"
                >
                  {submittingReview ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : <Send className="!w-4 !h-4" />}
                  Submit Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Booking Modal */}
      <AnimatePresence>
        {showCancelModal && bookingToCancel && (
          <div className="!fixed !inset-0 !z-[130] !flex !items-center !justify-center !p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="!absolute !inset-0 !bg-gray-900/60 !backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="!relative !w-full !max-w-md !bg-white !rounded-2xl !shadow-2xl !overflow-hidden !border !border-gray-200"
            >
              <div className="!px-6 !py-4 !border-b !border-gray-100 !flex !justify-between !items-center !bg-red-50/50">
                <div>
                  <h3 className="!text-lg !font-bold !text-gray-900 !leading-tight">
                    {cancelModalStep === 'confirm' ? 'Cancel Booking' : 'Refund Details'}
                  </h3>
                  <p className="!text-xs !font-medium !text-gray-500 !mt-0.5">
                    {cancelModalStep === 'confirm' 
                      ? 'Are you sure you want to cancel?' 
                      : 'Fill in your details for refund'}
                  </p>
                </div>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="!p-2 !text-gray-400 hover:!text-gray-600 hover:!bg-gray-100 !rounded-lg !transition-colors !bg-transparent !border-none !cursor-pointer"
                >
                  <X className="!w-5 !h-5" />
                </button>
              </div>

              {cancelModalStep === 'confirm' ? (
                <div className="!p-6 !space-y-6">
                  {/* Booking Info */}
                  <div className="!bg-gray-50 !rounded-xl !p-4 !border !border-gray-100">
                    <p className="!text-xs !font-semibold !text-gray-500 !uppercase !tracking-wider !mb-2">Booking Details</p>
                    <h4 className="!text-sm !font-bold !text-gray-900 mb-1">{bookingToCancel.turf?.name}</h4>
                    <p className="!text-xs !text-gray-500">{bookingToCancel.date} • {bookingToCancel.startTime} - {bookingToCancel.endTime}</p>
                    <p className="!text-sm !font-bold !text-[#1abc60] mt-2">₹{getBookingTotal(bookingToCancel)}</p>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="!bg-amber-50 !rounded-xl !p-4 !border !border-amber-200">
                    <p className="!text-xs !font-semibold !text-amber-700 !uppercase !tracking-wider mb-2">Cancellation Policy</p>
                    {refundPreview ? (
                      <div className="!space-y-2">
                        <p className="!text-sm !font-bold !text-amber-900">{refundPreview.policyNote}</p>
                        <div className="!grid !grid-cols-2 !gap-2 !text-xs">
                          <div className="!bg-white !p-2 !rounded-lg">
                            <span className="!text-gray-500">Your Refund:</span>
                            <span className="!block !text-lg !font-bold !text-green-600">₹{refundPreview.refundAmount}</span>
                          </div>
                          <div className="!bg-white !p-2 !rounded-lg">
                            <span className="!text-gray-500">Hours Left:</span>
                            <span className="!block !text-lg !font-bold !text-gray-700">{refundPreview.hoursUntilBooking}h</span>
                          </div>
                        </div>
                        {refundPreview.refundPercentage < 100 && (
                          <p className="!text-xs !text-amber-600 !italic">Tip: Cancel earlier to get a higher refund!</p>
                        )}
                      </div>
                    ) : (
                      <p className="!text-xs !text-amber-600">Checking cancellation policy...</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="!p-6 !space-y-4">
                  {/* Name Input */}
                  <div className="!space-y-1">
                    <label className="!text-xs !font-semibold !text-gray-600 !uppercase !tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={cancelFormData.name}
                      onChange={(e) => setCancelFormData({ ...cancelFormData, name: e.target.value })}
                      className="!w-full !px-4 !py-3 !bg-white !border !border-gray-300 !rounded-xl !font-medium !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="!space-y-1">
                    <label className="!text-xs !font-semibold !text-gray-600 !uppercase !tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={cancelFormData.phone}
                      onChange={(e) => setCancelFormData({ ...cancelFormData, phone: e.target.value })}
                      className="!w-full !px-4 !py-3 !bg-white !border !border-gray-300 !rounded-xl !font-medium !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="!space-y-1">
                    <label className="!text-xs !font-semibold !text-gray-600 !uppercase !tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={cancelFormData.email}
                      onChange={(e) => setCancelFormData({ ...cancelFormData, email: e.target.value })}
                      className="!w-full !px-4 !py-3 !bg-white !border !border-gray-300 !rounded-xl !font-medium !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* UPI ID Input */}
                  <div className="!space-y-1">
                    <label className="!text-xs !font-semibold !text-gray-600 !uppercase !tracking-wider">UPI ID</label>
                    <input
                      type="text"
                      value={cancelFormData.upiId}
                      onChange={(e) => setCancelFormData({ ...cancelFormData, upiId: e.target.value })}
                      className="!w-full !px-4 !py-3 !bg-white !border !border-gray-300 !rounded-xl !font-medium !text-gray-900 focus:!outline-none focus:!ring-2 focus:!ring-[#1abc60]/20 focus:!border-[#1abc60] !transition-all"
                      placeholder="Enter your UPI ID"
                    />
                  </div>

                  <p className="!text-xs !text-gray-500 !bg-amber-50 !p-3 !rounded-xl">
                    *Refund will be processed within 5-7 working days
                  </p>
                </div>
              )}

              <div className="!p-6 !border-t !border-gray-100 !bg-gray-50 !flex !gap-3">
                {cancelModalStep === 'confirm' ? (
                  <>
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="!flex-1 !py-2.5 !bg-white !border !border-gray-300 !text-gray-700 !rounded-lg !font-semibold !text-sm hover:!bg-gray-100 !transition-colors !cursor-pointer"
                    >
                      Keep Booking
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      disabled={cancelLoading || (refundPreview && !refundPreview.canCancel)}
                      className="!flex-1 !py-2.5 !bg-red-600 !text-white !border !border-red-600 !rounded-lg !font-semibold !text-sm hover:!bg-red-700 !transition-colors !cursor-pointer !flex !items-center !justify-center !gap-2 disabled:!opacity-60 disabled:!cursor-not-allowed"
                    >
                      {cancelLoading ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : null}
                      Next
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setCancelModalStep('confirm')}
                      className="!flex-1 !py-2.5 !bg-white !border !border-gray-300 !text-gray-700 !rounded-lg !font-semibold !text-sm hover:!bg-gray-100 !transition-colors !cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      disabled={cancelLoading}
                      className="!flex-1 !py-2.5 !bg-red-600 !text-white !border !border-red-600 !rounded-lg !font-semibold !text-sm hover:!bg-red-700 !transition-colors !cursor-pointer !flex !items-center !justify-center !gap-2 disabled:!opacity-60 disabled:!cursor-not-allowed"
                    >
                      {cancelLoading ? <Loader2 className="!w-4 !h-4 !animate-spin" /> : null}
                      Submit & Cancel
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coin Reward Popup */}
      <AnimatePresence>
        {showCoinPopup && (
          <div className="!fixed !inset-0 !z-[150] !flex !items-center !justify-center !p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCoinPopup(false)}
              className="!absolute !inset-0 !bg-gray-900/60 !backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="!relative !w-full !max-w-sm !bg-white !rounded-3xl !shadow-2xl !p-8 !text-center !overflow-hidden !border !border-yellow-100"
            >
              {/* Confetti Background Effect */}
              <div className="!absolute !inset-0 !pointer-events-none">
                <div className="!absolute !top-0 !left-1/4 !w-2 !h-2 !bg-yellow-400 !rounded-full !animate-ping" style={{ animationDelay: '0.1s' }} />
                <div className="!absolute !top-1/4 !right-1/4 !w-2 !h-2 !bg-[#1abc60] !rounded-full !animate-ping" style={{ animationDelay: '0.3s' }} />
                <div className="!absolute !bottom-1/4 !left-1/3 !w-2 !h-2 !bg-blue-400 !rounded-full !animate-ping" style={{ animationDelay: '0.5s' }} />
              </div>

              <div className="!relative !z-10 !space-y-6">
                <div className="!relative !inline-block">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut"
                    }}
                    className="!w-24 !h-24 !bg-gradient-to-tr !from-yellow-400 !to-amber-100 !rounded-full !flex !items-center !justify-center !mx-auto !shadow-lg !border-4 !border-white"
                  >
                    <Award className="!w-12 !h-12 !text-yellow-700" />
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="!absolute !-bottom-2 !-right-2 !bg-[#1abc60] !text-white !p-2 !rounded-full !shadow-md !border-2 !border-white"
                  >
                    <CheckCircle2 className="!w-5 !h-5" />
                  </motion.div>
                </div>

                <div className="!space-y-2">
                  <h3 className="!text-2xl !font-black !text-gray-900 !leading-tight">Reward Earned!</h3>
                  <p className="!text-sm !font-medium !text-gray-500">
                    {rewardAmount >= 100 ? "Amazing! You just earned 100+ rewards!" : "Thank you for your valuable feedback."}
                  </p>
                </div>

                <div className="!bg-yellow-50 !rounded-2xl !p-4 !border !border-yellow-100 !flex !items-center !justify-center !gap-3">
                  <div className="!w-10 !h-10 !bg-yellow-400 !rounded-full !flex !items-center !justify-center !shadow-inner">
                    <span className="!text-white !font-black !text-xl">₹</span>
                  </div>
                  <div className="!text-left">
                    <p className="!text-[10px] !font-bold !text-yellow-700 !uppercase !tracking-widest">Coins Added</p>
                    <p className="!text-2xl !font-black !text-yellow-700">+{rewardAmount}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCoinPopup(false)}
                  className="!w-full !bg-gray-900 !text-white !py-4 !rounded-2xl !font-bold !text-sm !shadow-xl hover:!bg-black !transition-all active:!scale-95 !border-none !cursor-pointer"
                >
                  Awesome!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}   