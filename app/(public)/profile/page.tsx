"use client";

import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Mail, Phone, Loader2, LogOut, 
  Calendar, MapPin, Clock, Camera, Settings, History, 
  CreditCard, ChevronRight, Activity, Bell, Award, CheckCircle2,
  X, ExternalLink, Ticket, Star, Send, LayoutList, Trophy
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  _id: string;
  type?: 'ground' | 'tournament'; // Added for filtering
  turf?: {
    _id: string;
    name: string;
    location: {
      city: string;
      address: string;
    };
    images: string[];
  };
  tournament?: {
    _id: string;
    title: string;
    image?: string;
  };
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
  paymentStatus: string;
  bookingId: string;
  courts?: string[];
  createdAt: string;
  updatedAt: string;
  hasReviewed?: boolean;
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

  // Refs for file inputs
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Profile Update States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Update States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [isLoading, isAuthenticated, router, user]);

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
      
      const res = await api.get('/bookings/my', { params });
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  }, [bookingFilter]);

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
        setBookings(bookings.map(b => 
          b._id === reviewModal.booking?._id ? { ...b, hasReviewed: true } : b
        ));
      }
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const isBookingCompleted = (booking: Booking) => {
    if (booking.status === 'completed') return true;
    if (booking.status !== 'confirmed') return false;
    const bookingEnd = new Date(`${booking.date}T${booking.endTime || '23:59'}:00`);
    return !Number.isNaN(bookingEnd.getTime()) && bookingEnd <= new Date();
  };

  const getDisplayStatus = (booking: Booking) => {
    if (isBookingCompleted(booking)) return 'completed';
    return booking.status;
  };

  const isTournamentBooking = (b: Booking) => b.type === 'tournament' || !!b.tournament;

  // Apply frontend filters for booking type
  const filteredBookings = bookings.filter(b => {
    if (typeFilter === 'ground' && isTournamentBooking(b)) return false;
    if (typeFilter === 'tournament' && !isTournamentBooking(b)) return false;
    return true;
  });

  if (isLoading) {
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

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '')}${path}`;
  };

  const getRecentActivities = (): ActivityItem[] => {
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
          desc: `Paid ₹${b.price} for booking #${b.bookingId.slice(-6)}`,
          time: new Date(b.updatedAt).toLocaleDateString(),
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          timestamp: new Date(b.updatedAt)
        });
      }

      if (b.status === 'confirmed') {
        activities.push({
          icon: Bell,
          title: "Booking Confirmed",
          desc: `Your slot at ${b.startTime} on ${b.date} is confirmed`,
          time: new Date(b.updatedAt).toLocaleDateString(),
          color: "text-purple-600",
          bg: "bg-purple-50",
          timestamp: new Date(b.updatedAt)
        });
      }
    });

    if (user.createdAt) {
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
  };

  const recentActivities = getRecentActivities();

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
                onClick={() => setActiveTab('bookings')}
                className={`!w-full !flex !items-center !justify-between !px-4 !py-3 !rounded-lg !transition-all !group !cursor-pointer !border-none ${activeTab === 'bookings' ? '!bg-[#1abc60] !text-white !shadow-sm' : 'hover:!bg-gray-50 !text-gray-600 !bg-transparent'}`}
              >
                <div className="!flex !items-center !gap-3">
                  <History className={`!w-4 !h-4 ${activeTab === 'bookings' ? '!text-white' : '!text-gray-400 group-hover:!text-[#1abc60]'}`} />
                  <span className="!font-semibold !text-sm">My Bookings</span>
                </div>
                <ChevronRight className={`!w-4 !h-4 ${activeTab === 'bookings' ? '!text-white' : '!text-gray-400'}`} />
              </button>
              
              <button 
                onClick={() => setActiveTab('activity')}
                className={`!w-full !flex !items-center !justify-between !px-4 !py-3 !rounded-lg !transition-all !group !cursor-pointer !border-none ${activeTab === 'activity' ? '!bg-[#1abc60] !text-white !shadow-sm' : 'hover:!bg-gray-50 !text-gray-600 !bg-transparent'}`}
              >
                <div className="!flex !items-center !gap-3">
                  <Activity className={`!w-4 !h-4 ${activeTab === 'activity' ? '!text-white' : '!text-gray-400 group-hover:!text-[#1abc60]'}`} />
                  <span className="!font-semibold !text-sm">Recent Activity</span>
                </div>
                <ChevronRight className={`!w-4 !h-4 ${activeTab === 'activity' ? '!text-white' : '!text-gray-400'}`} />
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
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
                  <p className="!text-2xl !font-bold !text-[#1abc60] !mb-1">₹{bookings.reduce((sum, b) => sum + b.price, 0)}</p>
                  <p className="!text-xs !font-semibold !text-emerald-700 !uppercase">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:!col-span-8">
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
                        const itemLocation = isTourn ? "Tournament Event" : (booking.turf?.location?.city || "Unknown Location");

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
                                      <span className="!text-[10px] !font-bold !text-[#1abc60] !uppercase !tracking-wider">{booking.sport}</span>
                                    </div>
                                    <h3 className="!text-base !font-bold !text-gray-900 !truncate" title={itemName}>{itemName}</h3>
                                    <div className="!flex !items-center !gap-1.5 !text-[11px] !text-gray-500 !mt-1 !font-medium">
                                      <MapPin className="!w-3 !h-3" />
                                      <span className="!truncate">{itemLocation}</span>
                                    </div>
                                  </div>
                                  <div className="!text-right !shrink-0">
                                    <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-wider !mb-0.5">Paid</p>
                                    <p className="!text-base !font-bold !text-gray-900">₹{booking.price}</p>
                                  </div>
                                </div>

                                <div className="!flex !items-center !gap-4 !pt-3 !border-t !border-gray-100">
                                  <div className="!flex !items-center !gap-2">
                                    <Calendar className="!w-4 !h-4 !text-gray-400" />
                                    <span className="!text-xs !font-semibold !text-gray-700">{booking.date}</span>
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
                                <button 
                                  onClick={() => setSelectedBooking(booking)}
                                  className="!text-[11px] !font-bold !text-[#1abc60] !uppercase !tracking-wider !flex !items-center !gap-1 hover:!gap-2 !transition-all !bg-transparent !border-none !cursor-pointer"
                                >
                                  Details <ChevronRight className="!w-3.5 !h-3.5" />
                                </button>
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
                          onChange={(e) => setPhone(e.target.value)}
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
                    {recentActivities.length === 0 ? (
                      <div className="!p-16 !text-center !space-y-4">
                        <div className="!w-16 !h-16 !bg-gray-50 !rounded-full !flex !items-center !justify-center !mx-auto !border !border-gray-100">
                          <Activity className="!w-8 !h-8 !text-gray-300" />
                        </div>
                        <p className="!text-gray-500 !font-semibold !text-sm">No activity recorded yet</p>
                      </div>
                    ) : (
                      <div className="!divide-y !divide-gray-100">
                        {recentActivities.map((item, idx) => (
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
                      <CreditCard className="!w-3.5 !h-3.5" /> Paid
                    </p>
                    <p className="!text-sm !font-bold !text-[#1abc60]">₹{selectedBooking.price}</p>
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
                      {selectedBooking.turf ? `${selectedBooking.turf.location.address}, ${selectedBooking.turf.location.city}` : "Location Unavailable"}
                    </p>
                  </div>
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
                  <p className="!text-xs !font-medium !text-gray-500 !mt-0.5">For {reviewModal.booking.turf?.name || "Venue"}</p>
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
    </div>
  );
}