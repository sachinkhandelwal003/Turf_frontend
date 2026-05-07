"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  if (!regData) return null;

  const convenienceFee = Math.round(regData.entryFee * 0.02); // 2% fee
  const totalAmount = regData.entryFee + convenienceFee;

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 font-sans text-gray-900 overflow-x-hidden">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl lg:text-[42px] font-black tracking-tight leading-none mb-3">
            <span className="text-[#1abc60]">SECURE</span> <span className="text-gray-900 uppercase">Tournament Checkout</span>
          </h1>
          <p className="text-gray-400 font-bold text-xs md:text-sm tracking-tight">Confirm your entry for {regData.tournamentTitle}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* --- LEFT CONTENT: FORM SECTIONS --- */}
          <div className="flex-1 space-y-10 w-full">
            
            {/* 1. REGISTRATION SUMMARY */}
            <div className="space-y-6">
              <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-900">Registration Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#f3f4f1] p-6 rounded-[32px] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#1abc60] shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Name</p>
                    <p className="text-lg font-black text-gray-900">{regData.teamName}</p>
                  </div>
                </div>
                <div className="bg-[#f3f4f1] p-6 rounded-[32px] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#1abc60] shadow-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Captain</p>
                    <p className="text-lg font-black text-gray-900">{regData.captainName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. PAYMENT METHOD */}
            <div className="space-y-6">
              <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-900">Select Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'upi', name: 'UPI Payment', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
                  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                  { id: 'netbanking', name: 'Net Banking', icon: Landmark, desc: 'All major Indian banks' },
                  { id: 'wallet', name: 'Digital Wallets', icon: Wallet, desc: 'Amazon Pay, Mobikwik' }
                ].map((method) => (
                  <div 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-6 rounded-[32px] bg-[#f3f4f1] cursor-pointer border-2 transition-all flex items-center gap-5 ${
                      paymentMethod === method.id ? 'border-[#1abc60]' : 'border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm ${paymentMethod === method.id ? 'text-[#1abc60]' : 'text-gray-400'}`}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[15px] font-black text-gray-900">{method.name}</h3>
                      <p className="text-[11px] text-gray-400 font-bold">{method.desc}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? 'border-[#1abc60]' : 'border-gray-300'}`}>
                      {paymentMethod === method.id && <div className="w-3 h-3 rounded-full bg-[#1abc60]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT CONTENT: ORDER SUMMARY --- */}
          <div className="w-full lg:w-[420px] shrink-0 sticky top-28">
            <div className="bg-gray-900 rounded-[48px] p-8 md:p-10 text-white shadow-2xl overflow-hidden relative">
              {/* Decorative Trophy Background */}
              <Trophy className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 rotate-12 pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 rounded-xl bg-[#1abc60] flex items-center justify-center text-white">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1abc60]">Order Summary</span>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center group">
                    <span className="text-gray-400 font-bold text-sm">Tournament Fee</span>
                    <span className="font-black text-lg">₹{regData.entryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-gray-400 font-bold text-sm">Convenience Fee</span>
                    <span className="font-black text-lg">₹{convenienceFee.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/10 my-6" />
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-[#1abc60] font-black text-[10px] uppercase tracking-widest mb-1">Total Payable</span>
                      <span className="text-gray-400 text-xs font-bold">Incl. all taxes</span>
                    </div>
                    <span className="text-4xl font-black text-white leading-none">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-[#1abc60] hover:bg-[#17a554] text-white py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-[#1abc60]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
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
                  
                  <div className="flex items-center justify-center gap-2 py-4">
                    <ShieldCheck className="w-4 h-4 text-[#1abc60]" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SSL Secured Checkout</span>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-1">Need Help?</p>
                      <p className="text-sm font-bold text-white/80">Support: +91 800-TURF-NOW</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
