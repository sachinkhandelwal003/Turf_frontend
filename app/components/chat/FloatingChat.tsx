"use client";

import { MessageSquare, X, Send } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAuth } from "@/app/context/AuthContext";
import { usePublicChat } from "./PublicChatProvider";
import { useState } from "react";
import Link from "next/link";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { 
    selectedConversation, 
    startConversationWithSuperAdmin, 
    messages,
    isLoading 
  } = usePublicChat();

  const handleOpen = async () => {
    setIsOpen(true);
    if (user && !selectedConversation) {
      await startConversationWithSuperAdmin();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={handleOpen}
          className="bg-[#1abc60] text-white p-4 rounded-full shadow-lg hover:bg-[#169c4e] transition-all flex items-center justify-center animate-pulse hover:animate-none"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-6rem)] flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1abc60] to-[#16a34a] p-4 text-white flex items-center justify-between shadow-lg relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-[#1abc60] rounded-full shadow-sm"></div>
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Live Support</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                  <p className="text-[11px] font-medium text-white/90">Agent is Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-2 rounded-xl transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-[#1abc60] transform rotate-12">
                  <MessageSquare className="w-10 h-10 transform -rotate-12" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-gray-900">Let&apos;s get you started</h4>
                  <p className="text-sm text-gray-500 max-w-[240px] mx-auto">Please log in to your account to start a conversation with our support team.</p>
                </div>
                <Link 
                  href="/login" 
                  className="w-full py-4 bg-[#1abc60] text-white rounded-2xl font-bold shadow-lg shadow-[#1abc60]/20 hover:bg-[#16a34a] hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 no-underline flex items-center justify-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Send className="w-4 h-4" />
                  Log In Now
                </Link>
              </div>
            ) : isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1abc60]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 bg-[#1abc60] rounded-full animate-ping"></div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-400">Loading conversation...</p>
              </div>
            ) : selectedConversation ? (
              <>
                <MessageList 
                  messages={messages} 
                  currentUserId={user.id} 
                  isPublic={true}
                />
                <MessageInput isPublic={true} />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                  <div className="animate-bounce">
                    <MessageSquare className="w-8 h-8 text-gray-300" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-400">Initializing secure support channel...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
