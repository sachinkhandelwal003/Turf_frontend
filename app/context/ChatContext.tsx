"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { Conversation, Message } from "@/app/types/chat.types";
import { 
  getConversations, 
  getMessages, 
  sendMessage as sendMessageApi, 
  getSuperAdmin, 
  createConversation,
  deleteMessage as deleteMessageApi,
  reactToMessage as reactToMessageApi
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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children, userId }: { children: ReactNode; userId: string }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const data = await getConversations(userId);
        const fetchedConversations = data.conversations || [];
        setConversations(fetchedConversations);
        
        // Auto-select "user_superadmin" conversation if it exists
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
  }, [userId]);

  useEffect(() => {
    if (!selectedConversation || !socket) return;

    const fetchMessages = async () => {
      try {
        const data = await getMessages(selectedConversation._id);
        setMessages(data.messages || []);
        socket.emit("join_conversation", selectedConversation._id);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    socket.on("receive_message", (newMessage: Message) => {
      // Check if message is for the current selected conversation
      const isForCurrent = selectedConversation && newMessage.conversationId === selectedConversation._id;
      
      if (isForCurrent) {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        // Show popup notification for background messages
        const senderName = newMessage.senderId?.name || "Someone";
        toast.success(`New message from ${senderName}`, {
          description: newMessage.text.substring(0, 30) + (newMessage.text.length > 30 ? '...' : ''),
        });
      }
      
      // Update last message and updatedAt in conversation list for all incoming messages
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

  const sendMessage = async (text: string, file?: File, replyTo?: string) => {
    if (!selectedConversation || !userId || !socket || !user) return;

    const messageData = {
      conversationId: selectedConversation._id,
      senderId: userId,
      senderRole: user.role,
      text,
      file,
      replyTo,
    };

    try {
      const response = await sendMessageApi(messageData);
      socket.emit("send_message", response.message);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
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
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
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
  };

  const startConversationWithSuperAdmin = async () => {
    if (!userId) return;

    try {
      const { superadmin } = await getSuperAdmin();
      if (!superadmin) return;

      const response = await createConversation({
        type: "user_superadmin",
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
  };

  const startConversationWithAdmin = async (adminId: string) => {
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
  };

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
