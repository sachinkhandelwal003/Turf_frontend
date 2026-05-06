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
}

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Payment States
  const [strategy, setStrategy] = useState<'full' | 'partial'>('partial');
  const [splitWithSquad, setSplitWithSquad] = useState(true);
  const [numPlayers, setNumPlayers] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState('upi');

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!booking) return null;

  const payableToday = strategy === 'full' ? booking.totalAmount : (booking.totalAmount * 0.25);
  const balanceDue = booking.totalAmount - payableToday;
  const perPlayer = payableToday / numPlayers;

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 font-sans text-gray-900 overflow-x-hidden">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight leading-none mb-3">
            <span className="text-[#1abc60]">SECURE</span> <span className="text-gray-900 uppercase">Checkout</span>
          </h1>
          <p className="text-gray-400 font-bold text-xs md:text-sm tracking-tight">Finalize your booking details and gear up for the game.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* --- LEFT CONTENT: FORM SECTIONS --- */}
          <div className="flex-1 space-y-10 w-full">
            
            {/* 1. PAYMENT STRATEGY */}
            <div className="space-y-6">
              <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-900">Payment Strategy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                {/* Full Amount */}
                <div 
                  onClick={() => setStrategy('full')}
                  className={`relative p-6 md:p-10 rounded-[32px] bg-[#f3f4f1] cursor-pointer border-2 transition-all ${
                    strategy === 'full' ? 'border-[#1abc60]' : 'border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center text-[#1abc60] shadow-sm">
                      <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center ${strategy === 'full' ? 'border-[#1abc60]' : 'border-gray-300'}`}>
                      {strategy === 'full' && <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-[#1abc60]" />}
                    </div>
                  </div>
                  <h3 className="text-base md:text-[18px] font-black text-gray-900 mb-1">Pay Full Amount</h3>
                  <p className="text-2xl md:text-[32px] font-black text-[#1abc60] mb-3 leading-none">₹{booking.totalAmount.toLocaleString()}</p>
                  <p className="text-[10px] md:text-[11px] text-gray-400 font-bold">Zero worries, full access guaranteed.</p>
                </div>

                {/* Partial Amount */}
                <div 
                  onClick={() => setStrategy('partial')}
                  className={`relative p-6 md:p-10 rounded-[32px] bg-[#f3f4f1] cursor-pointer border-2 transition-all ${
                    strategy === 'partial' ? 'border-[#1abc60]' : 'border-transparent'
                  }`}
                >
                  <div className="absolute -top-3 right-8 md:right-10 px-4 py-1.5 bg-[#0081c9] text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                    Popular Choice
                  </div>
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white flex items-center justify-center text-[#1abc60] shadow-sm">
                      <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-2 flex items-center justify-center ${strategy === 'partial' ? 'border-[#1abc60]' : 'border-gray-300'}`}>
                      {strategy === 'partial' && <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-[#1abc60]" />}
                    </div>
                  </div>
                  <h3 className="text-base md:text-[18px] font-black text-gray-900 mb-1">Pay 25% Now</h3>
                  <p className="text-2xl md:text-[32px] font-black text-[#1abc60] mb-3 leading-none">₹{Math.round(booking.totalAmount * 0.25).toLocaleString()}</p>
                  <p className="text-[10px] md:text-[11px] text-gray-400 font-bold leading-relaxed">Balance ₹{Math.round(booking.totalAmount * 0.75).toLocaleString()} to be paid at the ground desk.</p>
                </div>
              </div>
            </div>

            {/* 2. SPLIT WITH SQUAD */}
            <div className="bg-[#f3f4f1] rounded-[40px] p-6 md:p-10 space-y-8 md:space-y-10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white flex items-center justify-center text-[#1abc60] shadow-sm">
                    <UsersIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xl md:text-[22px] font-black text-gray-900 uppercase tracking-tight">Split with Squad</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span 
                    style={{ color: splitWithSquad ? '#1abc60' : '#9ca3af' }}
                    className="text-[11px] font-black uppercase tracking-widest"
                  >
                    {splitWithSquad ? 'Enabled' : 'Disabled'}
                  </span>
                  <button 
                    onClick={() => setSplitWithSquad(!splitWithSquad)}
                    style={{ backgroundColor: splitWithSquad ? '#1abc60' : '#d1d5db' }}
                    className="w-12 h-6 rounded-full relative transition-all shadow-inner"
                  >
                    <motion.div 
                      animate={{ x: splitWithSquad ? 26 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md border border-gray-100" 
                    />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {splitWithSquad && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col md:flex-row gap-6 items-center"
                  >
                    <div className="flex-1 w-full space-y-3">
                      <label className="text-[10px] md:text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Number of Players</label>
                      <div className="flex items-center gap-3 bg-white rounded-2xl p-2 border border-gray-50">
                        <input 
                          type="number" 
                          value={numPlayers}
                          onChange={(e) => setNumPlayers(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 bg-transparent px-3 py-1.5 text-lg md:text-xl font-black text-gray-900 outline-none"
                        />
                        <div className="px-4 py-1.5 bg-gray-50 rounded-xl text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap">Players</div>
                      </div>
                    </div>
                    <div className="w-full md:w-[240px] lg:w-[280px] bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-center border border-gray-100 shadow-sm">
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 md:mb-2">Each Player Pays</p>
                      <p className="text-2xl md:text-[28px] lg:text-[32px] font-black text-[#1abc60] leading-none">₹{perPlayer.toFixed(2)}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button 
                style={{ backgroundColor: '#1abc60' }}
                className="w-full py-5 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-100/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" strokeWidth={4} />
                Add Participant Manually
              </button>
            </div>

            {/* 3. CHOOSE PAYMENT METHOD */}
            <div className="space-y-6">
              <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-900">Choose Payment Method</h2>
              <div className="space-y-4">
                {[
                  { id: 'upi', name: 'UPI Payment', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
                  { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                  { id: 'netbanking', name: 'Net Banking', icon: Landmark, desc: '' }
                ].map((method) => (
                  <div 
                    key={method.id}
                    style={{ backgroundColor: '#f3f4f1' }}
                    className={`rounded-[24px] border-2 transition-all overflow-hidden ${
                      paymentMethod === method.id ? 'border-[#1abc60]' : 'border-transparent'
                    }`}
                  >
                    <button
                      onClick={() => setPaymentMethod(method.id)}
                      className="w-full flex items-center gap-4 md:gap-5 p-4 md:p-6"
                    >
                      <div 
                        style={{ backgroundColor: '#ffffff' }}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-sm"
                      >
                        <method.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#1abc60' }} />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-sm md:text-[17px] font-black text-gray-900 uppercase tracking-tight">{method.name}</h4>
                        {method.desc && <p className="text-[9px] md:text-[11px] text-gray-400 font-bold">{method.desc}</p>}
                      </div>
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        paymentMethod === method.id ? 'border-[#1abc60]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === method.id && (
                          <div 
                            style={{ backgroundColor: '#1abc60' }}
                            className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" 
                          />
                        )}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {method.id === 'card' && paymentMethod === 'card' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 md:px-6 pb-6 space-y-4"
                        >
                          <input 
                            type="text" 
                            placeholder="Card Number" 
                            style={{ backgroundColor: '#ffffff' }}
                            className="w-full p-3 md:p-4 rounded-xl text-sm outline-none border border-transparent focus:border-gray-100 shadow-sm" 
                          />
                          <div className="flex gap-3">
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              style={{ backgroundColor: '#ffffff' }}
                              className="flex-1 p-3 md:p-4 rounded-xl text-sm outline-none border border-transparent focus:border-gray-100 shadow-sm" 
                            />
                            <input 
                              type="text" 
                              placeholder="CVV" 
                              style={{ backgroundColor: '#ffffff' }}
                              className="flex-1 p-3 md:p-4 rounded-xl text-sm outline-none border border-transparent focus:border-gray-100 shadow-sm" 
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* --- IMPORTANT INFO --- */}
            <div className="bg-[#fef2f2] rounded-[32px] p-6 md:p-8 border border-[#fee2e2] flex gap-4">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center text-red-500 shrink-0 shadow-sm">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] md:text-[11px] font-black text-red-600 uppercase tracking-widest">Important Information</h4>
                <p className="text-[10px] md:text-[11px] text-gray-500 font-bold leading-relaxed">
                  Booking will be cancelled if remaining amount is not paid before match time. Please ensure the squad arrives 15 minutes early.
                </p>
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDEBAR SUMMARY --- */}
          <div className="w-full lg:w-[400px] lg:shrink-0 lg:sticky lg:top-24">
            <div className="bg-[#f6f7f5] rounded-[48px] overflow-hidden border border-transparent flex flex-col">
              <div className="p-8 md:p-10 lg:p-12 space-y-10">
                
                {/* Info Items */}
                <div className="space-y-8 md:space-y-10">
                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white flex items-center justify-center text-[#1abc60] shrink-0 shadow-sm border border-gray-50">
                      <Settings className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Sport</p>
                      <h4 className="text-sm md:text-[15px] font-black text-gray-900">{booking.sport} ({booking.courts[0]})</h4>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white flex items-center justify-center text-[#1abc60] shrink-0 shadow-sm border border-gray-50">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Date</p>
                      <h4 className="text-sm md:text-[15px] font-black text-gray-900">{booking.date}</h4>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-white flex items-center justify-center text-[#1abc60] shrink-0 shadow-sm border border-gray-50">
                      <Clock className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Time Slot</p>
                      <h4 className="text-sm md:text-[15px] font-black text-gray-900 uppercase">
                        {booking.startTime} - {booking.endTime} ({calculateDuration(booking.startTime, booking.endTime)})
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Bill Details */}
                <div className="space-y-4 pt-10 border-t border-gray-200/50">
                  <div className="flex justify-between text-[11px] md:text-[13px] font-bold text-gray-400 tracking-tight">
                    <span>Venue Charges</span>
                    <span className="text-gray-900">₹{booking.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] md:text-[13px] font-bold text-gray-400 tracking-tight">
                    <span>Convenience Fee</span>
                    <span className="text-gray-900">₹{booking.convenienceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-6">
                    <span className="text-[13px] md:text-[14px] font-bold text-gray-400 tracking-tight">Payable Today</span>
                    <span className="text-lg md:text-[22px] font-black text-gray-900">₹{payableToday.toFixed(2)}</span>
                  </div>
                </div>

                {/* Balance Due Section */}
                <div className="pt-10 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <span className="text-[16px] md:text-[18px] font-black text-[#1abc60] uppercase tracking-widest">Balance Due</span>
                  <span className="text-2xl md:text-[32px] font-black text-[#1abc60]">₹{balanceDue.toFixed(0)}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePayment}
                disabled={processing}
                style={{ backgroundColor: '#1abc60' }}
                className="w-full py-7 md:py-8 text-white font-black text-base md:text-[18px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95 shadow-lg shadow-green-100/50"
              >
                {processing ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <>
                    Confirm & Pay ₹{payableToday.toFixed(0)}
                    <ChevronRight className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />
                  </>
                )}
              </button>
            </div>

            {/* Warning Box */}
            <div className="mt-6 bg-[#f6f7f5] rounded-[32px] p-6 flex gap-4 border border-transparent">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-red-500 shrink-0 shadow-sm border border-gray-50">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-[11px] text-gray-600 font-bold leading-relaxed">
                Booking will be cancelled if remaining amount is not paid before match time. Please ensure the squad arrives 15 minutes early.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
