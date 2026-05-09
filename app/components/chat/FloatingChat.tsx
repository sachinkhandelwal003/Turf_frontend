"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { useChat } from "@/app/context/ChatContext";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useAuth } from "@/app/context/AuthContext";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { 
    selectedConversation, 
    startConversationWithSuperAdmin, 
    messages,
    isLoading 
  } = useChat();

  const handleOpen = async () => {
    setIsOpen(true);
    if (!selectedConversation) {
      await startConversationWithSuperAdmin();
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={handleOpen}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[calc(100vh-8rem)] flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-primary p-3 sm:p-4 text-white flex items-center justify-between shadow-md relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Support Chat</h3>
                <p className="text-[10px] text-white/80">We're online to help</p>
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
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : selectedConversation ? (
              <>
                <MessageList 
                  messages={messages} 
                  currentUserId={user.id} 
                />
                <MessageInput />
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
