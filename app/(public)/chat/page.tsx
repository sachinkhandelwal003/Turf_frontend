"use client";

import ChatLayout from "@/app/components/chat/ChatLayout";
import { ChatProvider } from "@/app/context/ChatContext";
import { useAuth } from "@/app/context/AuthContext";

export default function ChatPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please login to access the chat.</p>
      </div>
    );
  }

  return (
    <ChatProvider>
      <ChatLayout userId={user.id} />
    </ChatProvider>
  );
}