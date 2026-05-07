"use client";

import { useState, useEffect } from 'react';
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [regData, setRegData] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

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
    
    setProcessing(true);
    try {
      // 1. Process the registration
      const res = await api.post(`/tournaments/${id}/register`, {
        teamName: regData.teamName,
        captainName: regData.captainName,
        email: regData.email,
        phone: regData.phone,
        altPhone: regData.altPhone,
        address: regData.address,
        members: regData.members,
        paymentId: `PAY_TRN_${Date.now()}`,
        paymentMethod
      });

      if (res.data.success) {
        toast.success("Registration & Payment Successful!");
        sessionStorage.removeItem('pending_registration');
        router.push(`/payment-success/tournament_${id}`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Payment failed. Please try again.");
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

  if (!regData) return null;

  const convenienceFee = Math.round(regData.entryFee * 0.02); // 2% fee
  const totalAmount = regData.entryFee + convenienceFee;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 font-sans text-gray-900 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
            Secure Checkout
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium">Confirm your entry for <span className="font-semibold text-gray-700">{regData.tournamentTitle}</span></p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* --- LEFT CONTENT: FORM SECTIONS --- */}
          <div className="flex-1 space-y-8 w-full">
            
            {/* 1. REGISTRATION SUMMARY */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-3">Registration Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-white border border-gray-100 flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Team Name</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{regData.teamName}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-white border border-gray-100 flex items-center justify-center text-gray-500 shadow-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Captain</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{regData.captainName}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. PAYMENT METHOD */}
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

          {/* --- RIGHT CONTENT: ORDER SUMMARY --- */}
          <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              
              <div className="bg-[#1abc60] p-6 relative overflow-hidden text-white">
                <Trophy className="absolute -right-6 -bottom-6 w-32 h-32 text-white opacity-10 pointer-events-none rotate-12" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10 shrink-0">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-0.5">Order Summary</p>
                    <h3 className="text-base font-bold text-white leading-tight">Tournament Entry</h3>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Tournament Fee</span>
                    <span className="text-gray-900 font-semibold">₹{regData.entryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Convenience Fee</span>
                    <span className="text-gray-900 font-semibold">₹{convenienceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4 pb-2 border-t border-gray-100">
                    <div>
                      <span className="block text-sm font-bold text-gray-800 mb-0.5">Total Payable</span>
                      <span className="text-xs font-medium text-gray-500">Incl. all taxes</span>
                    </div>
                    <span className="text-2xl font-bold text-[#1abc60]">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 bg-gray-50 border-t border-gray-200 space-y-4">
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="!w-full !py-3.5 !bg-[#1abc60] hover:!bg-[#17a554] !text-white !font-bold !text-sm !uppercase !tracking-wide !rounded-lg !transition-colors !flex !items-center !justify-center !gap-2 disabled:!opacity-70 !shadow-sm !border-none !cursor-pointer"
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Pay & Confirm Entry
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#1abc60]" />
                  SSL Secured Checkout
                </div>
              </div>

            </div>

            {/* Support Box */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Need Help?</p>
                <p className="text-sm font-bold text-gray-900">Support: +91 800-TURF-NOW</p>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}