import React from 'react';
import { MessageSquare } from 'lucide-react';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export default function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
      <div className="w-full mb-1 flex items-center gap-2 text-[10px] font-bold text-brand-gold uppercase tracking-widest px-1">
        <MessageSquare size={12} />
        <span>Gợi ý cho bạn</span>
      </div>
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelect(question)}
          className="bg-white hover:bg-brand-cream-sidebar text-brand-text border border-brand-border px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 hover:border-brand-gold hover:text-brand-red shadow-sm hover:shadow-md active:scale-95"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
