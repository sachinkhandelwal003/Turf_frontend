import { Message } from "@/app/types/chat.types";
import { useChat } from "@/app/context/ChatContext";
import { useState } from "react";
import { Trash2, Reply, Smile, MoreVertical, File as FileIcon, Download } from "lucide-react";

interface Props {
  message: Message;
  currentUserId: string;
}

export default function MessageBubble({
  message,
  currentUserId,
}: Props) {
  const { deleteMessage, reactToMessage } = useChat();
  const [showOptions, setShowOptions] = useState(false);
  const isMine = message.senderId?._id === currentUserId;

  const getFileUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    return `${baseUrl}${url}`;
  };

  const handleReaction = (emoji: string) => {
    reactToMessage(message._id, emoji);
    setShowOptions(false);
  };

  return (
    <div className={`mb-4 flex flex-col group ${isMine ? "items-end" : "items-start"}`}>
      <div className={`flex items-end gap-2 max-w-[85%] ${isMine ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-400 overflow-hidden ring-1 ring-white">
          {message.senderId?.profilePhoto ? (
            <img src={message.senderId.profilePhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            message.senderId?.name?.[0] || "?"
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          {/* Message Content Container */}
          <div className="relative group/content">
            {/* Reply Indicator */}
            {message.replyTo && typeof message.replyTo !== 'string' && (
              <div className={`text-[10px] p-2 mb-[-8px] pb-3 rounded-t-xl bg-black/5 border-l-2 border-primary max-w-full truncate opacity-80 ${isMine ? 'text-right' : 'text-left'}`}>
                <span className="font-bold">Replying to: </span>
                {message.replyTo.text}
              </div>
            )}

            <div
              className={`
                px-4
                py-2.5
                rounded-2xl
                text-sm
                shadow-sm
                animate-in fade-in zoom-in-95 duration-200
                ${
                  isMine
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                }
                ${message.isDeleted ? "italic opacity-60" : ""}
              `}
            >
              {!isMine && !message.replyTo && (
                <p className="text-[10px] font-bold opacity-70 mb-1">
                  {message.senderId?.name}
                </p>
              )}

              {/* File Content */}
              {!message.isDeleted && message.file && (
                <div className="mb-2">
                  {message.file.type === "image" ? (
                    <a href={getFileUrl(message.file.url)} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={getFileUrl(message.file.url)} 
                        alt={message.file.name} 
                        className="max-w-full rounded-lg border border-white/20 hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${isMine ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`p-2 rounded-lg ${isMine ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                        <FileIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{message.file.name}</p>
                        <p className="text-[10px] opacity-70">{(message.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <a 
                        href={getFileUrl(message.file.url)} 
                        download 
                        className={`p-1.5 rounded-full hover:bg-black/5 transition-colors ${isMine ? 'text-white' : 'text-primary'}`}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
            </div>

            {/* Reactions Overlay */}
            {message.reactions && message.reactions.length > 0 && (
              <div className={`absolute -bottom-2 flex flex-wrap gap-1 ${isMine ? 'right-0' : 'left-0'}`}>
                {message.reactions.map((r, i) => (
                  <span key={i} className="bg-white rounded-full px-1.5 py-0.5 text-[10px] shadow-sm border border-gray-100 animate-in zoom-in-50">
                    {r.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (Visible on Hover) */}
        {!message.isDeleted && (
          <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 !bg-transparent hover:!bg-gray-100 rounded-full !text-gray-400 hover:!text-gray-600 transition-all !shadow-none"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
            {/* <button 
              onClick={() => setReplyingTo(message)}
              className="p-1.5 !bg-transparent hover:!bg-gray-100 rounded-full !text-gray-400 hover:!text-gray-600 transition-all !shadow-none"
            >
              <Reply className="w-3.5 h-3.5" />
            </button> */}
            {isMine && (
              <button 
                onClick={() => deleteMessage(message._id)}
                className="p-1.5 !bg-transparent hover:!bg-red-50 rounded-full !text-gray-400 hover:!text-red-500 transition-all !shadow-none"
                title="Unsend"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reaction Picker Popup */}
      {showOptions && (
        <div className={`mt-2 p-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 flex gap-1 z-10 animate-in slide-in-from-top-2 ${isMine ? 'mr-10' : 'ml-10'}`}>
          {['❤️', '👍', '😂', '😮', '😢', '🔥'].map(emoji => (
            <button 
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-sm hover:scale-125"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <span className="text-[10px] text-gray-400 mt-1.5 px-10">
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}