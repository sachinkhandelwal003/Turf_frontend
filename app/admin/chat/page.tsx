"use client";

import ChatLayout from "@/app/components/chat/ChatLayout";
import { useAuth } from "@/app/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminChatPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#1abc60]" />
          <p className="text-gray-500 font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500">Please login to access the chat.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-144px)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg flex flex-col mx-auto w-full max-w-[1400px]">
      <ChatLayout userId={user.id} />
    </div>
  );
}
