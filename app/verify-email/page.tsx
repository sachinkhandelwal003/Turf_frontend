"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/app/api";
import { useAuth } from "@/app/context/AuthContext";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await apiRequest(`/auth/verify-email?token=${token}`, "GET");
        
        // No auto-login, just redirect to login page
        
        setStatus("success");
        setMessage(response.msg || "Email verified successfully!");
        
        toast.success("Email verified! Welcome aboard! 🎉");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        
      } catch (error: any) {
        setStatus("error");
        setMessage(error?.message || "Invalid or expired verification token.");
        toast.error(error?.message || "Verification failed.");
      }
    };

    verifyEmail();
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-sm text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/mainlogo.png"
            alt="Game On Logo"
            className="h-14 object-contain"
          />
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#1abc60]" />
            <h2 className="text-xl font-bold text-gray-800">Verifying your email...</h2>
            <p className="text-gray-500">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Email Verified!</h2>
            <p className="text-gray-500">{message}</p>
            <p className="text-sm text-gray-400 mt-2">Redirecting you to login...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Verification Failed</h2>
            <p className="text-gray-500">{message}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-2.5 bg-[#1abc60] hover:bg-[#169c4e] text-white font-bold rounded-lg transition-colors"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
