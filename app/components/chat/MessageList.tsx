import { Message } from "@/app/types/chat.types";
import MessageBubble from "./MessageBubble";
import { useEffect, useRef } from "react";

interface Props {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({
  messages,
  currentUserId,
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
      className="flex-1 p-4 overflow-y-auto scroll-smooth custom-scrollbar"
    >
      <div className="flex flex-col gap-2 min-h-full justify-end">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}