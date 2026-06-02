import { Message } from "@/app/types/chat.types";
import MessageBubble from "./MessageBubble";
import { useEffect, useRef } from "react";

interface Props {
  messages: Message[];
  currentUserId: string;
  isPublic?: boolean;
}

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
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
      className="flex-1 p-2 md:p-4 overflow-y-auto scroll-smooth custom-scrollbar"
    >
      <div className="flex flex-col gap-1.5 md:gap-2 min-h-full justify-end">
        {messages.map((message, index) => {
          const currentDate = new Date(message.createdAt).toDateString();
          const previousDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
          const showDateHeader = currentDate !== previousDate;

          return (
            <div key={message._id} className="w-full flex flex-col">
              {showDateHeader && (
                <div className="w-full flex justify-center my-3 md:my-4">
                  <div className="bg-gray-100 border border-gray-200 text-gray-500 text-[10px] md:text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                    {formatDateLabel(message.createdAt)}
                  </div>
                </div>
              )}
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