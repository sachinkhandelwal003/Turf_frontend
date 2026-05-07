"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Wallet, Landmark, 
  Smartphone, ChevronRight, Loader2, Info,
  Users as UsersIcon, CheckCircle2, AlertCircle,
  Calendar, Clock, Settings, Plus
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';

interface Booking {
  _id: string;
  bookingId: string;
  turf: {
    name: string;
    location: { city: string };
    pricePerHour: number;
    images: string[];
  };
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  courts: string[];
  price: number;
  totalAmount: number;
  convenienceFee: number;
  isMultiple?: boolean;
  slots?: string[];
  bookingCount?: number;
}

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Payment States
  const [strategy, setStrategy] = useState<'full' | 'partial'>('partial');
  const [splitWithSquad, setSplitWithSquad] = useState(true);
  const [numPlayers, setNumPlayers] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error("Please login to access checkout");
        router.push(`/login?redirect=/checkout/${id}`);
      } else {
        fetchBooking();
      }
    }
  }, [id, isAuthenticated, authLoading]);

  const fetchBooking = async () => {
    try {
      // Handle potential multiple IDs by taking the first one if the backend doesn't support bulk
      const bookingId = String(id).split(',')[0];
      const res = await api.get(`/bookings/${bookingId}`);
      if (res.data.success) {
        setBooking(res.data.booking);
      }
    } catch (error: any) {
      toast.error("Booking not found");
      router.push('/ground');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const res = await api.post(`/bookings/${id}/pay`, {
        paymentMethod,
        paymentId: `PAY${Date.now()}`
      });

      if (res.data.success) {
        toast.success("Payment Successful!");
        router.push(`/payment-success/${id}`);
      }
    } catch (error: any) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    try {
      const [startH] = start.split(':').map(Number);
      const [endH] = end.split(':').map(Number);
      const diff = endH - startH;
      return diff > 0 ? `${diff} hr${diff > 1 ? 's' : ''}` : '1 hr';
    } catch (e) {
      return '1 hr';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!booking) return null;

  const payableToday = strategy === 'full' ? booking.totalAmount : (booking.totalAmount * 0.25);
  const balanceDue = booking.totalAmount - payableToday;
  const perPlayer = payableToday / numPlayers;

  const getDurationLabel = () => {
    if (booking.isMultiple && booking.bookingCount) {
      return `${booking.bookingCount} hr${booking.bookingCount > 1 ? 's' : ''}`;
    }
    return calculateDuration(booking.startTime, booking.endTime);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 font-sans text-gray-900 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
            Secure Checkout
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium">Finalize your booking details and gear up for the game.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* --- LEFT CONTENT: FORM SECTIONS --- */}
          <div className="flex-1 space-y-8 w-full">
            
            {/* 1. PAYMENT STRATEGY */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-3">Payment Strategy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Amount */}
                <div 
                  onClick={() => setStrategy('full')}
                  className={`relative p-5 rounded-lg border-2 cursor-pointer transition-all hover:bg-green-50/30 ${
                    strategy === 'full' ? 'border-[#1abc60] bg-green-50/20' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${strategy === 'full' ? 'border-[#1abc60]' : 'border-gray-300'}`}>
                      {strategy === 'full' && <div className="w-2.5 h-2.5 rounded-full bg-[#1abc60]" />}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Pay Full Amount</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">₹{booking.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 font-medium">Zero worries, full access guaranteed.</p>
                </div>

                {/* Partial Amount */}
                <div 
                  onClick={() => setStrategy('partial')}
                  className={`relative p-5 rounded-lg border-2 cursor-pointer transition-all hover:bg-green-50/30 ${
                    strategy === 'partial' ? 'border-[#1abc60] bg-green-50/20' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                    Popular
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${strategy === 'partial' ? 'border-[#1abc60]' : 'border-gray-300'}`}>
                      {strategy === 'partial' && <div className="w-2.5 h-2.5 rounded-full bg-[#1abc60]" />}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Pay 25% Now</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">₹{Math.round(booking.totalAmount * 0.25).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 font-medium">Balance ₹{Math.round(booking.totalAmount * 0.75).toLocaleString()} due at ground.</p>
                </div>
              </div>
            </div>

            {/* 2. SPLIT WITH SQUAD */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-green-50 flex items-center justify-center text-[#1abc60]">
                    <UsersIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">Split with Squad</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${splitWithSquad ? 'text-[#1abc60]' : 'text-gray-400'}`}>
                    {splitWithSquad ? 'Enabled' : 'Disabled'}
                  </span>
                  <button 
                    onClick={() => setSplitWithSquad(!splitWithSquad)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1abc60] focus:ring-offset-2 ${splitWithSquad ? 'bg-[#1abc60]' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${splitWithSquad ? 'translate-x-6' : 'translate-x-1'}`}></span>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {splitWithSquad && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col sm:flex-row gap-6 items-center bg-gray-50 rounded-lg p-5 border border-gray-100 overflow-hidden"
                  >
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-xs text-gray-600 font-semibold uppercase tracking-wider block">Number of Players</label>
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-[#1abc60]/20 focus-within:border-[#1abc60] transition-all p-1">
                        <input 
                          type="number" 
                          value={numPlayers}
                          onChange={(e) => setNumPlayers(Math.max(1, parseInt(e.target.value) || 1))}
                          className="!flex-1 !bg-transparent !px-3 !py-2 !text-lg !font-bold !text-gray-900 !outline-none !border-none !w-full"
                        />
                        <div className="px-3 py-1.5 bg-gray-100 rounded text-gray-600 font-semibold text-xs uppercase tracking-wider">Players</div>
                      </div>
                    </div>
                    <div className="w-full sm:w-[200px] bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm shrink-0">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Each Player Pays</p>
                      <p className="text-2xl font-bold text-[#1abc60]">₹{perPlayer.toFixed(2)}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button 
                className="!w-full !py-3 !bg-gray-50 hover:!bg-gray-100 !text-gray-700 !rounded-lg !font-semibold !text-sm !transition-colors !flex !items-center !justify-center !gap-2 !border !border-gray-200 !cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Participant Manually
              </button>
            </div>

            {/* 3. CHOOSE PAYMENT METHOD */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-3">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'upi', name: 'UPI Payment', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
                  { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                  { id: 'netbanking', name: 'Net Banking', icon: Landmark, desc: '' }
                ].map((method) => (
                  <div 
                    key={method.id}
                    className={`rounded-lg border transition-all overflow-hidden bg-white ${
                      paymentMethod === method.id ? 'border-[#1abc60] ring-1 ring-[#1abc60]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => setPaymentMethod(method.id)}
                      className="!w-full !flex !items-center !gap-4 !p-4 !bg-transparent !border-none !cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                        <method.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-sm font-bold text-gray-900">{method.name}</h4>
                        {method.desc && <p className="text-xs text-gray-500 font-medium mt-0.5">{method.desc}</p>}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                        paymentMethod === method.id ? 'border-[#1abc60]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1abc60]" />
                        )}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {method.id === 'card' && paymentMethod === 'card' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 pb-4 space-y-3 overflow-hidden bg-gray-50/50 pt-2 border-t border-gray-100"
                        >
                          <input 
                            type="text" 
                            placeholder="Card Number" 
                            className="!w-full !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-md !text-sm !outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !shadow-sm" 
                          />
                          <div className="flex gap-3">
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              className="!flex-1 !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-md !text-sm !outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !shadow-sm" 
                            />
                            <input 
                              type="text" 
                              placeholder="CVV" 
                              className="!flex-1 !px-3 !py-2.5 !bg-white !border !border-gray-300 !rounded-md !text-sm !outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !shadow-sm" 
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* --- RIGHT SIDEBAR SUMMARY --- */}
          <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 space-y-6">
                
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Booking Summary</h3>
                
                {/* Info Items */}
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 border border-gray-100">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Sport & Court</p>
                      <h4 className="text-sm font-bold text-gray-900">
                        {booking.sport} ({booking.courts.join(', ')})
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 border border-gray-100">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Date</p>
                      <h4 className="text-sm font-bold text-gray-900">{booking.date}</h4>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 border border-gray-100">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
                        Time Slot{booking.isMultiple ? 's' : ''}
                      </p>
                      <div className="space-y-0.5">
                        {booking.isMultiple && booking.slots ? (
                          booking.slots.map((slot, i) => (
                            <h4 key={i} className="text-sm font-bold text-gray-900 uppercase">
                              {slot}
                            </h4>
                          ))
                        ) : (
                          <h4 className="text-sm font-bold text-gray-900 uppercase">
                            {booking.startTime} - {booking.endTime} <span className="text-gray-500 font-medium normal-case">({getDurationLabel()})</span>
                          </h4>
                        )}
                        {booking.isMultiple && (
                          <p className="text-xs font-semibold text-[#1abc60] mt-1">
                            Total Duration: {getDurationLabel()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill Details */}
                <div className="space-y-3 pt-5 border-t border-gray-100">
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>
                      Venue Charges 
                      {booking.isMultiple && ` (${booking.bookingCount} slots × ${booking.courts.length} courts)`}
                      {!booking.isMultiple && booking.courts.length > 1 && ` (${booking.courts.length} courts)`}
                    </span>
                    <span className="text-gray-900">₹{booking.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Convenience Fee</span>
                    <span className="text-gray-900">₹{booking.convenienceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 pb-2 border-b border-dashed border-gray-200">
                    <span className="text-sm font-bold text-gray-800">Payable Today</span>
                    <span className="text-xl font-bold text-gray-900">₹{payableToday.toFixed(2)}</span>
                  </div>
                </div>

                {/* Balance Due Section */}
                <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-bold text-[#1abc60] uppercase tracking-wide">Balance Due</span>
                  <span className="text-xl font-bold text-[#1abc60]">₹{balanceDue.toFixed(0)}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="!w-full !py-3.5 !bg-[#1abc60] hover:!bg-[#17a554] !text-white !font-bold !text-sm !uppercase !tracking-wide !rounded-lg !transition-colors !flex !items-center !justify-center !gap-2 disabled:!opacity-70 !shadow-sm !border-none !cursor-pointer"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Confirm & Pay ₹{payableToday.toFixed(0)}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-red-50 rounded-xl p-4 flex gap-3 border border-red-100">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500 shrink-0 shadow-sm border border-red-100">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-xs text-red-800 font-medium leading-relaxed pt-0.5">
                Booking will be cancelled if remaining amount is not paid before match time. Please ensure the squad arrives 15 minutes early.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}