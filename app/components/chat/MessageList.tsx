import { Message } from "@/app/types/chat.types";
import MessageBubble from "./MessageBubble";
import { useEffect, useRef } from "react";

interface Props {
  messages: Message[];
  currentUserId: string;
  isPublic?: boolean;
}

export default function MessageList({
  messages,
  currentUserId,
  isPublic = false
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // EMPTY STATE
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No messages yet
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 p-4 overflow-y-auto scroll-smooth custom-scrollbar bg-gray-50/30"
    >
      <div className="flex flex-col gap-1 min-h-full justify-end pb-2">
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const isSameSender = prevMessage?.senderId?._id === message.senderId?._id;
          
          return (
            <div key={message._id} className={isSameSender ? "mt-0.5" : "mt-4"}>
              <MessageBubble
                message={message}
                currentUserId={currentUserId}
                isPublic={isPublic}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}