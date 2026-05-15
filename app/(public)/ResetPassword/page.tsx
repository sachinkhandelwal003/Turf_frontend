"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '@/app/services/api';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      router.push('/login');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password
      });

      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Password reset successfully! 🎉");
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        toast.error(response.data.message || "Failed to reset password.");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      toast.error(err.response?.data?.message || err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white w-full max-w-[420px] p-6 sm:p-10 rounded-2xl shadow-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="w-12 h-12 text-[#1abc60]" />
          </div>
        </div>
        <h1 className="text-[28px] font-extrabold text-[#2d3748] mb-2 tracking-tight">Success!</h1>
        <p className="text-gray-500 text-[15px] mb-8">Your password has been reset successfully. You can now log in with your new password.</p>
        <Link 
          href="/login" 
          className="w-full bg-[#1abc60] text-white py-3.5 rounded-lg font-bold text-[15px] transition-all flex items-center justify-center gap-2 hover:bg-[#169c4e]"
        >
          Go to Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white w-full max-w-[420px] p-6 sm:p-10 rounded-2xl shadow-sm">
      {/* LOGO */}
      <div className="flex justify-center mb-6">
        <img 
          src="/mainlogo.png" 
          alt="Game On Logo" 
          className="h-14 sm:h-16 object-contain" 
        />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-[28px] font-extrabold text-[#2d3748] mb-1 tracking-tight">Reset Password</h1>
        <p className="text-gray-500 text-[13px]">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* New Password */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full px-4 py-3.5 pr-12 bg-[#f4f5f5] rounded-lg text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all border-none"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 !bg-transparent !border-none !shadow-none p-0 outline-none !text-gray-500 hover:!text-gray-700 flex items-center justify-center cursor-pointer"
            >
              {showPass ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-8">
          <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfPass ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full px-4 py-3.5 pr-12 bg-[#f4f5f5] rounded-lg text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all border-none"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowConfPass(!showConfPass)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 !bg-transparent !border-none !shadow-none p-0 outline-none !text-gray-500 hover:!text-gray-700 flex items-center justify-center cursor-pointer"
            >
              {showConfPass ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full !bg-[#1abc60] !text-white py-3.5 rounded-lg font-bold text-[15px] transition-all flex items-center justify-center gap-2 mb-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:!bg-[#169c4e]'}`}
        >
          {isLoading ? "Resetting..." : "Reset Password"} {!isLoading && <ArrowRight className="w-4 h-4" />}
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

export default function ResetPassword() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-4 font-sans py-8 sm:py-12 relative overflow-hidden">
      <Suspense fallback={
        <div className="bg-white w-full max-w-[420px] p-6 sm:p-10 rounded-2xl shadow-sm flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
