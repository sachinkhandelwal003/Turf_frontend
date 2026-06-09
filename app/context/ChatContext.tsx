"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Conversation, Message } from "@/app/types/chat.types";
import { 
  getConversations, 
  getMessages, 
  sendMessage as sendMessageApi, 
  getSuperAdmin, 
  createConversation,
  deleteMessage as deleteMessageApi,
  reactToMessage as reactToMessageApi,
  markMessagesAsSeen as markMessagesAsSeenApi
} from "@/app/services/chat.service";
import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  selectedConversation: Conversation | null;
  setSelectedConversation: (conv: Conversation | null) => void;
  sendMessage: (text: string, file?: File, replyTo?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
  startConversationWithSuperAdmin: () => Promise<void>;
  startConversationWithAdmin: (adminId: string) => Promise<void>;
  isLoading: boolean;
  refreshMessages: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
    
    if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        if (/^192\.168\./.test(window.location.hostname) || /^10\./.test(window.location.hostname)) {
          apiUrl = `http://${window.location.hostname}:5001/api`;
        }
      }
    }

    const socketUrl = apiUrl.replace("/api", "");
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isMounted]);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getConversations(userId);
      const fetchedConversations = data.conversations || [];
      setConversations(fetchedConversations);
      
      const preferredType = user?.role === 'admin' ? 'superadmin_admin' : 'user_superadmin';
      const supportConv = fetchedConversations.find((c: Conversation) => c.type === preferredType);
      if (supportConv && !selectedConversation) {
        setSelectedConversation(supportConv);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedConversation]);

  const fetchMessages = useCallback(async () => {
    if (!selectedConversation || !userId) return;
    try {
      const data = await getMessages(selectedConversation._id);
      setMessages(data.messages || []);
      
      // Mark messages as seen
      await markMessagesAsSeenApi(selectedConversation._id, userId);
      
      // Update local conversation state to clear unread count
      setConversations(prev => prev.map(c => 
        c._id === selectedConversation._id 
          ? { ...c, unreadCount: 0 } 
          : c
      ));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [selectedConversation, userId]);

  useEffect(() => {
    if (!userId) return;
    fetchConversations();
  }, [userId, fetchConversations]);

  useEffect(() => {
    if (!selectedConversation || !socket) return;

    fetchMessages();
    socket.emit("join_conversation", selectedConversation._id);

    socket.on("receive_message", (newMessage: Message) => {
      const isForCurrent = selectedConversation && newMessage.conversationId === selectedConversation._id;
      
      if (isForCurrent) {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(m => m._id === newMessage._id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      } else {
        const senderName = newMessage.senderId?.name || "Someone";
        toast.success(`New message from ${senderName}`, {
          description: newMessage.text.substring(0, 30) + (newMessage.text.length > 30 ? '...' : ''),
        });
      }
      
      setConversations((prev) => {
        const exists = prev.some(c => c._id === newMessage.conversationId);
        if (exists) {
          return prev.map((conv) => {
            if (conv._id === newMessage.conversationId) {
              return { 
                ...conv, 
                lastMessage: newMessage.text, 
                updatedAt: new Date().toISOString(),
                unreadCount: isForCurrent ? 0 : (conv.unreadCount || 0) + 1
              };
            }
            return conv;
          }).sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        } else {
          // If it's a new conversation, fetch the list again
          fetchConversations();
          return prev;
        }
      });
    });

    socket.on("message_deleted", (messageId: string) => {
      setMessages((prev) => 
        prev.map(m => m._id === messageId ? { ...m, isDeleted: true, text: "This message was deleted", file: undefined } : m)
      );
    });

    socket.on("message_reacted", (updatedMessage: Message) => {
      setMessages((prev) => 
        prev.map(m => m._id === updatedMessage._id ? updatedMessage : m)
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_deleted");
      socket.off("message_reacted");
    };
  }, [selectedConversation, socket, fetchMessages]);

  useEffect(() => {
    if (selectedConversation) {
      pollIntervalRef.current = setInterval(() => {
        fetchMessages();
      }, 5000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedConversation, fetchMessages]);

  const sendMessage = useCallback(async (text: string, file?: File, replyTo?: string) => {
    if (!selectedConversation || !userId || !socket || !user) return;

    const formData = new FormData();
    formData.append("conversationId", selectedConversation._id);
    formData.append("senderId", userId);
    formData.append("senderRole", user.role);
    formData.append("text", text);
    if (file) formData.append("file", file);
    if (replyTo) formData.append("replyTo", replyTo);

    try {
      const response = await sendMessageApi(formData);
      socket.emit("send_message", response.message);
      setMessages((prev) => [...prev, response.message]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [selectedConversation, userId, user, socket]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!socket) return;
    try {
      await deleteMessageApi(messageId);
      socket.emit("delete_message", { messageId, conversationId: selectedConversation?._id });
      
      setMessages((prev) => 
        prev.map(m => m._id === messageId ? { ...m, isDeleted: true, text: "This message was deleted", file: undefined } : m)
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  }, [socket, selectedConversation]);

  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    if (!socket || !userId) return;
    try {
      const response = await reactToMessageApi(messageId, { userId, emoji });
      socket.emit("react_message", response.message);
      
      setMessages((prev) => 
        prev.map(m => m._id === messageId ? response.message : m)
      );
    } catch (error) {
      console.error("Failed to react to message:", error);
    }
  }, [socket, userId]);

  const startConversationWithSuperAdmin = useCallback(async () => {
    if (!userId || !user) return;

    try {
      const { superadmin } = await getSuperAdmin();
      if (!superadmin) return;

      const response = await createConversation({
        type: user.role === "admin" ? "superadmin_admin" : "user_superadmin",
        participants: [userId, superadmin._id],
        createdBy: userId
      });

      if (response.success) {
        setConversations(prev => {
          const exists = prev.find(c => c._id === response.conversation._id);
          if (exists) return prev;
          return [response.conversation, ...prev];
        });
        setSelectedConversation(response.conversation);
      }
    } catch (error) {
      console.error("Failed to start conversation with superadmin:", error);
    }
  }, [userId, user]);

  const startConversationWithAdmin = useCallback(async (adminId: string) => {
    if (!userId) return;

    try {
      const response = await createConversation({
        type: "superadmin_admin",
        participants: [userId, adminId],
        createdBy: userId
      });

      if (response.success) {
        setConversations(prev => {
          const exists = prev.find(c => c._id === response.conversation._id);
          if (exists) return prev;
          return [response.conversation, ...prev];
        });
        setSelectedConversation(response.conversation);
      }
    } catch (error) {
      console.error("Failed to start conversation with admin:", error);
    }
  }, [userId]);

  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        selectedConversation,
        setSelectedConversation,
        sendMessage,
        deleteMessage,
        reactToMessage,
        replyingTo,
        setReplyingTo,
        startConversationWithSuperAdmin,
        startConversationWithAdmin,
        isLoading,
        refreshMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
