"use client";

import { Message } from "@/app/types/chat.types";
import { useChat } from "@/app/context/ChatContext";
import { usePublicChat } from "./PublicChatProvider";
import { useState } from "react";
import { Trash2, Reply, Smile, MoreVertical, File as FileIcon, Download } from "lucide-react";

interface Props {
  message: Message;
  currentUserId: string;
  isPublic?: boolean;
}

export default function MessageBubble({
  message,
  currentUserId,
  isPublic = false
}: Props) {
  // Conditionally use the correct hook
  const publicContext = isPublic ? usePublicChat() : null;
  const adminContext = !isPublic ? useChat() : null;
  
  const context = isPublic ? publicContext : adminContext;
  
  const { deleteMessage, reactToMessage, setReplyingTo } = context || { 
    deleteMessage: async () => {}, 
    reactToMessage: async () => {}, 
    setReplyingTo: () => {} 
  };

  const isSender = message.senderId?._id === currentUserId;
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  if (message.isDeleted) {
    return (
      <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4`}>
        <div className="bg-gray-100 text-gray-400 text-xs italic py-2 px-4 rounded-2xl border border-gray-200">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-4 group relative px-4`}>
      <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isSender ? "items-end" : "items-start"}`}>
        {/* Reply Preview */}
        {message.replyTo && (
          <div className={`mb-[-8px] pb-3 pt-2 px-3 rounded-t-2xl text-[10px] bg-gray-100 text-gray-500 border-l-2 border-[#1abc60] max-w-full truncate opacity-80`}>
            <span className="font-bold block mb-0.5">Replying to:</span>
            {message.replyTo.text}
          </div>
        )}

        <div className="flex items-end gap-2">
          {!isSender && (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0 border border-white shadow-sm overflow-hidden">
              {message.senderId?.profilePhoto ? (
                <img src={message.senderId.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                message.senderId?.name?.[0] || "?"
              )}
            </div>
          )}

          <div className="relative group/bubble">
            <div
              className={`py-2.5 px-4 rounded-2xl shadow-sm ${
                isSender
                  ? "bg-[#1abc60] text-white rounded-tr-none"
                  : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
              }`}
            >
              {!isSender && (
                <p className="text-[10px] font-bold opacity-70 mb-1">
                  {message.senderId?.name || "User"}
                </p>
              )}
              
              {message.file && (
                <div className="mb-2 rounded-lg overflow-hidden border border-black/5">
                  {message.file.type.startsWith("image/") ? (
                    <img src={message.file.url} alt="" className="max-w-full h-auto block" />
                  ) : (
                    <div className="bg-black/5 p-3 flex items-center gap-2">
                      <FileIcon className="w-5 h-5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{message.file.name}</p>
                        <p className="text-[10px] opacity-60">{(message.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <a href={message.file.url} download target="_blank" className="p-1.5 hover:bg-black/10 rounded-full">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
              
              <div className={`flex items-center gap-2 mt-1 opacity-60 text-[10px] ${isSender ? "justify-end" : "justify-start"}`}>
                <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Reactions Display */}
            {message.reactions && message.reactions.length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-1 ${isSender ? "justify-end" : "justify-start"}`}>
                {message.reactions.map((r, i) => (
                  <span key={i} className="bg-white border border-gray-100 shadow-sm rounded-full px-1.5 py-0.5 text-[10px]">
                    {r.emoji}
                  </span>
                ))}
              </div>
            )}

            {/* Hover Actions */}
            <div className={`absolute top-0 ${isSender ? "-left-12" : "-right-12"} hidden group-hover/bubble:flex items-center gap-1 bg-white shadow-lg border border-gray-100 rounded-full p-1 z-20`}>
              <button 
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-yellow-500 transition-colors"
                title="React"
              >
                <Smile className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setReplyingTo(message)}
                className="p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-[#1abc60] transition-colors"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>
              {isSender && (
                <button 
                  onClick={() => deleteMessage(message._id)}
                  className="p-1.5 hover:bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Reaction Picker */}
            {showReactions && (
              <div className={`absolute bottom-full mb-2 ${isSender ? "right-0" : "left-0"} bg-white shadow-xl border border-gray-100 rounded-full p-1.5 flex gap-1 z-30 animate-in zoom-in-90 duration-150`}>
                {emojis.map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => {
                      reactToMessage(message._id, emoji);
                      setShowReactions(false);
                    }}
                    className="hover:scale-125 transition-transform p-1 text-base"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
