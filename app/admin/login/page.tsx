"use client";

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      return setErrorMsg("Please enter both email and password!");
    }

    setIsLoading(true);

    try {
      const user = await login(email, password);
      
      if (user.role === 'admin' || user.role === 'superadmin') {
        setSuccessMsg("Logged in Successfully! 🎉");
        setTimeout(() => {
          setSuccessMsg("");
          router.push('/admin/dashboard');
        }, 1500);
      } else {
        // If not an admin, log them out and show error
        localStorage.removeItem('adminUser');
        localStorage.removeItem('token');
        setErrorMsg('Access denied. This portal is for administrators only.');
      }
    } catch (error: any) {
      setErrorMsg(error?.message || "Invalid credentials. Please try again.");
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
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200">
              <Shield className="w-8 h-8 text-[#1abc60]" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Admin Portal</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[28px] font-extrabold text-[#2d3748] mb-1 tracking-tight">Admin Login</h1>
          <p className="text-gray-500 text-[13px]">Secure access to the management dashboard.</p>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && <div className="mb-4 p-3 text-[13px] text-red-600 bg-red-50 rounded-lg text-center font-medium">{errorMsg}</div>}

        <form onSubmit={handleLogin}>
          
          {/* Email Address */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@turf.com"
              disabled={isLoading}
              className="w-full px-4 py-3.5 bg-[#f4f5f5] rounded-lg text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all border-none"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">Password</label>
            </div>
            
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full px-4 py-3.5 pr-12 bg-[#f4f5f5] rounded-lg text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all border-none"
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

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full !bg-[#1abc60] !text-white py-3.5 rounded-lg font-bold text-[15px] transition-all flex items-center justify-center gap-2 mb-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:!bg-[#169c4e]'}`}
          >
            {isLoading ? "Authenticating..." : "Sign In to Dashboard"} {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>

          <p className="text-center text-[13px] text-gray-500 font-medium">
            Not an admin? <Link href="/login" className="text-[#1abc60] font-bold hover:underline">User Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
