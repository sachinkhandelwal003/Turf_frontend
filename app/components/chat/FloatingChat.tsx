"use client";

import { MessageSquare, X, RefreshCw } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAuth } from "@/app/context/AuthContext";
import { usePublicChat } from "./PublicChatProvider";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { 
    selectedConversation, 
    startConversationWithSuperAdmin, 
    messages,
    isLoading,
    refreshMessages
  } = usePublicChat();

  const handleOpen = async () => {
    setIsOpen(true);
    if (user && !selectedConversation) {
      await startConversationWithSuperAdmin();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {!isOpen ? (
        <button
          onClick={handleOpen}
          className="bg-gradient-to-br from-gray-700 to-gray-800 text-white p-4 rounded-full shadow-2xl hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl w-[92vw] sm:w-[380px] md:w-[420px] h-[70vh] max-h-[600px] min-h-[450px] flex flex-col border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-300">
          {/* Header */}
          <div className="bg-[#1abc60] p-4 text-white flex items-center justify-between shadow-md relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[15px] leading-tight">Support Chat</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
                  <p className="text-[11px] text-white/90 font-medium tracking-wide">We're online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={refreshMessages}
                className="hover:bg-black/10 p-2 rounded-full transition-all active:scale-90"
                title="Refresh messages"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-black/10 p-2 rounded-full transition-all active:scale-90"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-gray-50 to-white">
            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-inner">
                  <MessageSquare className="w-9 h-9" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-gray-900">Welcome!</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">Please log in to your account to start chatting with our support team.</p>
                </div>
                <Link 
                  href="/login" 
                  className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-bold hover:shadow-lg transition-all no-underline inline-block text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Log In Now
                </Link>
              </div>
            ) : isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-gray-400 border-t-transparent"></div>
                <p className="text-sm text-gray-500">Loading chat...</p>
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
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="animate-pulse rounded-full h-8 w-8 border-2 border-gray-400 border-t-transparent"></div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Connecting to support...</p>
                  <p className="text-gray-400 text-xs mt-1">This will only take a moment</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
