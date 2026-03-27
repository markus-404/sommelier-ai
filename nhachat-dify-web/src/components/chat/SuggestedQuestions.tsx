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
      <div className="flex flex-wrap gap-2 w-full pb-1">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-[#6b5850] border border-[#e6d8c8] px-3 md:px-4 py-[6px] md:py-[7px] rounded-full text-[12px] md:text-[13px] font-medium transition-all duration-300 hover:border-brand-gold hover:text-brand-red shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
