"use client";

import { Message } from "@/app/types/chat.types";
import { useChat } from "@/app/context/ChatContext";
import { usePublicChat } from "./PublicChatProvider";
import { useState } from "react";
import { Trash2, Smile, File as FileIcon, Download, CheckCheck } from "lucide-react";

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
  const publicContext = isPublic ? usePublicChat() : null;
  const adminContext = !isPublic ? useChat() : null;
  
  const context = isPublic ? publicContext : adminContext;
  
  const { deleteMessage, reactToMessage } = context || { 
    deleteMessage: async () => {}, 
    reactToMessage: async () => {}
  };

  const isSender = message.senderId?._id === currentUserId;
  const [showReactions, setShowReactions] = useState(false);

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👀", "🙏", "👏"];

  if (message.isDeleted) {
    return (
      <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}>
        <div className="bg-gray-100 text-gray-400 text-xs italic py-2 px-4 rounded-2xl border border-gray-200">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2 px-1`}>
      <div className={`flex flex-col max-w-[88%] sm:max-w-[78%] ${isSender ? "items-end" : "items-start"}`}>
        <div className="flex items-end gap-1.5">
          {!isSender && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0 border-2 border-white shadow-sm overflow-hidden">
              {message.senderId?.profilePhoto ? (
                <img src={message.senderId.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                message.senderId?.name?.[0]?.toUpperCase() || "?"
              )}
            </div>
          )}

          <div className="relative group">
            <div
              className={`py-2.5 px-3.5 rounded-2xl shadow-sm ${
                isSender
                  ? "bg-gray-600 text-white rounded-tr-sm"
                  : "bg-white text-gray-800 rounded-tl-sm border border-gray-200"
              }`}
            >
              {!isSender && (
                <p className="text-[11px] font-semibold mb-0.5 opacity-90">
                  {message.senderId?.name || "User"}
                </p>
              )}
              
              {message.file && (
                <div className="mb-2 rounded-lg overflow-hidden border border-gray-200/50">
                  {message.file.type.startsWith("image/") ? (
                    <img src={message.file.url} alt="" className="max-w-full h-auto block rounded-md" />
                  ) : (
                    <div className="bg-gray-50 p-2.5 flex items-center gap-2">
                      <FileIcon className="w-4.5 h-4.5 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{message.file.name}</p>
                        <p className="text-[10px] opacity-60">{(message.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <a href={message.file.url} download target="_blank" className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                        <Download className="w-3.5 h-3.5 text-gray-600" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {message.text && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
              )}
              
              <div className={`flex items-center gap-1 mt-1 ${isSender ? "justify-end" : "justify-start"}`}>
                <span className="text-[10px] opacity-70">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {isSender && (
                  <CheckCheck className="w-3 h-3 opacity-70" />
                )}
              </div>
            </div>

            {message.reactions && message.reactions.length > 0 && (
              <div className={`flex flex-wrap gap-1 mt-1 ${isSender ? "justify-end" : "justify-start"}`}>
                {message.reactions.map((r, i) => (
                  <span key={i} className="bg-gray-100 border border-gray-300 shadow-sm rounded-full px-1.5 py-0.5 text-xs">
                    {r.emoji}
                  </span>
                ))}
              </div>
            )}

            <div className={`absolute top-1/2 -translate-y-1/2 ${isSender ? "-left-12" : "-right-12"} hidden group-hover:flex items-center gap-0.5 bg-white shadow-lg border border-gray-300 rounded-full p-0.5 z-20`}>
              <button 
                onClick={() => setShowReactions(!showReactions)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                title="React"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
              {isSender && (
                <button 
                  onClick={() => deleteMessage(message._id)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {showReactions && (
              <div className={`absolute bottom-full mb-2 ${isSender ? "right-0" : "left-0"} bg-white shadow-xl border border-gray-300 rounded-xl p-1.5 flex gap-0.5 z-30`}>
                {emojis.map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => {
                      reactToMessage(message._id, emoji);
                      setShowReactions(false);
                    }}
                    className="hover:scale-125 transition-transform p-1.5 text-base hover:bg-gray-100 rounded-full"
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
