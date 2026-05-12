"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/services/api";

interface Message {
  _id: string;
  conversationId: string;
  senderId: {
    _id: string;
    name: string;
    role: string;
    profilePhoto?: string;
  };
  senderRole: string;
  text: string;
  file?: {
    url: string;
    name: string;
    type: string;
    size: number;
  };
  replyTo?: Message;
  reactions?: Array<{ userId: string; emoji: string }>;
  isDeleted?: boolean;
  createdAt: string;
}

interface Conversation {
  _id: string;
  type: string;
  participants: Array<{
    _id: string;
    name: string;
    role: string;
    profilePhoto?: string;
  }>;
  lastMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

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
  isLoading: boolean;
  refreshMessages: () => Promise<void>;
}

const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export const usePublicChat = () => {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error("usePublicChat must be used within PublicChatProvider");
  }
  return context;
};

export const PublicChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(!!user?.id);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
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
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/chat/conversations/${userId}`);
      const fetchedConversations = response.data.conversations || [];
      setConversations(fetchedConversations);
      
      const supportConv = fetchedConversations.find((c: Conversation) => c.type === "user_superadmin");
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
    if (!selectedConversation) return;
    try {
      const response = await api.get(`/chat/messages/${selectedConversation._id}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [selectedConversation]);

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
          return prev.map((conv) => 
            conv._id === newMessage.conversationId 
              ? { ...conv, lastMessage: newMessage.text, updatedAt: new Date().toISOString() } 
              : conv
          ).sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
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
    if (replyTo) formData.append("replyTo", replyTo);
    if (file) formData.append("file", file);

    try {
      const response = await api.post("/chat/message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data;
      if (data.message) {
        socket.emit("send_message", data.message);
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [selectedConversation, userId, user, socket]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!socket) return;
    try {
      await api.delete(`/chat/message/${messageId}`);
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
      const response = await api.post(`/chat/message/${messageId}/react`, { userId, emoji });
      const data = response.data;
      if (data.message) {
        socket.emit("react_message", data.message);
        setMessages((prev) => 
          prev.map(m => m._id === messageId ? data.message : m)
        );
      }
    } catch (error) {
      console.error("Failed to react to message:", error);
    }
  }, [socket, userId]);

  const startConversationWithSuperAdmin = useCallback(async () => {
    if (!userId) return;

    try {
      // Use the api service for consistency and automatic base URL/auth handling
      const saResponse = await api.get("/chat/superadmin");
      const superadmin = saResponse.data.superadmin;

      if (!superadmin) {
        console.error("Superadmin not found in response:", saResponse.data);
        return;
      }

      const response = await api.post("/chat/conversation", {
        type: "user_superadmin",
        participants: [userId, superadmin._id],
        createdBy: userId,
      });

      const data = response.data;
      if (data.conversation) {
        setSelectedConversation(data.conversation);
        setConversations((prev) => {
          const exists = prev.find(c => c._id === data.conversation._id);
          if (exists) return prev;
          return [data.conversation, ...prev];
        });
      }
    } catch (error) {
      console.error("Failed to start conversation with superadmin:", error);
    }
  }, [userId]);

  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  const value: ChatContextType = {
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
    isLoading,
    refreshMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
