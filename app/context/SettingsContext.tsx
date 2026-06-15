"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/app/services/api";

interface Settings {
  siteName: string;
  contactEmail: string;
  frontendLogo: string;
  backendLogo: string;
  googleLogin: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
  };
  appleLogin: {
    enabled: boolean;
    clientId: string;
    teamId: string;
    keyId: string;
  };
  maintenanceMode: boolean;
  coinValue: number;
  heroBanner: {
    title: string;
    subtitle: string;
    image: string;
  };
  razorpay: {
    enabled: boolean;
    keyId: string;
    keySecret: string;
  };
}

interface SettingsContextType {
  settings: Settings | null;
  isLoading: boolean;
  refetchSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/settings");
      if (res.data && res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        refetchSettings: fetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
