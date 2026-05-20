"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Download, Calendar, Clock, 
  MapPin, Settings, Info, Loader2,
  Home, Trophy, User, Users
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
    isMultiple?: boolean;
    slots?: string[];
    bookingCount?: number;
    price?: number;
    pricePerHour?: number;
    paidAmount?: number;
    totalAmount?: number;
    paymentMethod?: string;
  };
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  courts: string[];
  totalAmount: number;
  paidAmount: number;
  price?: number;
  paymentMethod: string;
  isMultiple?: boolean;
  slots?: string[];
  bookingCount?: number;
}

interface TournamentRegistration {
  _id: string;
  title: string;
  sport: string;
  startDate: string;
  location: {
    address: string;
    city: string;
    venue: string;
  };
  image?: string;
  entryFee: number;
  registeredTeams?: {
    name: string;
    captain: string;
    members?: { name: string; role: string }[];
  }[];
}

export default function PaymentSuccessPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [tournament, setTournament] = useState<TournamentRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTournament, setIsTournament] = useState(false);

  useEffect(() => {
    if (String(id).startsWith('tournament_')) {
      setIsTournament(true);
      fetchTournament();
    } else {
      fetchBooking();
    }
  }, [id]);

  const fetchTournament = async () => {
    try {
      const tournamentId = String(id).replace('tournament_', '');
      const res = await api.get(`/tournaments/${tournamentId}`);
      if (res.data.success) {
        setTournament(res.data.tournament);
      }
    } catch (error: any) {
      toast.error("Tournament details not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooking = async () => {
    try {
      const bookingId = String(id).split(',')[0];
      const res = await api.get(`/bookings/${bookingId}`);
      if (res.data.success) {
        setBooking(res.data.booking);
      }
    } catch (error: any) {
      toast.error("Booking not found");
    } finally {
      setLoading(false);
    }
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
    // 1. Try direct amounts from booking object
    const directAmount = parseSafeNumber(booking.totalAmount || booking.paidAmount || (booking as any).price);
    if (directAmount > 0) return directAmount;

    // 2. Fallback conceptual calculation
    try {
      const basePrice = parseSafeNumber(booking.turf?.pricePerHour || (booking.turf as any).price);
      const effectivePrice = basePrice > 0 ? basePrice : 1000; // Sensible default
      
      const numCourts = booking.courts?.length || 1;

      if (booking.isMultiple && booking.slots) {
        const totalHours = booking.slots.reduce((sum, slot) => {
          const [s, e] = slot.split(' - ');
          return sum + getDurationInHours(s, e);
        }, 0);
        return Math.max(effectivePrice, totalHours * effectivePrice) * numCourts;
      }

      const duration = getDurationInHours(booking.startTime, booking.endTime);
      return Math.max(1, duration) * effectivePrice * numCourts;
    } catch (e) {
      return 1000; // Last resort default
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!booking && !tournament) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 font-sans text-gray-900">
      <div className="max-w-[800px] mx-auto px-4 text-center">
        
        {/* --- SUCCESS ICON & HEADER --- */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-5 mb-12"
        >
          <div className="w-20 h-20 bg-[#1abc60] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Payment Successful!</h1>
            <p className="text-gray-500 font-medium text-sm">
              {isTournament ? "Your team registration is confirmed. See you at the tournament!" : "Your slot is locked in. Get ready for the game."}
            </p>
          </div>
        </motion.div>

        {/* --- BOOKING/TOURNAMENT TICKET CARD --- */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm text-left relative"
        >
          {/* Top Banner Image */}
          <div className="h-48 relative">
            <img 
              src={isTournament ? getImageUrl(tournament?.image || "") : getImageUrl(booking?.turf.images?.[0] || "")} 
              alt={isTournament ? tournament?.title : booking?.turf.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#1abc60] px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide shadow-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Paid
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                {isTournament ? tournament?.title : booking?.turf.name}
              </h2>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Header Details */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                {isTournament 
                  ? `${tournament?.location.venue}, ${tournament?.location.city}` 
                  : (booking?.turf.location.address || 'Plot 42, Sector 18, Gurugram')}
              </div>
              <div className="text-left md:text-right bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
                  {isTournament ? 'Tournament ID' : 'Booking ID'}
                </p>
                <p className="text-sm font-bold text-gray-900 uppercase">
                  {isTournament ? `#TRN-${tournament?._id.slice(-6).toUpperCase()}` : `#${booking?.bookingId}`}
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Date */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#1abc60] shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {isTournament 
                      ? new Date(tournament?.startDate || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : booking?.date}
                  </p>
                </div>
              </div>

              {/* Time/Status */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#1abc60] shrink-0">
                  {isTournament ? <Trophy className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
                    {isTournament ? 'Status' : `Time Slot${booking?.isMultiple ? 's' : ''}`}
                  </p>
                  <div className="space-y-0.5">
                    {isTournament ? (
                      <p className="text-sm font-bold text-[#1abc60]">CONFIRMED</p>
                    ) : (
                      booking?.isMultiple && booking.slots ? (
                        booking.slots.map((slot, i) => (
                          <p key={i} className="text-sm font-bold text-gray-900">{slot}</p>
                        ))
                      ) : (
                        <p className="text-sm font-bold text-gray-900">{booking?.startTime} - {booking?.endTime}</p>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Court/Sport */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#1abc60] shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
                    {isTournament ? 'Sport' : booking?.sport}
                  </p>
                  <p className="text-sm font-bold text-gray-900 uppercase">
                    {isTournament ? tournament?.sport : booking?.courts.join(', ')}
                  </p>
                </div>
              </div>

              {/* Amount Paid */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#1abc60] shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Amount Paid</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">
                    ₹{(isTournament 
                        ? parseSafeNumber(tournament?.entryFee) 
                        : (parseSafeNumber(booking?.paidAmount) || (booking ? getBookingTotal(booking) : 0))
                      ).toLocaleString()} 
                    <span className="text-gray-400 font-medium text-xs ml-1 normal-case">via {(isTournament ? 'UPI' : (booking?.paymentMethod || 'UPI').toUpperCase())}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Team Members Section */}
            {isTournament && tournament?.registeredTeams && (
              <div className="pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Squad Registered</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tournament.registeredTeams.flatMap(t => t.members || []).map((member, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col gap-1">
                      <span className="text-sm font-bold text-gray-900 truncate">{member.name}</span>
                      <span className="text-xs font-semibold text-[#1abc60] uppercase">{member.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
              <Link 
                href={isTournament ? "/profile?tab=bookings&type=tournament" : "/profile?tab=bookings&type=ground"}
                className="!flex-1 !py-3 !bg-[#1abc60] hover:!bg-[#17a554] !text-white !rounded-lg !font-semibold !text-sm !transition-colors !flex !items-center !justify-center !shadow-sm !no-underline"
              >
                {isTournament ? "View Tournament Booking" : "View My Booking"}
              </Link>
              
              <button 
                className="!flex-1 !py-3 !bg-white hover:!bg-gray-50 !text-gray-700 !border !border-gray-300 !rounded-lg !font-semibold !text-sm !transition-colors !flex !items-center !justify-center !gap-2 !cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
            </div>
          </div>
        </motion.div>

        {/* --- IMPORTANT INFO --- */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100 text-left space-y-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Info className="w-5 h-5" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Important Information</h4>
          </div>
          <ul className="space-y-2.5">
            {isTournament ? [
              'Please reach the venue 30 minutes before your first match.',
              'Bring original ID proofs of all team members for verification.',
              'Tournament rules and fixtures will be shared via email/phone.'
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm font-medium text-blue-900/80">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                {text}
              </li>
            )) : [
              'Please arrive at least 15 minutes prior to your scheduled slot for registration.',
              'Valid Government ID proof of at least one player is mandatory for entry.',
              'Cancellations are allowed up to 4 hours before the slot for a 50% refund.'
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-sm font-medium text-blue-900/80">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* --- FOOTER LINKS --- */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          <Link 
            href="/ground"
            className="!flex !items-center !gap-2 !text-[#1abc60] !font-semibold !text-sm hover:!underline !transition-all !no-underline"
          >
            <CheckCircle2 className="w-4 h-4" />
            Book Another Ground
          </Link>
          <Link 
            href="/"
            className="!flex !items-center !gap-2 !text-gray-500 !font-medium !text-sm hover:!text-gray-900 !transition-colors !no-underline"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}