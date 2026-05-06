"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Download, Calendar, Clock, 
  MapPin, Settings, Info, Loader2, ChevronRight,
  ArrowRight, Home, Smartphone
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import Link from 'next/link';

interface Booking {
  _id: string;
  bookingId: string;
  turf: {
    name: string;
    location: { 
      address: string;
      city: string;
    };
    images: string[];
  };
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  courts: string[];
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
}

export default function PaymentSuccessPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      if (res.data.success) {
        setBooking(res.data.booking);
      }
    } catch (error: any) {
      toast.error("Booking not found");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return '/placeholder-turf.png';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 font-sans">
      <div className="max-w-[800px] mx-auto px-4 text-center">
        
        {/* --- SUCCESS ICON & HEADER --- */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-6 mb-16"
        >
          <div className="w-24 h-24 bg-[#1abc60] rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-100">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#1abc60] uppercase tracking-tight">Payment Successful!</h1>
            <p className="text-gray-500 font-medium text-sm">Your slot is locked in. Get ready for the game.</p>
          </div>
        </motion.div>

        {/* --- BOOKING TICKET CARD --- */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#f9fafb] rounded-[48px] overflow-hidden border border-gray-100 shadow-sm text-left relative"
        >
          {/* Top Banner Image */}
          <div className="h-56 relative">
            <img 
              src={getImageUrl(booking.turf.images?.[0])} 
              alt={booking.turf.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 right-6 bg-[#1abc60] text-white px-5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">
              Paid
            </div>
          </div>

          <div className="p-10 lg:p-12 space-y-10">
            {/* Title & Booking ID */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{booking.turf.name}</h2>
                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                  <MapPin className="w-4 h-4 text-[#1abc60]" />
                  {booking.turf.location.address || 'Plot 42, Sector 18, Gurugram, Haryana'}
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Booking ID</p>
                <p className="text-base font-black text-gray-900">#{booking.bookingId}</p>
              </div>
            </div>

            <div className="h-px bg-gray-200/50 w-full" />

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Date */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1abc60] shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Date</p>
                  <p className="text-sm font-black text-gray-900 uppercase">{booking.date}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1abc60] shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Time</p>
                  <p className="text-sm font-black text-gray-900">{booking.startTime} - {booking.endTime}</p>
                </div>
              </div>

              {/* Court */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1abc60] shadow-sm">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">{booking.sport}</p>
                  <p className="text-sm font-black text-gray-900 uppercase">{booking.courts[0]}</p>
                </div>
              </div>

              {/* Amount Paid */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1abc60] shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">Amount Paid</p>
                  <p className="text-sm font-black text-gray-900 uppercase">₹{booking.paidAmount.toLocaleString()} via {booking.paymentMethod?.toUpperCase() || 'UPI'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link 
                href="/bookings"
                className="flex-1 py-5 bg-[#1abc60] text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 hover:scale-[1.02] transition-all flex items-center justify-center"
              >
                View My Bookings
              </Link>
              <button className="flex-1 py-5 bg-[#e5e7eb] text-gray-600 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-gray-300 transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
            </div>
          </div>
        </motion.div>

        {/* --- IMPORTANT INFO --- */}
        <div className="mt-8 p-8 bg-[#f1fdf6] rounded-[32px] border border-[#dcfce7] text-left space-y-5">
          <div className="flex items-center gap-3 text-[#1abc60]">
            <Info className="w-5 h-5" />
            <h4 className="text-sm font-black uppercase tracking-widest">Important Information</h4>
          </div>
          <ul className="space-y-3">
            {[
              'Please arrive at least 15 minutes prior to your scheduled slot for registration.',
              'Valid Government ID proof of at least one player is mandatory for entry.',
              'Cancellations are allowed up to 4 hours before the slot for a 50% refund.'
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-xs font-bold text-gray-600">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1abc60] mt-1.5 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* --- FOOTER LINKS --- */}
        <div className="mt-12 space-y-6">
          <Link 
            href="/ground"
            className="inline-flex items-center gap-2 text-[#1abc60] font-black uppercase tracking-widest text-xs hover:gap-4 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Book Another Ground
          </Link>
          <div className="pt-2">
            <Link 
              href="/"
              className="text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
