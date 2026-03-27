import React from 'react';
import { MessageSquare } from 'lucide-react';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="w-full mb-2 flex items-center gap-2 text-[10px] font-bold text-brand-gold uppercase tracking-widest px-1">
        <MessageSquare size={12} />
        <span>Gợi ý cho bạn</span>
      </div>
      <div className="flex overflow-x-auto gap-2 pb-2 snap-x whitespace-nowrap scrollbar-hide w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}</style>
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="shrink-0 snap-start bg-white/90 backdrop-blur-sm hover:bg-white text-[#6b5850] border border-[#e6d8c8] px-4 py-[7px] rounded-full text-[13px] font-medium transition-all duration-300 hover:border-brand-gold hover:text-brand-red shadow-sm hover:shadow-md active:scale-95"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
