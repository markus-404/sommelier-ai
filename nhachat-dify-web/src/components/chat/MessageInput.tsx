"use client";

import { Send, Image as ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className={`relative flex items-end bg-white border-2 ${disabled ? 'border-brand-border opacity-70' : 'border-brand-border focus-within:border-brand-gold'} rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 px-2 py-2`}>
        {/* Attachment Button */}
        <button 
          title="Tải ảnh lên (Sắp ra mắt)"
          className="p-3 text-brand-text-muted hover:text-brand-red transition-colors disabled:opacity-50 flex-shrink-0"
          type="button"
          disabled={disabled}
        >
          <ImageIcon size={22} />
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi Nhà Chát về rượu vang..."
          className="w-full max-h-48 min-h-[44px] py-3 px-3 bg-transparent resize-none outline-none text-brand-text font-medium placeholder-[#a39485] leading-relaxed"
          rows={1}
          disabled={disabled}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className={`p-3 m-1 rounded-full transition-all duration-300 transform active:scale-95 flex-shrink-0 ${
            text.trim() && !disabled 
              ? "wine-gradient text-white shadow-lg hover:shadow-brand-red/20" 
              : "bg-brand-cream text-brand-text-muted cursor-not-allowed"
          }`}
          title="Gửi tin nhắn"
        >
          <Send size={20} className={text.trim() && !disabled ? "animate-in slide-in-from-left-1" : ""} />
        </button>
      </div>

      <p className="text-center text-[11px] font-medium text-brand-text-muted tracking-wide uppercase opacity-60">
        Taste the Excellence • <span className="text-brand-red">Nha Chat Sommelier</span>
      </p>
    </div>
  );
}
