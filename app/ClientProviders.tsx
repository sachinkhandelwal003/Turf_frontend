'use client';

import { AuthProvider } from "@/app/context/AuthContext";
import { ChatProvider } from "@/app/context/ChatContext";
import FloatingChatWrapper from "./components/chat/FloatingChatWrapper";
import { Toaster } from "sonner";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ChatProvider>
        {children}
        <FloatingChatWrapper />
        <Toaster position="top-right" richColors />
      </ChatProvider>
    </AuthProvider>
  );
}