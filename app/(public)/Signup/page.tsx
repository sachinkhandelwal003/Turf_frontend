"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, ChevronDown, Loader2, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/app/api'; 
import { useAuth } from '@/app/context/AuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Example: import gameOnLogo from '../../public/image_b83177.png';

const GoogleIcon = () => ( <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.01 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> );
const AppleIcon = () => ( <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.83 2.32-3.18 1.94-2.64 6.32.48 7.62-.7 1.83-1.83 3.6-2.96 4.71v-.01zm-3.08-16.7c-.12-1.95 1.4-3.64 3.25-3.79.25 2.12-1.63 3.8-3.25 3.79z"/></svg> );

export default function SignUp() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      return toast.error("Please fill in all fields.");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return toast.error("Please enter a valid email address.");
    }

    // Phone validation (10 digits Indian)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      return toast.error("Please enter a valid 10-digit Indian phone number.");
    }

    setIsLoading(true);

    try {
      const response = await apiRequest('/auth/register', 'POST', formData as any);
      toast.success("Signed up successfully!");
      
      if (response.token) {
        localStorage.setItem("token", response.token);
      }
      if (response.user) {
        localStorage.setItem("adminUser", JSON.stringify(response.user));
      }

      setTimeout(() => {
        window.location.href = '/'; // Force reload to pick up context
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-4 font-sans py-8 sm:py-12 relative overflow-hidden">
      
      <div className="bg-white w-full max-w-[420px] pt-14 pb-6 px-6 sm:p-10 rounded-2xl shadow-sm relative">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="absolute left-4 top-4 text-gray-400 hover:text-[#1abc60] transition-colors p-1"
          title="Go Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <img 
            src="/mainlogo.png" 
            alt="Game On Logo" 
            className="h-14 sm:h-16 object-contain" 
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[28px] font-extrabold text-[#2d3748] mb-1 tracking-tight">Create Your Account</h1>
          <p className="text-gray-500 text-[13px]">Sign up to manage your bookings and leagues.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="name" 
              className="w-full px-4 py-3.5 bg-[#f4f5f5] rounded-lg text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all border-none" 
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com" 
              className="w-full px-4 py-3.5 bg-[#f4f5f5] rounded-lg text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all border-none" 
            />
          </div>

          {/* Phone Number with FlagCDN */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Phone Number</label>
            <div className="flex items-center bg-[#f4f5f5] rounded-lg focus-within:ring-2 focus-within:ring-[#1abc60] transition-all overflow-hidden">
              <div className="flex items-center gap-1.5 pl-4 pr-3 py-3.5 border-r border-gray-300">
                <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-5 h-auto rounded-[2px]" />
                <span className="text-[14px] text-gray-700 font-medium">+91</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210" 
                className="w-full py-3.5 px-4 bg-transparent text-[14px] text-gray-800 outline-none" 
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5 relative">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••" 
                className="w-full px-4 py-3.5 pr-12 bg-[#f4f5f5] rounded-lg text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all border-none" 
              />
              {/* EYE ICON: !text-gray-500 add kiya hai taaki white na ho */}
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
          <div className="mb-6 relative">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfPass ? "text" : "password"} 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••" 
                className="w-full px-4 py-3.5 pr-12 bg-[#f4f5f5] rounded-lg text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all border-none" 
              />
              {/* EYE ICON: !text-gray-500 add kiya hai taaki white na ho */}
              <button 
                type="button" 
                onClick={() => setShowConfPass(!showConfPass)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 !bg-transparent !border-none !shadow-none p-0 outline-none !text-gray-500 hover:!text-gray-700 flex items-center justify-center cursor-pointer"
              >
                {showConfPass ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full !bg-[#1abc60] !text-white py-3.5 rounded-lg font-bold text-[15px] transition-all flex items-center justify-center gap-2 mb-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:!bg-[#169c4e]'}`}
          >
            {isLoading ? "Creating..." : "Sign Up"} 
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Checkbox Terms */}
          <div className="flex items-start sm:items-center justify-between gap-3 mb-8">
            <p className="text-[12px] text-gray-500 leading-tight">
              I agree to the <Link href="/terms-of-service" target="_blank" className="text-[#1abc60] font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy-policy" target="_blank" className="text-[#1abc60] font-bold hover:underline">Privacy Policy</Link>.
            </p>
            <input type="checkbox" required className="w-4 h-4 mt-0.5 sm:mt-0 accent-[#1abc60] cursor-pointer rounded border-gray-300 shrink-0" />
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <span className="relative bg-white px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or Continue With</span>
          </div>

          {/* SOCIAL BUTTONS: !text-[#2d3748] add kiya hai taaki text dark gray dikhe */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button type="button" className="flex items-center justify-center gap-2.5 !bg-[#f4f5f5] hover:!bg-[#e9ebea] py-3.5 rounded-lg transition-all text-[13px] font-bold !text-[#2d3748] border-none">
              Google <GoogleIcon />
            </button>
            <button type="button" className="flex items-center justify-center gap-2.5 !bg-[#f4f5f5] hover:!bg-[#e9ebea] py-3.5 rounded-lg transition-all text-[13px] font-bold !text-[#2d3748] border-none">
              Apple <AppleIcon />
            </button>
          </div>

          <p className="text-center text-[13px] text-gray-500 font-medium">
            Already have an account? <Link href="/login" className="text-[#1abc60] font-bold hover:underline">login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}