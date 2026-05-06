"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      // Logic for sending reset link will go here
      setSuccessMsg("Reset link sent to your email! 📧");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg("Failed to send link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-4 font-sans py-8 sm:py-12 relative overflow-hidden">
      
      {/* SUCCESS TOAST NOTIFICATION */}
      {successMsg && (
        <div className="fixed top-6 right-6 sm:top-10 sm:right-10 z-[100] flex items-center gap-3 bg-white border-l-4 border-[#1abc60] shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-5 py-4 rounded-xl animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-green-100 rounded-full p-1">
            <CheckCircle className="w-5 h-5 text-[#1abc60]" />
          </div>
          <span className="text-[#2d3748] font-bold text-[14px]">{successMsg}</span>
        </div>
      )}

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
          <h1 className="text-[28px] font-extrabold text-[#2d3748] mb-1 tracking-tight">Forgot Password</h1>
          <p className="text-gray-500 text-[13px]">Enter your email address to receive a password reset link.</p>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && <div className="mb-4 p-3 text-[13px] text-red-600 bg-red-50 rounded-lg text-center font-medium">{errorMsg}</div>}

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
    </div>
  );
}