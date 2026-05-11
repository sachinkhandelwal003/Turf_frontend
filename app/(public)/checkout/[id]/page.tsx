"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Wallet, Landmark, 
  Smartphone, ChevronRight, Loader2, Info,
  Users as UsersIcon, CheckCircle2, AlertCircle,
  Calendar, Clock, Settings, Plus, Ticket, Award, Coins
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Payment States
  const [strategy, setStrategy] = useState<'full' | 'partial'>('partial');
  const [splitWithSquad, setSplitWithSquad] = useState(true);
  const [numPlayers, setNumPlayers] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  // Razorpay State
  const [razorpaySettings, setRazorpaySettings] = useState<{
    enabled: boolean;
    keyId: string;
  }>({ enabled: false, keyId: '' });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  // Coins State
  const [useCoins, setUseCoins] = useState(false);
  const [appliedCoins, setAppliedCoins] = useState(0);
  const [coinValue, setCoinValue] = useState(1);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  useEffect(() => {
    const loadLocalSettings = () => {
      const localSettings = localStorage.getItem('adminSettings');
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          console.log('✅ GROUND: LOCALSTORAGE LOAD:', parsed);
          if (parsed.razorpay) {
            setRazorpaySettings({
              enabled: !!parsed.razorpay.enabled,
              keyId: parsed.razorpay.keyId || ''
            });
            setCoinValue(parsed.coinValue || 1);
          }
        } catch (e) {
          console.error('GROUND: Local parse error');
        }
      }
    };

    loadLocalSettings();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error('Please login to access checkout');
        router.push(`/login?redirect=/checkout/${id}`);
      } else {
        fetchBooking();
      }
    }
  }, [id, isAuthenticated, authLoading]);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      console.log('GROUND: Settings API response:', res.data);
      if (res.data && res.data.settings) {
        const apiSettings = res.data.settings;
        const apiRazorpay = apiSettings.razorpay || {};
        setCoinValue(apiSettings.coinValue || 1);
        setRazorpaySettings(prev => ({
          enabled: !!apiRazorpay.enabled || prev.enabled,
          keyId: apiRazorpay.keyId || prev.keyId
        }));
      }
    } catch (error) {
      console.error('GROUND: API fetch failed, using localStorage only');
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
      toast.error('Booking not found');
      router.push('/ground');
    } finally {
      setLoading(false);
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

  const discountAmount = useCoins ? appliedCoins * coinValue : 0;
  const payableToday = strategy === 'partial' 
    ? Math.round((booking?.totalAmount || 0) * 0.25) - discountAmount 
    : (booking?.totalAmount || 0) + (booking?.convenienceFee || 0) - discountAmount;
  const balanceDue = strategy === 'partial' 
    ? Math.round((booking?.totalAmount || 0) * 0.75) 
    : 0;

  const handlePayment = async () => {
    console.log('=== GROUND CHECKOUT PAYMENT START ===');
    console.log('1. Razorpay settings:', razorpaySettings);
    console.log('2. Key ID:', razorpaySettings.keyId);
    console.log('3. Enabled:', razorpaySettings.enabled);
    console.log('4. Razorpay loaded:', razorpayLoaded);
    console.log('5. Window.Razorpay:', !!window.Razorpay);
    console.log('6. Split enabled:', splitWithSquad);
    console.log('7. Players:', numPlayers);
    console.log('8. Amount:', payableToday);

    if (razorpaySettings.enabled && razorpaySettings.keyId && razorpayLoaded && window.Razorpay) {
      console.log('✅ Opening Razorpay Checkout NOW!');
      setProcessing(true);
      
      try {
        const options = {
          key: razorpaySettings.keyId,
          amount: Math.round(Math.max(payableToday, 1) * 100),
          currency: 'INR',
          name: booking?.turf?.name || 'Turf Booking',
          description: `${booking?.sport} Booking${splitWithSquad ? ` (Split ${numPlayers} ways)` : ''}`,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          theme: {
            color: '#1abc60'
          },
          handler: async (response: any) => {
            console.log('✅ Razorpay Success Response:', response);
            try {
              const res = await api.post(`/bookings/${id}/pay`, {
                paymentMethod,
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                usedCoins: useCoins ? appliedCoins : 0,
                splitWithSquad: splitWithSquad,
                numPlayers: splitWithSquad ? numPlayers : undefined
              });

              console.log('Booking API Response:', res.data);

              if (res.data.success) {
                toast.success('✅ Payment Successful!');
                await refreshUser();
                router.push(`/payment-success/${id}`);
              } else {
                toast.error(res.data.msg || 'Payment verification failed');
                setProcessing(false);
              }
            } catch (error: any) {
              console.error('API Error:', error);
              toast.error('Payment successful! Booking pending verification.');
              await refreshUser();
              router.push(`/payment-success/${id}`);
            }
          }
        };

        console.log('Razorpay Options:', options);
        const razorpay = new window.Razorpay(options);
        razorpay.open();
        
        razorpay.on('payment.failed', (response: any) => {
          console.error('❌ Payment failed:', response);
          toast.error('Payment failed. Please try again.');
          setProcessing(false);
        });
        
      } catch (error) {
        console.error('❌ Razorpay init error:', error);
        toast.error('Razorpay failed. Trying backup payment...');
        await handleFallbackPayment();
      }
    } else {
      console.log('⚠️ Using fallback payment method');
      await handleFallbackPayment();
    }
  };

  const handleFallbackPayment = async () => {
    setProcessing(true);
    try {
      console.log('Fallback payment processing...');
      const res = await api.post(`/bookings/${id}/pay`, {
        paymentMethod,
        paymentId: `PAY-${Date.now()}`,
        usedCoins: useCoins ? appliedCoins : 0,
        splitWithSquad,
        numPlayers: splitWithSquad ? numPlayers : undefined
      });

      if (res.data.success) {
        toast.success('Payment Successful!');
        await refreshUser();
        router.push(`/payment-success/${id}`);
      } else {
        toast.error(res.data.msg || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Fallback error:', error);
      toast.error(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 font-sans text-gray-900 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => router.push('/bookings')}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Bookings
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
            Secure Checkout
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium">Complete your booking for <span className="font-semibold text-gray-700">{booking.turf.name}</span></p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* --- LEFT CONTENT: FORM SECTIONS --- */}
          <div className="flex-1 space-y-8 w-full">
            
            {/* 1. PAYMENT STRATEGY */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-3">Payment Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setStrategy('partial')}
                  className={`rounded-xl border-2 p-6 cursor-pointer transition-all relative overflow-hidden ${
                    strategy === 'partial' ? 'border-[#1abc60] bg-green-50/30' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {strategy === 'partial' && (
                    <div className="absolute -top-3 right-4 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Recommended
                    </div>
                  )}
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

                <div 
                  onClick={() => setStrategy('full')}
                  className={`rounded-xl border-2 p-6 cursor-pointer transition-all ${
                    strategy === 'full' ? 'border-[#1abc60] bg-green-50/30' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${strategy === 'full' ? 'border-[#1abc60]' : 'border-gray-300'}`}>
                      {strategy === 'full' && <div className="w-2.5 h-2.5 rounded-full bg-[#1abc60]" />}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Pay Full Amount</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-2">₹{(booking.totalAmount + booking.convenienceFee).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 font-medium">Complete payment online. No dues at venue.</p>
                </div>
              </div>
            </div>

            {/* COIN COUPON SECTION */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-yellow-50 flex items-center justify-center text-yellow-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">Coin Coupon</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-100">
                  <Coins className="w-3.5 h-3.5 text-yellow-600" />
                  <span className="text-xs font-bold text-yellow-700">{user?.coins || 0} Available</span>
                </div>
              </div>

              {user?.coins && user.coins > 0 ? (
                <div className={`p-4 rounded-xl border-2 transition-all ${useCoins ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-100 bg-gray-50/30'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Redeem Your Coins</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Use your earned coins for an instant discount.</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!useCoins) {
                          const maxCoinsNeeded = Math.ceil((booking.totalAmount + booking.convenienceFee) / coinValue);
                          setAppliedCoins(Math.min(user?.coins || 0, maxCoinsNeeded));
                        }
                        setUseCoins(!useCoins);
                      }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                        useCoins 
                          ? 'bg-yellow-500 text-white shadow-sm' 
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {useCoins ? 'Applied' : 'Apply Now'}
                    </button>
                  </div>
                  
                  {useCoins && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex flex-col gap-2 pt-3 border-t border-yellow-200/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-yellow-800">Coins Redeemed:</span>
                        <span className="text-sm font-bold text-yellow-700">{appliedCoins} Coins</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-yellow-800">Discount Applied:</span>
                        <span className="text-sm font-black text-yellow-700">- ₹{discountAmount.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500">You don't have any coins to redeem yet. Book more to earn!</p>
                </div>
              )}
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
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${splitWithSquad ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {splitWithSquad && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Total per Player</h3>
                      <p className="text-xs text-gray-500">Based on {numPlayers} players</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{Math.round(payableToday / numPlayers).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700">Number of Players</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setNumPlayers(Math.max(2, numPlayers - 1))}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        <span className="text-xl">-</span>
                      </button>
                      <input 
                        type="number" 
                        min={2} 
                        max={12}
                        value={numPlayers}
                        onChange={(e) => setNumPlayers(Math.max(2, Math.min(12, parseInt(e.target.value) || 4)))}
                        className="w-20 text-center text-lg font-bold text-gray-900 border-none outline-none"
                      />
                      <button 
                        onClick={() => setNumPlayers(Math.min(12, numPlayers + 1))}
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. PAYMENT METHOD */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-3">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'upi', name: 'UPI Payment', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
                  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                  { id: 'netbanking', name: 'Net Banking', icon: Landmark, desc: 'All major Indian banks' },
                  { id: 'wallet', name: 'Digital Wallets', icon: Wallet, desc: 'Amazon Pay, Mobikwik' }
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
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Sport & Court</p>
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
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Date</p>
                      <h4 className="text-sm font-bold text-gray-900">{booking.date}</h4>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 shrink-0 border border-gray-100">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
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
                            {booking.startTime} - {booking.endTime} <span className="text-gray-500 font-medium normal-case">({calculateDuration(booking.startTime, booking.endTime)})</span>
                          </h4>
                        )}
                        {booking.isMultiple && (
                          <p className="text-xs font-semibold text-[#1abc60] mt-1">
                            Total Duration: {calculateDuration(booking.startTime, booking.endTime)}
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
                  {useCoins && (
                    <div className="flex justify-between text-sm font-bold text-yellow-700">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        Coin Discount ({appliedCoins} coins)
                      </span>
                      <span>- ₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
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
