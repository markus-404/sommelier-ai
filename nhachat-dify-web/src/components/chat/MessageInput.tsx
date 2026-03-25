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
    <div className="w-full flex flex-col gap-3 group">
      <div className={`relative flex items-end bg-white/80 backdrop-blur-xl border-2 ${disabled ? 'border-brand-border opacity-70' : 'border-brand-border/60 focus-within:border-brand-gold focus-within:shadow-2xl focus-within:shadow-brand-gold/10'} rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-500 pl-5 pr-3 py-2.5`}>
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hãy để Sommelier dẫn lối quý khách..."
          className="w-full max-h-48 min-h-[44px] py-3 bg-transparent resize-none outline-none text-brand-text font-medium placeholder-[#a39485]/60 leading-relaxed text-[15px]"
          rows={1}
          disabled={disabled}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className={`p-3.5 rounded-full transition-all duration-500 transform active:scale-90 flex-shrink-0 shadow-sm ${
            text.trim() && !disabled 
              ? "wine-gradient text-white shadow-lg shadow-brand-red/20 hover:shadow-brand-red/40 hover:-translate-y-0.5" 
              : "bg-brand-cream text-brand-text-muted cursor-not-allowed opacity-40"
          }`}
          title="Gửi tin nhắn"
        >
          <Send size={18} fill={text.trim() && !disabled ? "currentColor" : "none"} className={text.trim() && !disabled ? "animate-in zoom-in-50" : ""} />
        </button>
      </div>

      <div className="flex justify-center items-center gap-3 opacity-40 group-focus-within:opacity-80 transition-opacity duration-700">
        <div className="h-[1px] w-8 bg-brand-gold"></div>
        <p className="text-center text-[10px] font-bold text-brand-text-muted tracking-[0.2em] uppercase">
          Art of Wine • <span className="text-brand-red">Nha Chat Sommelier</span>
        </p>
        <div className="h-[1px] w-8 bg-brand-gold"></div>
      </div>
    </div>
  );
}
