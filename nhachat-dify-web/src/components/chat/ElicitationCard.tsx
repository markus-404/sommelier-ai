"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import type { ElicitationQuestion } from "@/types/chat";

interface ElicitationCardProps {
  payload: ElicitationQuestion;
  onSelect: (value: string) => void;
  onFreeform: (text: string) => void;
  onSkip: () => void;
  disabled?: boolean;
}

export default function ElicitationCard({
  payload,
  onSelect,
  onFreeform,
  onSkip,
  disabled = false,
}: ElicitationCardProps) {
  const [submitted, setSubmitted] = useState(false);
  const [freeformText, setFreeformText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isLocked = submitted || disabled;

  const handleSelect = (value: string) => {
    if (isLocked) return;
    setSubmitted(true);
    onSelect(value);
  };

  const handleFreeformSubmit = () => {
    const trimmed = freeformText.trim();
    if (isLocked || !trimmed) return;
    setSubmitted(true);
    setFreeformText("");
    onFreeform(trimmed);
  };

  const handleFreeformKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFreeformSubmit();
    }
  };

  const handleSkip = () => {
    if (isLocked) return;
    setSubmitted(true);
    onSkip();
  };

  return (
    <div
      className={`w-full bg-white border border-brand-border rounded-3xl rounded-tl-none wine-card-shadow overflow-hidden transition-opacity duration-300 ${
        isLocked ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Question */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-[15px] font-semibold text-brand-text leading-snug">
          {payload.question}
        </p>
      </div>

      {/* Option rows */}
      <div className="border-t border-brand-border">
        {payload.options.map((opt, i) => (
          <button
            key={opt.value}
            role="button"
            tabIndex={isLocked ? -1 : 0}
            onClick={() => handleSelect(opt.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect(opt.value);
              }
            }}
            disabled={isLocked}
            className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-inset ${
              i > 0 ? "border-t border-brand-border" : ""
            } ${
              isLocked
                ? "cursor-not-allowed"
                : "hover:bg-brand-cream/80 active:bg-brand-border/60 active:scale-[0.99] cursor-pointer"
            }`}
          >
            <span className="text-[11px] font-bold text-brand-text-muted/60 w-5 flex-shrink-0 tabular-nums">
              {i + 1}.
            </span>
            <span className="text-[14px] font-medium text-brand-text leading-snug">
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {/* Freeform row — only when allow_freeform */}
      {payload.allow_freeform && (
        <div className="border-t border-brand-border bg-brand-cream/50 px-4 py-3 flex items-center gap-2">
          <label htmlFor={`freeform-${payload.question_type}`} className="sr-only">
            Lựa chọn khác
          </label>
          <input
            id={`freeform-${payload.question_type}`}
            ref={inputRef}
            type="text"
            value={freeformText}
            onChange={(e) => setFreeformText(e.target.value)}
            onKeyDown={handleFreeformKeyDown}
            placeholder="Nhập câu trả lời của Quý khách..."
            disabled={isLocked}
            tabIndex={isLocked ? -1 : 0}
            className="flex-1 bg-transparent outline-none text-[13px] text-brand-text placeholder-brand-text-muted/50 font-medium disabled:cursor-not-allowed"
          />
          <button
            onClick={handleFreeformSubmit}
            disabled={isLocked || !freeformText.trim()}
            tabIndex={isLocked ? -1 : 0}
            className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
              freeformText.trim() && !isLocked
                ? "wine-gradient text-white shadow-sm hover:shadow-md active:scale-95"
                : "bg-brand-border/50 text-brand-text-muted/40 cursor-not-allowed"
            }`}
          >
            <Send size={14} />
          </button>
        </div>
      )}

      {/* Skip button — only when skippable */}
      {payload.skippable && (
        <div className="px-5 py-2.5 flex justify-end border-t border-brand-border/40">
          <button
            onClick={handleSkip}
            disabled={isLocked}
            tabIndex={isLocked ? -1 : 0}
            className={`text-[12px] font-medium text-brand-text-muted transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:rounded ${
              isLocked ? "cursor-not-allowed" : "hover:text-brand-red"
            }`}
          >
            Bỏ qua
          </button>
        </div>
      )}
    </div>
  );
}
