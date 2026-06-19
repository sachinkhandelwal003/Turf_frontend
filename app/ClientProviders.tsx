'use client';

import { useState, useEffect } from 'react';
import { AuthProvider } from "@/app/context/AuthContext";
import { ChatProvider } from "@/app/context/ChatContext";
import { SettingsProvider, useSettings } from "@/app/context/SettingsContext";
import FloatingChatWrapper from "./components/chat/FloatingChatWrapper";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ErrorBoundary from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";

function ProvidersContent({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useSettings();

  // Wait for settings for 3 seconds max, then render anyway
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimedOut(true);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1abc60]" />
      </div>
    );
  }

  return (
    <GoogleOAuthProvider 
      clientId={settings?.googleLogin?.clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
      onScriptLoadError={() => console.error("Google Sign-In script failed to load")}
    >
      <AuthProvider>
        <ChatProvider>
          {children}
          <FloatingChatWrapper />
          <Toaster position="top-right" richColors />
        </ChatProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ProvidersContent>{children}</ProvidersContent>
      </SettingsProvider>
    </ErrorBoundary>
  );
}