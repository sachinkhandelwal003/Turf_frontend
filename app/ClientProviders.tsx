'use client';

import { AuthProvider } from "@/app/context/AuthContext";
import { ChatProvider } from "@/app/context/ChatContext";
import FloatingChatWrapper from "./components/chat/FloatingChatWrapper";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider 
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
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