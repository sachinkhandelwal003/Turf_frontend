"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { Suspense } from "react";
import { toast } from "sonner";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { login } = useAuth();

  const [state, setState] = useState<
    "loading" | "success" | "error" | "missing"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setState("missing");
        setMessage("Verification token is missing");
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
        const response = await fetch(`${API_URL}/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setState("error");
          setMessage(data.msg || data.message || "Verification failed");
          return;
        }

        // Log the user in
        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("adminUser", JSON.stringify(data.user));
        }

        setState("success");
        setMessage(data.msg || "Email verified successfully");
        toast.success("Email verified successfully! Redirecting to login...");

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (err) {
        console.error("Verify Email Error:", err);
        setState("error");
        setMessage("Something went wrong. Please try again later.");
      }
    };

    verifyEmail();
  }, [token, router, login]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-3 sm:p-4 font-sans py-8 sm:py-12 relative overflow-hidden">
      <div className="bg-white w-full max-w-[420px] pt-14 pb-6 px-6 sm:p-10 rounded-2xl shadow-sm relative">
        <button
          onClick={() => router.push("/login")}
          className="absolute left-4 top-4 text-gray-400 hover:text-[#1abc60] transition-colors p-1"
          title="Go to Login"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {state === "loading" && (
              <Loader2 className="w-16 h-16 text-[#1abc60] animate-spin" />
            )}
            {state === "success" && (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
            {(state === "error" || state === "missing") && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <h1 className="text-[28px] font-extrabold text-[#2d3748] mb-2 tracking-tight">
            {state === "loading" && "Verifying Email..."}
            {state === "success" && "Email Verified!"}
            {(state === "error" || state === "missing") && "Verification Failed"}
          </h1>
          <p className="text-gray-500 text-[14px]">{message}</p>
        </div>

        {state !== "loading" && state !== "success" && (
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full !bg-[#1abc60] !text-white py-3.5 px-4 rounded-lg font-bold text-[15px] transition-all hover:!bg-[#169c4e]"
            >
              Go to Login
            </Link>
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
        <div className="w-8 h-8 border-4 border-[#1abc60] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}