"use client";

import ChatLayout from "@/app/components/chat/ChatLayout";
import { ChatProvider } from "@/app/context/ChatContext";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminChatPage() {
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
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-144px)] overflow-hidden rounded-xl border bg-white shadow-lg flex flex-col mx-auto w-full max-w-[1400px]">
      <ChatProvider userId={user.id}>
        <ChatLayout userId={user.id} />
      </ChatProvider>
    </div>
  );
}
