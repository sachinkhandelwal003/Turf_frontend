"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Mail, Phone, Shield, Loader2, LogOut, Calendar, MapPin, Clock } from 'lucide-react';
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
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
}

export default function ProfilePage() {
  const { user, isLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
          {/* Profile Header */}
          <div className="bg-[#1abc60] h-32 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-gray-100 w-24 h-24 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4 text-[#1abc60]" />
                  <span className="capitalize">{user.role}</span>
                </p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-bold text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Contact Information</h2>
                
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <Phone className="w-5 h-5 text-[#1abc60]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Account Details</h2>
                
                <div className="flex items-center gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">User Permissions</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.permissions && user.permissions.length > 0 ? (
                        user.permissions.map((perm, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                            {perm}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No special permissions</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Bookings Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6 uppercase tracking-wider">My Bookings</h2>
          
          {loadingBookings ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white p-12 rounded-[40px] border border-gray-100 text-center space-y-4 shadow-sm">
              <Calendar className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-gray-500 font-bold">You don't have any bookings yet.</p>
              <button 
                onClick={() => router.push('/explore')}
                className="inline-block bg-[#1abc60] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-green-100"
              >
                Explore Venues
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-40 h-40 shrink-0">
                    <img 
                      src={booking.turf.images[0].startsWith('http') ? booking.turf.images[0] : `http://localhost:5001${booking.turf.images[0]}`} 
                      alt={booking.turf.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-gray-900">{booking.turf.name}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                          booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : 
                          booking.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-bold">
                        <MapPin className="w-3 h-3 text-[#1abc60]" />
                        {booking.turf.location.city}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-bold text-gray-700">{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-bold text-gray-700">{booking.startTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center border-t pt-4">
                      <span className="text-sm font-black text-gray-900">₹{booking.price}</span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{booking.sport}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
