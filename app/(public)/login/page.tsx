"use client";

// Type declaration for Apple ID SDK
declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: any) => void;
        signIn: () => void;
      };
    };
  }
}

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useSettings } from '@/app/context/SettingsContext';
import { Suspense } from 'react';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';

const GoogleIcon = () => ( <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.01 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> );
const AppleIcon = () => ( <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.97 3.83 2.32-3.18 1.94-2.64 6.32.48 7.62-.7 1.83-1.83 3.6-2.96 4.71v-.01zm-3.08-16.7c-.12-1.95 1.4-3.64 3.25-3.79.25 2.12-1.63 3.8-3.25 3.79z"/></svg> );

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { login, googleLogin, appleLogin, isAuthenticated, isLoading: authLoading } = useAuth();
  const { settings, isLoading: settingsLoading } = useSettings();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !authLoading && !settingsLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router, isClient, settingsLoading]);

  if (isClient && (authLoading || settingsLoading)) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-4 font-sans py-8 sm:py-12 relative overflow-hidden">
        <div className="bg-white w-full max-w-[420px] p-6 sm:p-10 rounded-2xl shadow-sm relative">
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
          </div>
        </div>
      </div>
    );
  }

  if (isClient && isAuthenticated) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please enter both email and password!");
    }

    setIsLoading(true);

    try {
      const user = await login(email, password);

      // RESTRICTION: Only 'user' role can login through public portal
      if (user.role !== 'user') {
        // Log them out immediately as they shouldn't be in the public portal session
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        toast.error("Admins must login through the Admin Portal.");
        return;
      }

      toast.success("Logged in Successfully! 🎉");

      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/');
      }

    } catch (error: any) {
      toast.error(error?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      
      if (user.role !== 'user') {
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        toast.error("Admins must login through the Admin Portal.");
        return;
      }

      toast.success("Logged in Successfully! 🎉");
      
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error?.message || "Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google login failed. Please try again.");
  };

  // Initialize Apple Sign-In SDK only if Apple login is enabled
  useEffect(() => {
    if (typeof window !== 'undefined' && isClient && settings?.appleLogin?.enabled) {
      // Load Apple JS SDK
      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.onload = () => {
        // Initialize Apple Sign-In
        if (window.AppleID) {
          window.AppleID.auth.init({
            clientId: settings.appleLogin.clientId || process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
            scope: 'name email',
            redirectURI: window.location.origin,
            state: 'state',
            nonce: 'nonce',
            usePopup: true
          });
        }
      };
      document.body.appendChild(script);

      // Listen for Apple Sign-In response
      document.addEventListener('AppleIDSignInOnSuccess', handleAppleLoginSuccess);
      document.addEventListener('AppleIDSignInOnFailure', handleAppleLoginError);

      return () => {
        document.removeEventListener('AppleIDSignInOnSuccess', handleAppleLoginSuccess);
        document.removeEventListener('AppleIDSignInOnFailure', handleAppleLoginError);
      };
    }
  }, [isClient, settings?.appleLogin?.enabled, settings?.appleLogin?.clientId]);

  const handleAppleLoginSuccess = async (event: any) => {
    setIsLoading(true);
    try {
      const { id_token, user } = event.detail.authorization;
      const fullName = user ? {
        givenName: user.name?.firstName,
        familyName: user.name?.lastName
      } : undefined;

      const userData = await appleLogin(id_token, fullName);

      if (userData.role !== 'user') {
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        toast.error("Admins must login through the Admin Portal.");
        return;
      }

      toast.success("Logged in Successfully! 🎉");

      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error?.message || "Apple login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLoginError = () => {
    toast.error("Apple login failed. Please try again.");
  };

  const triggerAppleLogin = () => {
    if (window.AppleID) {
      window.AppleID.auth.signIn();
    }
  };

  const showGoogleButton = settings?.googleLogin?.enabled;
  const showAppleButton = settings?.appleLogin?.enabled;

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

        {/* LOGO (SignUp wala same) */}
        <div className="flex justify-center mb-6">
          <img 
            src="/mainlogo.png" 
            alt="Game On Logo" 
            className="h-14 sm:h-16 object-contain" 
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[28px] font-extrabold text-[#2d3748] mb-1 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 text-[13px]">Sign in to manage your bookings and leagues.</p>
        </div>

        <form onSubmit={handleLogin}>
          
          {/* Email Address */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={isLoading}
              className="w-full px-4 py-3.5 bg-[#f4f5f5] rounded-lg text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-[#1abc60] transition-all border-none"
            />
          </div>

          {/* Password (With Eye Icon & Forgot Password Link) */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">Password</label>
              <Link 
                href={email ? `/ForgotPassword?email=${encodeURIComponent(email)}` : "/ForgotPassword"} 
                disable-drag="true" 
                className="text-[11px] font-bold text-[#1abc60] hover:underline"
              >
                Forgot password?
              </Link>
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
            {isLoading ? "Logging in..." : "Login"} {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Only show divider if at least one social button is enabled */}
          {(showGoogleButton || showAppleButton) && (
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <span className="relative bg-white px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or Continue With</span>
            </div>
          )}

          {/* SOCIAL BUTTONS */}
          <div className={`mb-8 ${showGoogleButton && showAppleButton ? 'grid grid-cols-2 gap-4' : 'flex justify-center'}`}>
            {showGoogleButton && (
              <div className="flex items-center justify-center">
                {isClient && (
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    theme="outline"
                    size="large"
                  />
                )}
              </div>
            )}
            {showAppleButton && (
              <button 
                type="button" 
                onClick={triggerAppleLogin}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-base font-medium text-gray-800"
              >
                <AppleIcon />
                <span>Sign in with Apple</span>
              </button>
            )}
          </div>

          <p className="text-center text-[13px] text-gray-500 font-medium">
            Don't have an account? <Link href="/Signup" disable-drag="true" className="text-[#1abc60] font-bold hover:underline">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1abc60] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}