"use client";

import { useState, useRef } from "react";
import { useChat } from "@/app/context/ChatContext";
import { usePublicChat } from "./PublicChatProvider";
import { Image as ImageIcon, X, Smile, Send } from "lucide-react";

export default function MessageInput({ isPublic = false }: { isPublic?: boolean }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const publicContext = isPublic ? usePublicChat() : null;
  const adminContext = !isPublic ? useChat() : null;
  const context = isPublic ? publicContext : adminContext;

  if (!context) return null;

  const { sendMessage } = context;

  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂",
    "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
    "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜",
    "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
    "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙",
    "❤️", "💛", "💚", "💙", "💜", "🖤", "💔", "💕",
    "🔥", "✨", "🎉", "🎊", "💯", "⭐", "🌟", "💫"
  ];

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
    await sendMessage(text, file || undefined);
    setText("");
    setFile(null);
    setPreview(null);
    setShowEmojiPicker(false);
  };

  const addEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-gray-200 relative">
      {preview && (
        <div className="mb-2 relative inline-block">
          <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-300" />
          <button 
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute -top-2 -right-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full p-1 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-full left-3 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50">
          <div 
            className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,0,0,0.2) transparent'
            }}
          >
            {emojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => addEmoji(emoji)}
                className="text-lg p-2 hover:bg-gray-100 rounded-lg transition-all active:scale-95 flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-1.5">
        <div className="flex gap-1 mb-0.5">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <ImageIcon className="w-4.5 h-4.5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </div>
        
        <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2 flex items-center min-h-[40px]">
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
            className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none max-h-24 py-0.5 outline-none"
            rows={1}
          />
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-all"
          >
            <Smile className="w-4.5 h-4.5" />
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() && !file}
          className={`p-2.5 rounded-full transition-all ${
            text.trim() || file 
              ? "bg-gray-600 text-white shadow-sm hover:scale-105 active:scale-95" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
