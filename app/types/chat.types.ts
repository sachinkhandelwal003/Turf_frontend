export interface User {
  _id: string;
  name: string;
  role: string;
  profilePhoto?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: User;
  senderRole: string;
  text: string;
  file?: {
    url: string;
    name: string;
    type: "image" | "document" | "video" | "audio";
    size: number;
  };
  isDeleted?: boolean;
  reactions?: { userId: string; emoji: string }[];
  replyTo?: Message | string;
  isSeen?: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;

  type: string;

  participants: User[];

  lastMessage: string;

  status: string;

  createdAt: string;

  updatedAt?: string;
}