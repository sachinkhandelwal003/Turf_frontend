"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  amount: number;
  currency?: string;
  name: string;
  description: string;
  orderId?: string;
  keyId: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  onClose?: () => void;
  disabled?: boolean;
  buttonText?: string;
  className?: string;
}

export default function RazorpayPayment({
  amount,
  currency = "INR",
  name,
  description,
  orderId,
  keyId,
  prefill,
  onSuccess,
  onError,
  onClose,
  disabled = false,
  buttonText = "Pay Now",
  className = "",
}: RazorpayPaymentProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        scriptRef.current = script;
      };
      document.body.appendChild(script);
      return () => {
        if (scriptRef.current) {
          document.body.removeChild(scriptRef.current);
        }
      };
    }
  }, []);

  const handlePayment = () => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded. Please try again.");
      return;
    }

    if (!keyId) {
      toast.error("Razorpay key not configured. Please contact support.");
      return;
    }

    setLoading(true);

    const options = {
      key: keyId,
      amount: Math.round(amount * 100),
      currency,
      name,
      description,
      order_id: orderId,
      prefill,
      theme: {
        color: "#1abc60",
      },
      handler: (response: any) => {
        setLoading(false);
        onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          onClose?.();
        },
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on("payment.failed", (response: any) => {
        setLoading(false);
        onError(response);
      });
    } catch (error) {
      setLoading(false);
      onError(error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={`w-full py-3 bg-[#1abc60] hover:bg-[#17a554] text-white font-bold text-sm uppercase tracking-wide rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm border-none cursor-pointer ${className}`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        buttonText
      )}
    </button>
  );
}
