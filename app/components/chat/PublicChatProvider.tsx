"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
    const socketUrl = apiUrl.replace("/api", "");
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/chat/conversations/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        const fetchedConversations = data.conversations || [];
        setConversations(fetchedConversations);
        
        const supportConv = fetchedConversations.find((c: Conversation) => c.type === "user_superadmin");
        if (supportConv) {
          setSelectedConversation(supportConv);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedConversation || !socket) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/chat/messages/${selectedConversation._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setMessages(data.messages || []);
        socket.emit("join_conversation", selectedConversation._id);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    socket.on("receive_message", (newMessage: Message) => {
      const isForCurrent = selectedConversation && newMessage.conversationId === selectedConversation._id;
      
      if (isForCurrent) {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        const senderName = newMessage.senderId?.name || "Someone";
        toast.success(`New message from ${senderName}`, {
          description: newMessage.text.substring(0, 30) + (newMessage.text.length > 30 ? '...' : ''),
        });
      }
      
      setConversations((prev) => 
        prev.map((conv) => 
          conv._id === newMessage.conversationId 
            ? { ...conv, lastMessage: newMessage.text, updatedAt: new Date().toISOString() } 
            : conv
        ).sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      );
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
  }, [selectedConversation, socket]);

  const sendMessage = useCallback(async (text: string, file?: File, replyTo?: string) => {
    if (!selectedConversation || !user?.id || !socket || !user) return;

    const formData = new FormData();
    formData.append("conversationId", selectedConversation._id);
    formData.append("senderId", user.id);
    formData.append("senderRole", user.role);
    formData.append("text", text);
    if (replyTo) formData.append("replyTo", replyTo);
    if (file) formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/chat/message`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await response.json();
      if (data.message) {
        socket.emit("send_message", data.message);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [selectedConversation, user, socket]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!socket) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/chat/message/${messageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      socket.emit("delete_message", { messageId, conversationId: selectedConversation?._id });
      
      setMessages((prev) => 
        prev.map(m => m._id === messageId ? { ...m, isDeleted: true, text: "This message was deleted", file: undefined } : m)
      );
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  }, [socket, selectedConversation]);

  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    if (!socket || !user?.id) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/chat/message/${messageId}/react`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId: user.id, emoji }),
        }
      );
      const data = await response.json();
      if (data.message) {
        socket.emit("react_message", data.message);
        setMessages((prev) => 
          prev.map(m => m._id === messageId ? data.message : m)
        );
      }
    } catch (error) {
      console.error("Failed to react to message:", error);
    }
  }, [socket, user]);

  const startConversationWithSuperAdmin = useCallback(async () => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/chat/conversation`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: "user_superadmin",
            participants: [user.id],
            createdBy: user.id,
          }),
        }
      );
      const data = await response.json();
      if (data.conversation) {
        setSelectedConversation(data.conversation);
        setConversations((prev) => {
          const exists = prev.find(c => c._id === data.conversation._id);
          if (exists) return prev;
          return [data.conversation, ...prev];
        });
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [user]);

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
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
