"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/app/services/api";

interface PaymentSettings {
  razorpay: {
    enabled: boolean;
    keyId: string;
    keySecret: string;
  };
}

interface PaymentSettingsContextType {
  settings: PaymentSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const PaymentSettingsContext = createContext<PaymentSettingsContextType | undefined>(undefined);

export function PaymentSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/settings");
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Failed to load payment settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <PaymentSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </PaymentSettingsContext.Provider>
  );
}

export function usePaymentSettings() {
  const context = useContext(PaymentSettingsContext);
  if (context === undefined) {
    throw new Error("usePaymentSettings must be used within a PaymentSettingsProvider");
  }
  return context;
}
