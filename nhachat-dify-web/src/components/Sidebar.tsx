import { Plus, Wine, Info, Key, MessageSquare, History } from "lucide-react";

import { ChatSession } from "@/app/page";

interface SidebarProps {
  sessions?: ChatSession[];
  currentSessionId?: string | null;
  onNewChat?: () => void;
  onSwitchSession?: (sessionId: string) => void;
  onSelectQuestion?: (question: string) => void;
}

export default function Sidebar({ sessions, currentSessionId, onNewChat, onSwitchSession, onSelectQuestion }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-brand-cream-sidebar border-r border-brand-border px-4 py-8">
      {/* Brand Identity */}
      <div 
        className="flex items-center gap-4 mb-12 px-2 group cursor-pointer"
        onClick={onNewChat}
      >
        <div className="w-12 h-12 rounded-2xl shadow-[0_10px_20px_-5px_rgba(155,28,49,0.3)] flex items-center justify-center overflow-hidden transform transition-all group-hover:scale-105 duration-500 border border-brand-gold/30">
          <img src="/nha-chat-logo.png" alt="Nhà Chát" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-serif font-black text-2xl text-brand-red tracking-tight leading-none italic">
            Nhà Chát
          </h1>
          <span className="block text-[10px] font-bold text-brand-gold uppercase tracking-[0.25em] mt-1.5 opacity-80">
            Elite Sommelier
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <button 
        className="flex items-center justify-center gap-2.5 w-full py-4 px-4 wine-gradient text-white rounded-[1.25rem] transition-all duration-300 shadow-xl hover:shadow-brand-red/30 font-bold active:scale-95 mb-10 group whitespace-nowrap overflow-hidden"
        onClick={onNewChat}
      >
        <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500 shrink-0" />
        <span className="text-[13px] tracking-wide truncate">Cuộc trò chuyện mới</span>
      </button>

      {/* Navigation / History */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-1">
        <div className="flex items-center gap-2 mb-6 px-2 opacity-60">
          <History size={14} className="text-brand-gold" />
          <span className="text-[10px] font-black text-brand-text uppercase tracking-[0.2em]">
            Lịch sử gần đây
          </span>
        </div>
        
        <div className="flex flex-col gap-3">
          {(!sessions || sessions.length === 0) ? (
            <div className="mt-8 flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-border rounded-3xl opacity-40">
              <Wine size={24} className="mb-2 text-brand-gold" />
              <span className="text-[10px] text-center font-medium">Bắt đầu trò chuyện để lưu lịch sử</span>
            </div>
          ) : (
            sessions.map((session) => (
              <button 
                key={session.id}
                className={`group flex items-center gap-3 text-left py-3.5 px-4 rounded-2xl text-[13px] font-medium transition-all border overflow-hidden ${currentSessionId === session.id ? 'bg-white text-brand-red border-brand-gold wine-card-shadow' : 'hover:bg-white/80 text-brand-text border-transparent hover:border-brand-border'}`}
                onClick={() => onSwitchSession?.(session.id)}
              >
                <History size={16} className={`${currentSessionId === session.id ? 'text-brand-red' : 'opacity-30 group-hover:opacity-100'} transition-opacity flex-shrink-0`} />
                <span className="truncate flex-1">{session.title}</span>
              </button>
            ))
          )}
        </div>
      </nav>

      {/* Footer Area */}
      <div className="mt-auto pt-6 flex flex-col gap-5 border-t border-brand-border/50">
        {/* Regulatory Disclaimer */}
        <div className="bg-brand-red/5 border border-brand-red/10 rounded-3xl p-4">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-brand-red mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-tight">Cảnh báo sức khỏe</span>
              <p className="text-[10px] leading-relaxed text-brand-text-muted font-medium">
                Sản phẩm dành cho người trên 18 tuổi. Uống rượu bia có trách nhiệm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
