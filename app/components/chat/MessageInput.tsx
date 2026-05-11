"use client";

import { useState, useRef } from "react";
import { useChat } from "@/app/context/ChatContext";
import { usePublicChat } from "./PublicChatProvider";
import { Image as ImageIcon, Paperclip, X, Smile, Send } from "lucide-react";

export default function MessageInput({ isPublic = false }: { isPublic?: boolean }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Conditionally use the correct hook
  const publicContext = isPublic ? usePublicChat() : null;
  const adminContext = !isPublic ? useChat() : null;
  
  const context = isPublic ? publicContext : adminContext;

  if (!context) return null;

  const { sendMessage, replyingTo, setReplyingTo } = context;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !file) return;
    await sendMessage(text, file || undefined, replyingTo?._id);
    setText("");
    setFile(null);
    setPreview(null);
    setReplyingTo(null);
  };

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
      {replyingTo && (
        <div className="mb-2 p-2 bg-gray-50 rounded-xl flex items-center justify-between border-l-4 border-[#1abc60] animate-in slide-in-from-bottom-2">
          <div className="text-xs truncate text-gray-600">
            <span className="font-bold text-[#1abc60]">Replying to:</span> {replyingTo.text}
          </div>
          <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      
      {preview && (
        <div className="mb-3 relative inline-block group">
          <div className="h-20 w-20 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <button 
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors active:scale-90"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 sm:gap-3">
        <div className="flex gap-1 mb-0.5">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-400 hover:text-[#1abc60] hover:bg-gray-50 rounded-xl transition-all active:scale-95"
            title="Attach File"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>
        
        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-[20px] px-4 py-2 flex items-center min-h-[44px] focus-within:bg-white focus-within:border-[#1abc60]/30 focus-within:ring-4 focus-within:ring-[#1abc60]/5 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a message..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none max-h-32 py-1.5 outline-none text-gray-700 placeholder:text-gray-400"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-200/50 ml-1">
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() && !file}
          className={`p-3.5 rounded-2xl transition-all shrink-0 ${
            text.trim() || file 
              ? "bg-[#1abc60] text-white shadow-lg shadow-[#1abc60]/20 hover:bg-[#16a34a] hover:-translate-y-0.5 active:translate-y-0 active:scale-95" 
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
