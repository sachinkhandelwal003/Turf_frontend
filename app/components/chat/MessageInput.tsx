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
        <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between border-l-4 border-[#1abc60]">
          <div className="text-xs truncate">
            <span className="font-bold text-[#1abc60]">Replying to:</span> {replyingTo.text}
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {preview && (
        <div className="mb-2 relative inline-block">
          <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
          <button 
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex gap-1 mb-1">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-[#1abc60] transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>
        
        <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 flex items-center min-h-[44px]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none max-h-32 py-1 outline-none"
            rows={1}
          />
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() && !file}
          className={`p-3 rounded-full transition-all ${
            text.trim() || file 
              ? "bg-[#1abc60] text-white shadow-md hover:scale-105 active:scale-95" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
