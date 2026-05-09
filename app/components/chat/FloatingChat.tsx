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
        <div className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[calc(100vh-8rem)] flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#1abc60] p-3 sm:p-4 text-white flex items-center justify-between shadow-md relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Support Chat</h3>
                <p className="text-[10px] text-white/80">We&apos;re online to help</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-[#1abc60]">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Login to Chat</h4>
                  <p className="text-sm text-gray-500 mt-2">Please log in to your account to start a conversation with our support team.</p>
                </div>
                <Link 
                  href="/login" 
                  className="w-full py-3 bg-[#1abc60] text-white rounded-xl font-bold hover:bg-[#169c4e] transition-all no-underline inline-block"
                  onClick={() => setIsOpen(false)}
                >
                  Log In Now
                </Link>
              </div>
            ) : isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1abc60]"></div>
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
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Starting a conversation with support...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
