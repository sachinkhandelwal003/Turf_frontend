"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Wallet, Landmark, 
  Smartphone, ChevronRight, Loader2, Info,
  Users as UsersIcon, CheckCircle2, AlertCircle,
  Calendar, Clock, Settings, Ticket, Award, Coins
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
    rates?: Array<{ day: string, price: number, isPeak: boolean }>;
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
  const [showCoinPopup, setShowCoinPopup] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  
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

  const calculateAutoPrice = () => {
    if (!booking) return 0;
    
    // Get the correct rate based on the date
    const dayName = new Date(booking.date).toLocaleDateString("en-US", { weekday: "long" });
    const dayRate = booking.turf?.rates?.find((r: any) => r.day === dayName)?.price;
    const basePrice = Number((dayRate && dayRate > 0) ? dayRate : (booking.turf?.pricePerHour || 1000));
    const numCourts = booking.courts?.length || 1;
    
    if (booking.isMultiple && booking.slots) {
      const totalHours = booking.slots.reduce((sum, slot) => {
        const [s, e] = slot.split(' - ');
        return sum + getDurationInHours(s, e);
      }, 0);
      return Math.max(basePrice, totalHours * basePrice) * numCourts;
    }
    
    const duration = getDurationInHours(booking.startTime, booking.endTime);
    return Math.max(1, duration) * basePrice * numCourts;
  };

  const venuePrice = booking?.price || calculateAutoPrice();
  const convenienceFee = booking?.convenienceFee || (venuePrice > 0 ? 25 : 0); 

  const discountAmount = useCoins ? appliedCoins * coinValue : 0;
  const payableToday = strategy === 'partial' 
    ? Math.round(venuePrice * 0.25) + convenienceFee - discountAmount 
    : venuePrice + convenienceFee - discountAmount;

  const balanceDue = strategy === 'partial' 
    ? venuePrice - Math.round(venuePrice * 0.25) 
    : 0;

  const handlePayment = async () => {
    if (razorpaySettings.enabled && razorpaySettings.keyId && razorpayLoaded && window.Razorpay) {
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
          theme: { color: '#1abc60' },
          handler: async (response: any) => {
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

              if (res.data.success) {
                toast.success('Payment Successful!');
                await refreshUser();
                
                try {
                  const bookingsRes = await api.get('/bookings/my');
                  if (bookingsRes.data.success) {
                    const bookingCount = bookingsRes.data.bookings.length;
                    if (bookingCount === 1) {
                      setRewardAmount(100);
                      setShowCoinPopup(true);
                    } else if (bookingCount === 2) {
                      setRewardAmount(50);
                      setShowCoinPopup(true);
                    }
                  }
                } catch (e) {
                  console.error('Reward error');
                }

                if (!showCoinPopup) {
                  router.push(`/payment-success/${id}`);
                }
              } else {
                toast.error(res.data.msg || 'Payment verification failed');
                setProcessing(false);
              }
            } catch (error: any) {
              toast.error('Payment successful! Booking pending verification.');
              await refreshUser();
              router.push(`/payment-success/${id}`);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        
        razorpay.on('payment.failed', (response: any) => {
          toast.error('Payment failed. Please try again.');
          setProcessing(false);
        });
        
      } catch (error) {
        toast.error('Razorpay failed. Trying backup payment...');
        await handleFallbackPayment();
      }
    } else {
      await handleFallbackPayment();
    }
  };

  const handleFallbackPayment = async () => {
    setProcessing(true);
    try {
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
        
        try {
          const bookingsRes = await api.get('/bookings/my');
          if (bookingsRes.data.success) {
            const bookingCount = bookingsRes.data.bookings.length;
            if (bookingCount === 1) {
              setRewardAmount(100);
              setShowCoinPopup(true);
            } else if (bookingCount === 2) {
              setRewardAmount(50);
              setShowCoinPopup(true);
            }
          }
        } catch (e) {
          console.error('Reward logic error');
        }

        if (!showCoinPopup) {
          router.push(`/payment-success/${id}`);
        }
      } else {
        toast.error(res.data.msg || 'Payment failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="!min-h-screen !flex !items-center !justify-center !bg-[#f8fafc]">
        <Loader2 className="!w-10 !h-10 !animate-spin !text-[#1abc60]" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="!min-h-screen !bg-[#f8fafc] !pt-28 !pb-20 !font-sans !text-gray-900 !overflow-x-hidden">
      <div className="!max-w-6xl !mx-auto !px-4 sm:!px-6 lg:!px-8">
        
        {/* --- HEADER --- */}
        <div className="!mb-8 md:!mb-10">
          <button 
            onClick={() => router.push('/bookings')}
            className="!flex !items-center !gap-1.5 !text-sm !font-bold !text-gray-500 hover:!text-gray-900 !mb-4 !transition-colors !bg-transparent !border-none !cursor-pointer !p-0"
          >
            <ChevronRight className="!w-4 !h-4 !rotate-180" />
            Back to Bookings
          </button>
          <h1 className="!text-3xl md:!text-4xl !font-bold !tracking-tight !text-gray-900 !mb-2 !m-0">
            Secure Checkout
          </h1>
          <p className="!text-gray-500 !text-sm md:!text-base !font-medium !m-0">Complete your booking for <span className="!font-bold !text-gray-800">{booking.turf.name}</span></p>
        </div>

        <div className="!flex !flex-col lg:!flex-row !gap-8 !items-start">
          
          {/* --- LEFT CONTENT: FORM SECTIONS --- */}
          <div className="!flex-1 !space-y-6 !w-full">
            
            {/* 1. PAYMENT STRATEGY */}
            <div className="!bg-white !p-6 md:!p-8 !rounded-[24px] !border !border-gray-200 !shadow-sm !space-y-6">
              <h2 className="!text-sm !font-bold !uppercase !tracking-wider !text-gray-500 !m-0">Payment Plan</h2>
              <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                
                {/* Partial Pay Option */}
                <div 
                  onClick={() => setStrategy('partial')}
                  className={`!rounded-[16px] !border-2 !p-6 !cursor-pointer !transition-all !relative !overflow-hidden ${
                    strategy === 'partial' ? '!border-[#1abc60] !bg-[#1abc60]/5' : '!border-gray-200 !bg-white hover:!border-gray-300'
                  }`}
                >
                  {strategy === 'partial' && (
                    <div className="!absolute !top-0 !right-0 !bg-[#1abc60] !text-white !text-[10px] !font-bold !uppercase !tracking-wider !px-3 !py-1 !rounded-bl-[12px]">
                      Recommended
                    </div>
                  )}
                  <div className="!flex !justify-between !items-start !mb-4">
                    <div className="!w-10 !h-10 !rounded-full !bg-white !border !border-gray-200 !flex !items-center !justify-center !text-gray-600 !shadow-sm">
                      <Wallet className="!w-5 !h-5" />
                    </div>
                    <div className={`!w-5 !h-5 !rounded-full !border-2 !flex !items-center !justify-center ${strategy === 'partial' ? '!border-[#1abc60]' : '!border-gray-300'}`}>
                      {strategy === 'partial' && <div className="!w-2.5 !h-2.5 !rounded-full !bg-[#1abc60]" />}
                    </div>
                  </div>
                  <h3 className="!text-base !font-bold !text-gray-900 !mb-1 !m-0">Pay 25% Advance</h3>
                  <p className="!text-2xl !font-bold !text-gray-900 !mb-2 !m-0">₹{Math.round(venuePrice * 0.25).toLocaleString()}</p>
                  <p className="!text-xs !text-gray-500 !font-medium !m-0">Balance <span className="!font-bold text-gray-700">₹{Math.round(venuePrice * 0.75).toLocaleString()}</span> due at ground.</p>
                </div>

                {/* Full Pay Option */}
                <div 
                  onClick={() => setStrategy('full')}
                  className={`!rounded-[16px] !border-2 !p-6 !cursor-pointer !transition-all ${
                    strategy === 'full' ? '!border-[#1abc60] !bg-[#1abc60]/5' : '!border-gray-200 !bg-white hover:!border-gray-300'
                  }`}
                >
                  <div className="!flex !justify-between !items-start !mb-4">
                    <div className="!w-10 !h-10 !rounded-full !bg-white !border !border-gray-200 !flex !items-center !justify-center !text-gray-600 !shadow-sm">
                      <CheckCircle2 className="!w-5 !h-5" />
                    </div>
                    <div className={`!w-5 !h-5 !rounded-full !border-2 !flex !items-center !justify-center ${strategy === 'full' ? '!border-[#1abc60]' : '!border-gray-300'}`}>
                      {strategy === 'full' && <div className="!w-2.5 !h-2.5 !rounded-full !bg-[#1abc60]" />}
                    </div>
                  </div>
                  <h3 className="!text-base !font-bold !text-gray-900 !mb-1 !m-0">Pay Full Amount</h3>
                  <p className="!text-2xl !font-bold !text-gray-900 !mb-2 !m-0">₹{(venuePrice + convenienceFee).toLocaleString()}</p>
                  <p className="!text-xs !text-gray-500 !font-medium !m-0">Complete payment online. No dues at venue.</p>
                </div>

              </div>
            </div>

            {/* COIN COUPON SECTION */}
            <div className="!bg-white !p-6 md:!p-8 !rounded-[24px] !border !border-gray-200 !shadow-sm !space-y-5">
              <div className="!flex !items-center !justify-between">
                <h2 className="!text-sm !font-bold !uppercase !tracking-wider !text-gray-500 !m-0">Apply Rewards</h2>
                <div className="!flex !items-center !gap-1.5 !px-3 !py-1 !bg-amber-50 !rounded-full !border !border-amber-200">
                  <Coins className="!w-3.5 !h-3.5 !text-amber-600" />
                  <span className="!text-xs !font-bold !text-amber-700">{user?.coins || 0} Available</span>
                </div>
              </div>

              {user?.coins && user.coins > 0 ? (
                <div className={`!p-5 !rounded-xl !border-2 !transition-all ${useCoins ? '!border-amber-400 !bg-amber-50/50' : '!border-gray-200 !bg-gray-50/50'}`}>
                  <div className="!flex !items-center !justify-between !gap-4">
                    <div>
                      <h3 className="!text-sm !font-bold !text-gray-900 !m-0">Redeem GameOn Coins</h3>
                      <p className="!text-xs !text-gray-500 !font-medium !mt-1 !m-0">Use your earned coins for an instant discount.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!useCoins) {
                          const maxCoinsNeeded = Math.ceil((venuePrice + convenienceFee) / coinValue);
                          setAppliedCoins(Math.min(user?.coins || 0, maxCoinsNeeded));
                        } else {
                          setAppliedCoins(0);
                        }
                        setUseCoins(!useCoins);
                      }}
                      className={`!px-5 !py-2 !rounded-lg !text-xs !font-bold !transition-all !border-none !cursor-pointer !shrink-0 ${
                        useCoins 
                          ? '!bg-amber-500 !text-white !shadow-md' 
                          : '!bg-white !text-gray-700 !border !border-gray-300 hover:!bg-gray-50'
                      }`}
                    >
                      {useCoins ? 'Applied' : 'Apply Now'}
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {useCoins && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="!flex !flex-col !gap-2 !pt-4 !mt-4 !border-t !border-amber-200/60"
                      >
                        <div className="!flex !items-center !justify-between">
                          <span className="!text-xs !font-bold !text-amber-800">Coins Redeemed:</span>
                          <span className="!text-sm !font-bold !text-amber-700">{appliedCoins} Coins</span>
                        </div>
                        <div className="!flex !items-center !justify-between">
                          <span className="!text-xs !font-bold !text-amber-800">Discount Applied:</span>
                          <span className="!text-sm !font-bold !text-amber-600">- ₹{discountAmount.toFixed(2)}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="!p-4 !rounded-xl !bg-gray-50 !border !border-gray-200 !flex !items-center !gap-3">
                  <Ticket className="!w-5 !h-5 !text-gray-400" />
                  <p className="!text-xs !font-medium !text-gray-500 !m-0">You don't have any coins to redeem yet. Book more to earn!</p>
                </div>
              )}
            </div>

            {/* 2. SPLIT WITH SQUAD */}
            <div className="!bg-white !p-6 md:!p-8 !rounded-[24px] !border !border-gray-200 !shadow-sm !space-y-6">
              <div className="!flex !items-center !justify-between">
                <div className="!flex !items-center !gap-3">
                  <div className="!w-10 !h-10 !rounded-xl !bg-emerald-50 !flex !items-center !justify-center !text-[#1abc60]">
                    <UsersIcon className="!w-5 !h-5" />
                  </div>
                  <h2 className="!text-sm !font-bold !uppercase !tracking-wider !text-gray-900 !m-0">Split with Squad</h2>
                </div>
                
                {/* Fixed, Bulletproof Toggle Switch */}
                <div className="!flex !items-center !gap-3">
                  <span className={`!text-xs !font-bold !uppercase !tracking-wider ${splitWithSquad ? '!text-[#1abc60]' : '!text-gray-400'}`}>
                    {splitWithSquad ? 'Enabled' : 'Disabled'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setSplitWithSquad(!splitWithSquad)}
                    className={`!relative !flex !items-center !h-7 !w-14 !rounded-full !px-1 !transition-colors !duration-300 !cursor-pointer !border-none ${
                      splitWithSquad ? '!bg-[#1abc60]' : '!bg-gray-300'
                    }`}
                  >
                    <span 
                      className="!block !h-5 !w-5 !rounded-full !bg-white !shadow-md !transition-transform !duration-300"
                      style={{ transform: splitWithSquad ? 'translateX(28px)' : 'translateX(0px)' }}
                    />
                  </button>
                </div>
              </div>

              {splitWithSquad && (
                <div className="!space-y-5 !pt-2">
                  <div className="!flex !items-center !justify-between !p-5 !bg-emerald-50/50 !rounded-2xl !border !border-emerald-100">
                    <div>
                      <h3 className="!text-sm !font-bold !text-gray-900 !m-0">Total per Player</h3>
                      <p className="!text-xs !font-medium !text-gray-500 !mt-1 !m-0">Based on {numPlayers} players sharing the cost</p>
                    </div>
                    <div className="!text-3xl !font-black !text-[#1abc60]">
                      ₹{Math.round(payableToday / numPlayers).toLocaleString()}
                    </div>
                  </div>

                  {/* Explicit Text-based Plus/Minus Control */}
                  <div className="!flex !items-center !justify-between !bg-white !p-4 !rounded-xl !border !border-gray-200 !shadow-sm">
                    <label className="!text-sm !font-bold !text-gray-900 !m-0">Number of Players</label>
                    <div className="!flex !items-center !gap-4 !bg-gray-50 !p-1.5 !rounded-lg !border !border-gray-200">
                      
                      <button 
                        type="button"
                        onClick={() => setNumPlayers(Math.max(2, numPlayers - 1))}
                        className="!w-9 !h-9 !rounded-md !bg-white hover:!bg-gray-100 !flex !items-center !justify-center !transition-all !border !border-gray-200 !cursor-pointer !shadow-sm active:!scale-95 !shrink-0"
                      >
                        <span className="!text-xl !font-bold !block !leading-none !m-0 !p-0 !text-gray-900" style={{ color: '#111827' }}>−</span>
                      </button>
                      
                      <span className="!w-6 !text-center !text-base !font-black !text-gray-900 !shrink-0 !m-0">
                        {numPlayers}
                      </span>
                      
                      <button 
                        type="button"
                        onClick={() => setNumPlayers(Math.min(12, numPlayers + 1))}
                        className="!w-9 !h-9 !rounded-md !bg-white hover:!bg-gray-100 !flex !items-center !justify-center !transition-all !border !border-gray-200 !cursor-pointer !shadow-sm active:!scale-95 !shrink-0"
                      >
                        <span className="!text-xl !font-bold !block !leading-none !m-0 !p-0 !text-gray-900" style={{ color: '#111827' }}>+</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. PAYMENT METHOD */}
            <div className="!bg-white !p-6 md:!p-8 !rounded-[24px] !border !border-gray-200 !shadow-sm !space-y-6">
              <h2 className="!text-sm !font-bold !uppercase !tracking-wider !text-gray-500 !m-0">Select Payment Method</h2>
              <div className="!space-y-3">
                {[
                  { id: 'upi', name: 'UPI Payment', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
                  { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                  { id: 'netbanking', name: 'Net Banking', icon: Landmark, desc: 'All major Indian banks' },
                  { id: 'wallet', name: 'Digital Wallets', icon: Wallet, desc: 'Amazon Pay, Mobikwik' }
                ].map((method) => (
                  <div 
                    key={method.id}
                    className={`!rounded-xl !border !transition-all !overflow-hidden !bg-white ${
                      paymentMethod === method.id ? '!border-[#1abc60] !ring-1 !ring-[#1abc60]' : '!border-gray-200 hover:!border-gray-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className="!w-full !flex !items-center !gap-4 !p-4 !bg-transparent !border-none !cursor-pointer"
                    >
                      <div className="!w-10 !h-10 !rounded-lg !bg-gray-50 !flex !items-center !justify-center !border !border-gray-200 !shrink-0">
                        <method.icon className="!w-5 !h-5 !text-gray-600" />
                      </div>
                      <div className="!flex-1 !text-left">
                        <h4 className="!text-sm !font-bold !text-gray-900 !m-0">{method.name}</h4>
                        {method.desc && <p className="!text-xs !font-medium !text-gray-500 !mt-0.5 !m-0">{method.desc}</p>}
                      </div>
                      <div className={`!w-5 !h-5 !rounded-full !border-2 !flex !items-center !justify-center !transition-all !shrink-0 ${
                        paymentMethod === method.id ? '!border-[#1abc60]' : '!border-gray-300'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="!w-2.5 !h-2.5 !rounded-full !bg-[#1abc60]" />
                        )}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {method.id === 'card' && paymentMethod === 'card' && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="!px-4 !pb-4 !space-y-3 !overflow-hidden !bg-gray-50/50 !pt-2 !border-t !border-gray-100"
                        >
                          <input 
                            type="text" 
                            placeholder="Card Number" 
                            className="!w-full !px-4 !py-3 !bg-white !border !border-gray-300 !rounded-xl !text-sm !font-medium !outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !shadow-sm !transition-all" 
                          />
                          <div className="!flex !gap-3">
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              className="!flex-1 !px-4 !py-3 !bg-white !border !border-gray-300 !rounded-xl !text-sm !font-medium !outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !shadow-sm !transition-all" 
                            />
                            <input 
                              type="text" 
                              placeholder="CVV" 
                              className="!flex-1 !px-4 !py-3 !bg-white !border !border-gray-300 !rounded-xl !text-sm !font-medium !outline-none focus:!border-[#1abc60] focus:!ring-1 focus:!ring-[#1abc60] !shadow-sm !transition-all" 
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
          <div className="!w-full lg:!w-[400px] !shrink-0 lg:!sticky lg:!top-24 !space-y-6">
            
            {/* Invoice / Summary Card */}
            <div className="!bg-white !rounded-[24px] !border !border-gray-200 !shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] !overflow-hidden !flex !flex-col">
              
              <div className="!p-6 md:!p-8 !space-y-6">
                <h3 className="!text-lg !font-bold !text-gray-900 !border-b !border-gray-100 !pb-4 !m-0">Order Summary</h3>
                
                {/* Info Items */}
                <div className="!space-y-5">
                  <div className="!flex !items-start !gap-4">
                    <div className="!w-10 !h-10 !rounded-xl !bg-gray-50 !flex !items-center !justify-center !text-gray-500 !shrink-0 !border !border-gray-200">
                      <Settings className="!w-4 !h-4" />
                    </div>
                    <div>
                      <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-widest !mb-1 !m-0">Sport & Court</p>
                      <h4 className="!text-sm !font-bold !text-gray-900 !m-0">
                        {booking.sport} <span className="!text-gray-500 !font-medium">({booking.courts.join(', ')})</span>
                      </h4>
                    </div>
                  </div>

                  <div className="!flex !items-start !gap-4">
                    <div className="!w-10 !h-10 !rounded-xl !bg-gray-50 !flex !items-center !justify-center !text-gray-500 !shrink-0 !border !border-gray-200">
                      <Calendar className="!w-4 !h-4" />
                    </div>
                    <div>
                      <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-widest !mb-1 !m-0">Date</p>
                      <h4 className="!text-sm !font-bold !text-gray-900 !m-0">{booking.date}</h4>
                    </div>
                  </div>

                  <div className="!flex !items-start !gap-4">
                    <div className="!w-10 !h-10 !rounded-xl !bg-gray-50 !flex !items-center !justify-center !text-gray-500 !shrink-0 !border !border-gray-200">
                      <Clock className="!w-4 !h-4" />
                    </div>
                    <div>
                      <p className="!text-[10px] !font-bold !text-gray-400 !uppercase !tracking-widest !mb-1 !m-0">
                        Time Slot{booking.isMultiple ? 's' : ''}
                      </p>
                      <div className="!space-y-1">
                        {booking.isMultiple && booking.slots ? (
                          booking.slots.map((slot, i) => (
                            <h4 key={i} className="!text-sm !font-bold !text-gray-900 !m-0">
                              {slot}
                            </h4>
                          ))
                        ) : (
                          <h4 className="!text-sm !font-bold !text-gray-900 !m-0">
                            {booking.startTime} - {booking.endTime} <span className="!text-gray-500 !font-medium">({calculateDuration(booking.startTime, booking.endTime)})</span>
                          </h4>
                        )}
                        {booking.isMultiple && (
                          <p className="!text-[11px] !font-bold !text-[#1abc60] !mt-1.5 !m-0">
                            Total Duration: {calculateDuration(booking.startTime, booking.endTime)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill Details */}
                <div className="!space-y-3.5 !pt-6 !border-t !border-gray-100">
                  <div className="!flex !justify-between !text-sm !font-medium !text-gray-500">
                    <span>
                      Venue Charges 
                      {booking.isMultiple && <span className="!text-xs"> ({booking.bookingCount} slots × {booking.courts.length} courts)</span>}
                      {!booking.isMultiple && booking.courts.length > 1 && <span className="!text-xs"> ({booking.courts.length} courts)</span>}
                    </span>
                    <span className="!text-gray-900 !font-bold">₹{booking.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="!flex !justify-between !text-sm !font-medium !text-gray-500">
                    <span>Convenience Fee</span>
                    <span className="!text-gray-900 !font-bold">₹{booking.convenienceFee.toFixed(2)}</span>
                  </div>
                  
                  {useCoins && (
                    <div className="!flex !justify-between !text-sm !font-bold !text-amber-600">
                      <span className="!flex !items-center !gap-1.5">
                        <Award className="!w-4 !h-4" /> Coin Discount
                      </span>
                      <span>- ₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="!flex !justify-between !items-center !pt-5 !pb-2 !border-b !border-dashed !border-gray-300">
                    <span className="!text-sm !font-bold !text-gray-900">Payable Today</span>
                    <span className="!text-2xl !font-bold !text-gray-900">₹{payableToday.toFixed(0)}</span>
                  </div>
                </div>

                {/* Balance Due Section */}
                {strategy === 'partial' && (
                  <div className="!flex !justify-between !items-center !bg-emerald-50 !p-4 !rounded-xl !border !border-emerald-100">
                    <span className="!text-xs !font-bold !text-[#1abc60] !uppercase !tracking-wider">Balance Due at Venue</span>
                    <span className="!text-lg !font-bold !text-[#1abc60]">₹{balanceDue.toFixed(0)}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="!p-6 !bg-gray-50 !border-t !border-gray-200">
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={processing}
                  className="!w-full !py-4 !bg-[#1abc60] hover:!bg-[#17a554] !text-white !font-bold !text-sm !uppercase !tracking-widest !rounded-xl !transition-all !flex !items-center !justify-center !gap-2 disabled:!opacity-70 !shadow-lg !shadow-green-100 !border-none !cursor-pointer"
                >
                  {processing ? (
                    <Loader2 className="!w-5 !h-5 !animate-spin" />
                  ) : (
                    <>
                      Confirm & Pay ₹{payableToday.toFixed(0)}
                      <ChevronRight className="!w-4 !h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Warning Box */}
            <div className="!bg-red-50 !rounded-2xl !p-5 !flex !gap-4 !border !border-red-100">
              <div className="!w-10 !h-10 !rounded-full !bg-white !flex !items-center !justify-center !text-red-500 !shrink-0 !shadow-sm !border !border-red-100">
                <AlertCircle className="!w-5 !h-5" />
              </div>
              <p className="!text-xs !text-red-800 !font-medium !leading-relaxed !pt-1 !m-0">
                Booking will be cancelled if the remaining amount is not paid before match time. Please ensure your squad arrives <span className="!font-bold">15 minutes early</span>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}