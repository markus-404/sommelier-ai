"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, MessageSquareText, Check } from "lucide-react";

interface FeedbackCollectorProps {
  messageId: string;
  onFeedback: (messageId: string, rating: "up" | "down", tags?: string[]) => void;
}

export const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({ messageId, onFeedback }) => {
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (r: "up" | "down") => {
    setRating(r);
    if (r === "up") {
      onFeedback(messageId, "up");
      setSubmitted(true);
    }
  };

  const handleDetailedFeedback = (tag: string) => {
    onFeedback(messageId, rating || "down", [tag]);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 mt-2 ml-4 text-[10px] text-gold/60 uppercase tracking-widest font-mono"
      >
        <Check className="w-3 h-3" />
        Đã gửi phản hồi. Cảm ơn bạn!
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-3 mt-2 ml-4">
      <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
        <button
          onClick={() => handleRating("up")}
          className={`p-1.5 rounded-full transition-all ${rating === "up" ? "bg-green-500/20 text-green-400" : "hover:bg-white/10 text-white/30"}`}
        >
          <ThumbsUp className="w-3 h-3" />
        </button>
        <div className="w-[1px] bg-white/10 self-stretch my-1" />
        <button
          onClick={() => handleRating("down")}
          className={`p-1.5 rounded-full transition-all ${rating === "down" ? "bg-red-500/20 text-red-400" : "hover:bg-white/10 text-white/30"}`}
        >
          <ThumbsDown className="w-3 h-3" />
        </button>
      </div>

      <AnimatePresence>
        {rating === "down" && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            {["Chưa đúng ý", "Giá cao", "Ít thông tin"].map((tag) => (
              <button
                key={tag}
                onClick={() => handleDetailedFeedback(tag)}
                className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/40 hover:border-gold/30 hover:text-gold transition-all"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
