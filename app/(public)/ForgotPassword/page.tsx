"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setSuccessMsg("Reset link sent to your email! 📧");
        toast.success("Reset link sent successfully!");
        setEmail("");
      } else {
        toast.error(response.data.msg || response.data.message || "Failed to send reset link.");
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || err.message || "Failed to send link. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-[420px] p-6 sm:p-10 rounded-2xl shadow-sm">
      {/* SUCCESS TOAST NOTIFICATION */}
      {successMsg && (
        <div className="fixed top-6 right-6 sm:top-10 sm:right-10 z-[100] flex items-center gap-3 bg-white border-l-4 border-[#1abc60] shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-4 rounded-xl animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-green-100 rounded-full p-1">
            <CheckCircle className="w-5 h-5 text-[#1abc60]" />
          </div>
          <span className="text-[#2d3748] font-bold text-[14px]">{successMsg}</span>
        </div>
      )}

      {/* LOGO */}
      <div className="flex justify-center mb-6">
        <img 
          src="/mainlogo.png" 
          alt="Game On Logo" 
          className="h-14 sm:h-16 object-contain" 
        />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-[28px] font-extrabold text-[#2d3748] mb-1 tracking-tight">Forgot Password</h1>
        <p className="text-gray-500 text-[13px]">Enter your email address to receive a password reset link.</p>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Email Address */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={isLoading}
            className="w-full px-4 py-3.5 bg-[#f4f5f5] rounded-lg text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all border-none"
            required
          />
        </div>

        {/* Action Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full !bg-[#1abc60] !text-white py-3.5 rounded-lg font-bold text-[15px] transition-all flex items-center justify-center gap-2 mb-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:!bg-[#169c4e]'}`}
        >
          {isLoading ? "Sending..." : "Send Reset Link"} {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center justify-center gap-2 text-[11px] font-bold text-[#1abc60] hover:text-[#169c4e] uppercase tracking-widest">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-4 font-sans py-8 sm:py-12 relative overflow-hidden">
      <Suspense fallback={
        <div className="bg-white w-full max-w-[420px] p-6 sm:p-10 rounded-2xl shadow-sm flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
        </div>
      }>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}