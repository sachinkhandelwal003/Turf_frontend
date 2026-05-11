"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Wallet, Landmark, 
  Smartphone, ChevronRight, Loader2, 
  Users, CheckCircle2, ShieldCheck,
  Trophy, Phone, User
} from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RegistrationData {
  teamName: string;
  captainName: string;
  email: string;
  phone: string;
  altPhone?: string;
  address: string;
  members: { name: string; role: string }[];
  tournamentId: string;
  entryFee: number;
  tournamentTitle: string;
}

export default function TournamentCheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [regData, setRegData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentSettings, setPaymentSettings] = useState<any>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpaySettings, setRazorpaySettings] = useState({
    enabled: false,
    keyId: ''
  });

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
          console.log('✅ Tournament Checkout: LocalStorage Load:', parsed);
          if (parsed.razorpay) {
            setRazorpaySettings({
              enabled: !!parsed.razorpay.enabled,
              keyId: parsed.razorpay.keyId || ''
            });
          }
        } catch (e) {
          console.error('Local parse error');
        }
      }
    };

    loadLocalSettings();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data && (res.data.settings || res.data)) {
        const apiSettings = res.data.settings || res.data;
        const merged = apiSettings.razorpay || {};
        setPaymentSettings(apiSettings);
        setRazorpaySettings(prev => ({
          enabled: !!merged.enabled || prev.enabled,
          keyId: merged.keyId || prev.keyId
        }));
      }
    } catch (err) {
      console.error('Failed to load API settings');
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error("Please login to complete registration");
        router.push(`/login?redirect=/tournament/checkout/${id}`);
        return;
      }

      const storedData = sessionStorage.getItem('pending_registration');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (parsed.tournamentId === id) {
            setRegData(parsed);
          } else {
            router.push(`/tournament/${id}`);
          }
        } catch (e) {
          router.push(`/tournament/${id}`);
        }
      } else {
        router.push(`/tournament/${id}`);
      }
      setLoading(false);
    }
  }, [id, isAuthenticated, authLoading, router]);

  const handlePayment = async () => {
    if (!regData) return;

    const convenienceFee = Math.round(regData.entryFee * 0.02);
    const totalAmount = regData.entryFee + convenienceFee;

    console.log('=== TOURNAMENT CHECKOUT START ===');
    console.log('1. Razorpay settings:', razorpaySettings);
    console.log('2. Key ID:', razorpaySettings.keyId);
    console.log('3. Enabled:', razorpaySettings.enabled);
    console.log('4. Razorpay loaded:', razorpayLoaded);
    console.log('5. Window.Razorpay:', !!window.Razorpay);

    if (razorpaySettings.enabled && razorpaySettings.keyId && window.Razorpay) {
      console.log('✅ Opening Razorpay for Tournament NOW!');
      setProcessing(true);

      try {
        const options = {
          key: razorpaySettings.keyId,
          amount: Math.round(totalAmount * 100),
          currency: 'INR',
          name: regData.tournamentTitle || 'Tournament Registration',
          description: `Entry for ${regData.teamName}`,
          prefill: {
            name: regData.captainName || user?.name || '',
            email: regData.email || user?.email || '',
            contact: regData.phone || user?.phone || ''
          },
          theme: {
            color: '#1abc60'
          },
          handler: async (response: any) => {
            console.log('✅ Tournament Razorpay Success:', response);
            try {
              const res = await api.post(`/tournaments/${id}/register`, {
                teamName: regData.teamName,
                captainName: regData.captainName,
                email: regData.email,
                phone: regData.phone,
                altPhone: regData.altPhone,
                address: regData.address,
                members: regData.members,
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod
              });

              console.log('Tournament API Response:', res.data);

              if (res.data.success) {
                sessionStorage.removeItem('pending_registration');
                toast.success("✅ Registration successful!");
                router.push('/tournament/success');
              } else {
                toast.error(res.data.msg || "Registration failed");
                setProcessing(false);
              }
            } catch (err: any) {
              console.error('API Error:', err);
              toast.error('Payment successful! Registration pending verification.');
              sessionStorage.removeItem('pending_registration');
              router.push('/tournament/success');
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        
        razorpay.on('payment.failed', (response: any) => {
          console.error('❌ Payment failed:', response);
          toast.error('Payment failed. Please try again.');
          setProcessing(false);
        });
        
      } catch (err) {
        console.error('❌ Razorpay init error:', err);
        toast.error('Razorpay failed. Trying backup...');
        await handleTournamentFallback();
      }
    } else {
      console.log('⚠️ Using tournament fallback payment');
      await handleTournamentFallback();
    }
  };

  const handleTournamentFallback = async () => {
    if (!regData) return;
    setProcessing(true);

    try {
      console.log('Tournament fallback payment...');
      const res = await api.post(`/tournaments/${id}/register`, {
        teamName: regData.teamName,
        captainName: regData.captainName,
        email: regData.email,
        phone: regData.phone,
        altPhone: regData.altPhone,
        address: regData.address,
        members: regData.members,
        paymentId: `PAY-${Date.now()}`,
        paymentMethod
      });

      if (res.data.success) {
        sessionStorage.removeItem('pending_registration');
        toast.success("Registration successful!");
        router.push('/tournament/success');
      } else {
        toast.error(res.data.msg || "Registration failed");
      }
    } catch (err: any) {
      console.error('Tournament fallback error:', err);
      toast.error(err.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!regData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Registration
          </h1>
          <p className="text-gray-500">
            {regData.tournamentTitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Team Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">
                Team Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{regData.teamName}</h4>
                    <p className="text-sm text-gray-500">Captain: {regData.captainName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{regData.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-gray-900">{regData.email}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Team Members ({regData.members.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {regData.members.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">
                Payment Method
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'upi', name: 'UPI', icon: Smartphone },
                  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
                  { id: 'netbanking', name: 'Net Banking', icon: Landmark },
                  { id: 'wallet', name: 'Wallets', icon: Wallet },
                ].map((option) => (
                  <div 
                    key={option.id}
                    onClick={() => setPaymentMethod(option.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === option.id 
                        ? 'border-[#1abc60] bg-green-50/30' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      paymentMethod === option.id ? 'bg-[#1abc60] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{option.name}</p>
                    </div>
                    {paymentMethod === option.id && (
                      <CheckCircle2 className="w-5 h-5 text-[#1abc60]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Payment Summary</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Entry Fee</span>
                    <span className="text-gray-900 font-semibold">₹{regData.entryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Convenience (2%)</span>
                    <span className="text-gray-900 font-semibold">₹{Math.round(regData.entryFee * 0.02).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-900 font-bold text-base">Total Amount</span>
                    <span className="text-gray-900 font-bold text-xl">
                      ₹{(regData.entryFee + Math.round(regData.entryFee * 0.02)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-3 bg-[#1abc60] hover:bg-[#17a554] text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-colors"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay Now
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
