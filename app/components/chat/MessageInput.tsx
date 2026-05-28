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
    <div className="p-2 sm:p-3 bg-white border-t border-gray-100 relative shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
      {preview && (
        <div className="mb-3 relative inline-block animate-in zoom-in-90 duration-200">
          <img src={preview} alt="Preview" className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-xl border-2 border-[#1abc60]/20 shadow-md" />
          <button 
            onClick={() => { setFile(null); setPreview(null); }}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-all active:scale-90"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-full left-2 right-2 sm:left-3 sm:right-3 mb-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 sm:p-3 z-50 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Emojis</span>
            <button onClick={() => setShowEmojiPicker(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
          <div 
            className="grid grid-cols-8 gap-0.5 sm:gap-1 max-h-40 sm:max-h-48 overflow-y-auto no-scrollbar"
          >
            {emojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => addEmoji(emoji)}
                className="text-lg sm:text-xl p-1.5 sm:p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-125 flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1 sm:p-1.5 pl-2 sm:pl-3 focus-within:border-[#1abc60] focus-within:bg-white transition-all shadow-inner">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 sm:p-2 text-gray-400 hover:text-[#1abc60] hover:bg-[#1abc60]/10 rounded-xl transition-all active:scale-90 flex-shrink-0"
          title="Send Image"
        >
          <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
        
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
          className="flex-1 bg-transparent border-none focus:ring-0 text-[12px] sm:text-[14px] text-gray-700 placeholder:text-gray-400 resize-none max-h-20 sm:max-h-24 py-2 outline-none min-h-[20px]"
          rows={1}
          style={{ scrollbarWidth: 'none' }}
        />
        
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-90 ${showEmojiPicker ? "text-[#1abc60] bg-[#1abc60]/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"}`}
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={handleSend}
            disabled={!text.trim() && !file}
            className={`p-1.5 sm:p-2.5 rounded-xl transition-all shadow-md ${
              text.trim() || file 
                ? "bg-[#1abc60] text-white hover:bg-[#169c4e] active:scale-95 translate-x-0" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
            }`}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
