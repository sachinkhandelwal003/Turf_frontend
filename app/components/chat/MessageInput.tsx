"use client";

import { useState, useRef } from "react";
import { useChat } from "@/app/context/ChatContext";
import { Image as ImageIcon, Paperclip, X, Smile, Send } from "lucide-react";

export default function MessageInput() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, replyingTo, setReplyingTo } = useChat();

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

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!text.trim() && !file) return;

    await sendMessage(text, file || undefined, replyingTo?._id);
    setText("");
    removeFile();
    setReplyingTo(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t bg-white">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="mb-3 p-2 bg-primary/5 border-l-4 border-primary rounded-r-lg flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-primary uppercase">Replying to {replyingTo.senderId?.name}</p>
            <p className="text-xs text-gray-600 truncate">{replyingTo.text}</p>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-primary/10 rounded-full text-primary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* File Preview */}
      {(preview || file) && (
        <div className="mb-3 p-2 bg-gray-50 rounded-xl flex items-center gap-3 relative group animate-in slide-in-from-bottom-2 border border-gray-100">
          <div className="relative shrink-0">
            {preview ? (
              <img src={preview} alt="Preview" className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-white shadow-sm" />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Paperclip className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
            <button 
              onClick={removeFile}
              className="absolute -top-2 -right-2 p-1 bg-white shadow-md hover:bg-red-50 hover:text-red-600 rounded-full transition-all border border-gray-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold truncate text-gray-800">{file?.name}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">{(file!.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 !bg-transparent !text-gray-400 hover:!text-primary hover:!bg-gray-100 rounded-full transition-all !shadow-none"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <div className="flex-1 relative">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all pr-10"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 !bg-transparent !text-gray-400 hover:!text-amber-500 transition-colors !shadow-none !p-0">
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() && !file}
          className="!bg-primary !text-white !p-2.5 !m-0 rounded-xl font-medium hover:!bg-primary/90 disabled:opacity-50 transition-all shadow-md shadow-primary/10 active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}