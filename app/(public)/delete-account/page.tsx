"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://gameonindia.tech/api";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await axios.post(`${API_URL}/auth/delete-account/send-otp`, { email });
      setMessage("OTP sent to your email!");
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await axios.post(`${API_URL}/auth/delete-account/verify-otp`, { email, otp });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
              Delete Your Account
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Enter your registered email to receive an OTP
            </p>

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}
              {message && (
                <div className="text-green-600 text-sm text-center">{message}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
              Verify & Delete
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Enter the OTP sent to {email}
            </p>

            <form onSubmit={handleVerifyAndDelete} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Account Deleted
            </h1>
            <p className="text-gray-600 mb-8">
              Your account has been deleted successfully. We're sorry to see you go!
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex justify-center py-3 px-8 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
