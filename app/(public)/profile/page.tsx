"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Calendar, 
  MapPin, Clock, Camera, Edit3, 
  Save, X, LogOut, ChevronRight,
  Shield, CheckCircle2, History, Loader2
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/services/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface Booking {
  _id: string;
  bookingId: string;
  turf: {
    name: string;
    location: { address: string; city: string };
    images: string[];
  };
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
}

export default function ProfilePage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditData({ name: user.name, phone: user.phone || '' });
      fetchMyBookings();
    }
  }, [user]);

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/bookings/my?filter=upcoming');
      if (res.data.success) {
        setBookings(res.data.bookings.slice(0, 3)); // Only show top 3 upcoming
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await api.put('/auth/profile', editData);
      if (res.data.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        // We might need to update the context here, or refresh
        window.location.reload(); 
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Update failed");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePhoto', file);

    setUploading(true);
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success("Photo updated successfully");
        window.location.reload();
      }
    } catch (error: any) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (path: string | undefined) => {
    if (!path) return `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=1abc60&color=fff&size=256`;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- LEFT: USER CARD --- */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 text-center relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#1abc60] to-[#059669] opacity-10" />
              
              <div className="relative z-10 space-y-6">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-8 ring-white shadow-2xl mx-auto bg-gray-50">
                    <img 
                      src={getImageUrl(user.profilePhoto)} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-[#1abc60] text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all border-4 border-white">
                    <Camera className="w-4 h-4" />
                    <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                  </label>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{user.name}</h2>
                  <div className="flex items-center justify-center gap-2 text-[#1abc60] font-black text-[10px] uppercase tracking-widest bg-green-50 w-fit mx-auto px-4 py-1.5 rounded-full">
                    <Shield className="w-3 h-3" />
                    {user.role} Account
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 space-y-4">
                  <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md hover:shadow-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-[#1abc60] transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-gray-700 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-2xl group transition-all hover:bg-white hover:shadow-md hover:shadow-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-[#1abc60] transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-bold text-gray-700">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={logout}
                  className="w-full py-4 rounded-2xl text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out from Account
                </button>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT: PROFILE DETAILS & BOOKINGS --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Account Settings Section */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[40px] p-8 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-[#1abc60]">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Account Details</h3>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleUpdateProfile}
                      className="flex items-center gap-2 px-6 py-3 bg-[#1abc60] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100"
                    >
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-[#1abc60] focus:bg-white rounded-2xl font-bold text-gray-700 outline-none transition-all"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 border border-transparent italic">
                      {user.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Phone Number</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-[#1abc60] focus:bg-white rounded-2xl font-bold text-gray-700 outline-none transition-all"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-gray-50 rounded-2xl font-bold text-gray-700 border border-transparent italic">
                      {user.phone || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Upcoming Bookings Quick View */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[40px] p-8 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                    <History className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Quick History</h3>
                </div>
                <Link 
                  href="/bookings"
                  className="flex items-center gap-2 text-[#1abc60] font-black text-[10px] uppercase tracking-[0.2em] hover:gap-4 transition-all"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 px-6 bg-gray-50 rounded-3xl space-y-4">
                  <p className="text-sm font-bold text-gray-500 italic">No upcoming bookings found.</p>
                  <Link 
                    href="/ground"
                    className="inline-block px-8 py-3 bg-[#1abc60] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100"
                  >
                    Book Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Link 
                      key={booking._id} 
                      href={`/payment-success/${booking._id}`}
                      className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-3xl border border-gray-50 hover:border-[#1abc60]/20 hover:bg-green-50/10 transition-all group"
                    >
                      <div className="w-full sm:w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md">
                        <img 
                          src={getImageUrl(booking.turf.images?.[0])} 
                          alt={booking.turf.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left space-y-1">
                        <h4 className="font-black text-gray-900 uppercase tracking-tight">{booking.turf.name}</h4>
                        <div className="flex items-center justify-center sm:justify-start gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {booking.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.startTime}</span>
                        </div>
                      </div>
                      <div className="px-6 py-2 bg-gray-50 rounded-xl text-sm font-black text-gray-900 group-hover:bg-[#1abc60] group-hover:text-white transition-colors">
                        ₹{booking.totalAmount || booking.price || 0}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
