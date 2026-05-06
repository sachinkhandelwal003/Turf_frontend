"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Mail, Phone, Loader2, LogOut, 
  Calendar, MapPin, Clock, Camera, Settings, History, 
  CreditCard, ChevronRight, Activity, Bell, Award, CheckCircle2,
  X, ExternalLink, Ticket
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Booking {
  _id: string;
  turf: {
    _id: string;
    name: string;
    location: {
      city: string;
      address: string;
    };
    images: string[];
  };
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
  paymentStatus: string;
  bookingId: string;
  courts: string[];
  createdAt: string;
  updatedAt: string;
}

interface ActivityItem {
  icon: any;
  title: string;
  desc: string;
  time: string;
  color: string;
  bg: string;
  timestamp: Date;
}

export default function ProfilePage() {
  const { user, isLoading, logout, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'settings' | 'activity'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'upcoming'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to update profile');
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
        // Use context refresh instead of page reload
        await refreshUser();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.msg || 'Upload failed');
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
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'all') return true;
    const bookingDate = new Date(b.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Profile</p>
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

    // 1. Add Bookings Activities
    bookings.forEach(b => {
      // Booking Created
      activities.push({
        icon: Ticket,
        title: "Booking Initiated",
        desc: `You booked ${b.turf.name} for ${b.sport}`,
        time: new Date(b.createdAt).toLocaleDateString(),
        color: "text-blue-500",
        bg: "bg-blue-50",
        timestamp: new Date(b.createdAt)
      });

      // Payment Activity
      if (b.paymentStatus === 'paid') {
        activities.push({
          icon: CreditCard,
          title: "Payment Successful",
          desc: `Paid ₹${b.price} for booking #${b.bookingId.slice(-6)}`,
          time: new Date(b.updatedAt).toLocaleDateString(),
          color: "text-[#1abc60]",
          bg: "bg-emerald-50",
          timestamp: new Date(b.updatedAt)
        });
      }

      // Confirmation Activity
      if (b.status === 'confirmed') {
        activities.push({
          icon: Bell,
          title: "Booking Confirmed",
          desc: `Your slot at ${b.startTime} on ${b.date} is confirmed`,
          time: new Date(b.updatedAt).toLocaleDateString(),
          color: "text-purple-500",
          bg: "bg-purple-50",
          timestamp: new Date(b.updatedAt)
        });
      }
    });

    // 2. Add Account Activity (Synthetic based on user data)
    if (user.createdAt) {
      activities.push({
        icon: Award,
        title: "Joined GameOn",
        desc: "Welcome to the elite community of sports enthusiasts!",
        time: new Date(user.createdAt).toLocaleDateString(),
        color: "text-amber-500",
        bg: "bg-amber-50",
        timestamp: new Date(user.createdAt)
      });
    }

    // Sort by most recent
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  };

  const recentActivities = getRecentActivities();

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hidden File Inputs */}
        <input type="file" ref={profileInputRef} className="hidden" onChange={(e) => handlePhotoUpload(e, 'profilePhoto')} accept="image/*" />
        <input type="file" ref={coverInputRef} className="hidden" onChange={(e) => handlePhotoUpload(e, 'coverPhoto')} accept="image/*" />

        {/* Profile Header Card */}
        <div className="bg-white rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden relative mb-10">
          <div className="h-48 bg-gradient-to-r from-[#1abc60] via-[#2ecc71] to-[#16a085] relative overflow-hidden">
            {user.coverPhoto ? (
              <img src={getImageUrl(user.coverPhoto)} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
              </div>
            )}
            
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-6 right-8 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm border border-white/20"
            >
              <Camera className="w-4 h-4" /> Edit Cover
            </button>
          </div>

          <div className="px-10 pb-10">
            <div className="flex flex-col md:flex-row items-end gap-8 -mt-16 relative z-10">
              <div className="relative group">
                <div className="bg-white p-2.5 rounded-[40px] shadow-2xl">
                  <div className="w-40 h-40 rounded-[32px] bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white">
                    {user.profilePhoto ? (
                      <img src={getImageUrl(user.profilePhoto)} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 bg-[#1abc60] text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform border-4 border-white"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 pb-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">{user.name}</h1>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-[#1abc60] rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <Award className="w-3.5 h-3.5" /> Elite Member
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                    <Mail className="w-4 h-4 text-[#1abc60]" /> {user.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                    <Phone className="w-4 h-4 text-[#1abc60]" /> {user.phone || '+91 98765 43210'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-4">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="p-4 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-3xl transition-all"
                >
                  <Settings className="w-6 h-6" />
                </button>
                <button 
                  onClick={logout}
                  className="px-8 py-4 bg-red-50 text-red-600 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-red-100 transition-all flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Sidebar: Navigation & Stats */}
          <div className="lg:col-span-4 space-y-10">
            {/* Custom Tabs */}
            <div className="bg-white p-4 rounded-[40px] shadow-sm border border-gray-100 space-y-2">
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between p-5 rounded-[30px] transition-all group ${activeTab === 'bookings' ? 'bg-[#1abc60] text-white shadow-lg shadow-green-100' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <div className="flex items-center gap-4">
                  <History className={`w-5 h-5 ${activeTab === 'bookings' ? 'text-white' : 'text-gray-400 group-hover:text-[#1abc60]'}`} />
                  <span className="font-black uppercase tracking-widest text-xs">My Bookings</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-white' : 'text-gray-300'}`} />
              </button>
              
              <button 
                onClick={() => setActiveTab('activity')}
                className={`w-full flex items-center justify-between p-5 rounded-[30px] transition-all group ${activeTab === 'activity' ? 'bg-[#1abc60] text-white shadow-lg shadow-green-100' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <div className="flex items-center gap-4">
                  <Activity className={`w-5 h-5 ${activeTab === 'activity' ? 'text-white' : 'text-gray-400 group-hover:text-[#1abc60]'}`} />
                  <span className="font-black uppercase tracking-widest text-xs">Recent Activity</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'activity' ? 'text-white' : 'text-gray-300'}`} />
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between p-5 rounded-[30px] transition-all group ${activeTab === 'settings' ? 'bg-[#1abc60] text-white shadow-lg shadow-green-100' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <div className="flex items-center gap-4">
                  <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-white' : 'text-gray-400 group-hover:text-[#1abc60]'}`} />
                  <span className="font-black uppercase tracking-widest text-xs">Account Settings</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-gray-300'}`} />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-8">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-3xl font-black text-gray-900">{bookings.length}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bookings</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black text-[#1abc60]">₹{bookings.reduce((sum, b) => sum + b.price, 0)}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spent</p>
                </div>
              </div>
              <div className="pt-8 border-t border-gray-50 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Rank</p>
                  <p className="text-sm font-black text-gray-900 uppercase">Top 5% Player</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wider">My Booking History</h2>
                    <div className="flex gap-2 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100">
                      <button 
                        onClick={() => setBookingFilter('all')}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${bookingFilter === 'all' ? 'bg-[#1abc60] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        All
                      </button>
                      <button 
                        onClick={() => setBookingFilter('upcoming')}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${bookingFilter === 'upcoming' ? 'bg-[#1abc60] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        Upcoming
                      </button>
                    </div>
                  </div>

                  {loadingBookings ? (
                    <div className="bg-white p-20 rounded-[48px] border border-gray-50 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Syncing History</p>
                    </div>
                  ) : filteredBookings.length === 0 ? (
                    <div className="bg-white p-20 rounded-[48px] border border-gray-100 text-center space-y-6 shadow-sm">
                      <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto">
                        <Calendar className="w-10 h-10 text-gray-200" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-gray-900 uppercase">No Bookings Found</h3>
                        <p className="text-gray-400 font-bold max-w-xs mx-auto">Your upcoming games and history will appear here once you start booking.</p>
                      </div>
                      <button 
                        onClick={() => router.push('/ground')}
                        className="inline-flex bg-[#1abc60] text-white px-10 py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-100 hover:scale-105 transition-all"
                      >
                        Find a Ground
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredBookings.map((booking) => (
                        <motion.div 
                          layout
                          key={booking._id} 
                          className="bg-white rounded-[32px] border border-gray-100 overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:border-green-100 transition-all group"
                        >
                          <div className="h-32 relative overflow-hidden">
                            <img 
                              src={getImageUrl(booking.turf.images[0])} 
                              alt={booking.turf.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                            <div className="absolute top-3 left-3">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border ${
                                booking.status === 'confirmed' 
                                  ? 'bg-emerald-500/80 text-white border-emerald-400' 
                                  : booking.status === 'pending' 
                                    ? 'bg-amber-500/80 text-white border-amber-400' 
                                    : 'bg-red-500/80 text-white border-red-400'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Activity className="w-3 h-3 text-[#1abc60]" />
                                    <span className="text-[8px] font-black text-[#1abc60] uppercase tracking-widest">{booking.sport}</span>
                                  </div>
                                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none truncate">{booking.turf.name}</h3>
                                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {booking.turf.location.city}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Paid</p>
                                  <p className="text-lg font-black text-gray-900">₹{booking.price}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-[10px] font-black text-gray-900 uppercase">{booking.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-[10px] font-black text-gray-900 uppercase">{booking.startTime}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${booking.paymentStatus === 'paid' ? 'bg-[#1abc60]' : 'bg-amber-400'}`} />
                                {booking.paymentStatus}
                              </span>
                              <button 
                                onClick={() => setSelectedBooking(booking)}
                                className="text-[9px] font-black text-[#1abc60] uppercase tracking-widest flex items-center gap-1 hover:translate-x-1 transition-transform"
                              >
                                View <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
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
                  className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-sm space-y-10"
                >
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Account Settings</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Manage your personal information and security</p>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[24px] font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[24px] font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                      <input 
                        type="email" 
                        disabled
                        defaultValue={user.email}
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[24px] font-bold text-gray-400 cursor-not-allowed" 
                      />
                    </div>

                    <div className="pt-6 border-t border-gray-50">
                      <button 
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                        className="w-full bg-[#1abc60] text-white py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                      >
                        {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Profile'}
                      </button>
                    </div>

                    {/* Password Update Section */}
                    <div className="pt-10 space-y-8">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Security</h4>
                        <p className="text-sm font-black text-gray-900 uppercase">Change Password</p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
                          <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[24px] font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                            <input 
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[24px] font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all" 
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                            <input 
                              type="password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-[24px] font-bold text-gray-900 outline-none focus:ring-4 focus:ring-green-50 focus:border-[#1abc60] transition-all" 
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleUpdatePassword}
                          disabled={isUpdatingPassword}
                          className="w-full bg-gray-900 text-white py-4 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                          {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
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
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wider">Recent Activity</h2>
                  
                  <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
                    {recentActivities.length === 0 ? (
                      <div className="p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto">
                          <Activity className="w-10 h-10 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No activity recorded yet</p>
                      </div>
                    ) : (
                      recentActivities.map((item, idx) => (
                        <div key={idx} className={`p-8 flex items-center gap-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all group`}>
                          <div className={`w-14 h-14 ${item.bg} rounded-[24px] flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.title}</p>
                            <p className="text-xs font-bold text-gray-400 mt-1">{item.desc}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.time}</p>
                          </div>
                        </div>
                      ))
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden"
            >
              {/* Header Image */}
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={getImageUrl(selectedBooking.turf.images[0])} 
                  className="w-full h-full object-cover" 
                  alt={selectedBooking.turf.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="absolute top-6 right-6 p-2.5 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-2xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">{selectedBooking.sport}</p>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">{selectedBooking.turf.name}</h2>
                </div>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Ticket className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Booking ID</span>
                    </div>
                    <p className="text-sm font-black text-gray-900 uppercase">#{selectedBooking.bookingId}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Date</span>
                    </div>
                    <p className="text-sm font-black text-gray-900 uppercase">{selectedBooking.date}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Time Slot</span>
                    </div>
                    <p className="text-sm font-black text-gray-900 uppercase">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Courts</span>
                    </div>
                    <p className="text-sm font-black text-gray-900 uppercase">{selectedBooking.courts?.join(', ') || 'N/A'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-400">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Amount Paid</span>
                    </div>
                    <p className="text-sm font-black text-[#1abc60]">₹{selectedBooking.price}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Status</span>
                    </div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      selectedBooking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1abc60]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                    <p className="text-xs font-bold text-gray-700">{selectedBooking.turf.location.address}, {selectedBooking.turf.location.city}</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/ground/${selectedBooking.turf._id}`)}
                    className="p-4 bg-[#1abc60] text-white rounded-2xl hover:bg-[#169c4e] transition-all shadow-lg shadow-green-100"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Close
                  </button>
                  <button className="flex-[2] py-4 bg-[#1abc60] text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-100 hover:scale-[1.02] transition-all">
                    Download Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
