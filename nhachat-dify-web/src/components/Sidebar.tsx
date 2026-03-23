import { Plus, Wine, Info, Key, MessageSquare, History } from "lucide-react";

interface SidebarProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export default function Sidebar({ apiKey, setApiKey }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-brand-cream-sidebar border-r border-brand-border px-4 py-8">
      {/* Brand Identity */}
      <div className="flex items-center gap-4 mb-12 px-2 group cursor-pointer">
        <div className="w-12 h-12 wine-gradient text-white rounded-2xl shadow-xl flex items-center justify-center transform transition-transform group-hover:rotate-6 duration-300">
          <Wine size={28} />
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
      <button className="flex items-center justify-center gap-3 w-full py-4 px-6 wine-gradient text-white rounded-[1.25rem] transition-all duration-300 shadow-xl hover:shadow-brand-red/30 font-bold active:scale-95 mb-10 group">
        <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        <span className="text-sm tracking-wide">Cuộc trò chuyện mới</span>
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
          <button className="group flex items-center gap-3 text-left py-3.5 px-4 rounded-2xl hover:bg-white/80 text-brand-text text-[13px] font-medium transition-all border border-transparent hover:border-brand-border wine-card-shadow overflow-hidden">
            <MessageSquare size={16} className="text-brand-red opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            <span className="truncate group-hover:-translate-x-1 transition-transform">Gợi ý vang đỏ cho Steak</span>
          </button>
          
          <div className="mt-8 flex flex-col items-center justify-center p-6 border-2 border-dashed border-brand-border rounded-3xl opacity-40">
            <Wine size={24} className="mb-2 text-brand-gold" />
            <span className="text-[10px] text-center font-medium">Bắt đầu trò chuyện để lưu lịch sử</span>
          </div>
        </div>
      </nav>

      {/* Footer Area */}
      <div className="mt-auto pt-6 flex flex-col gap-5 border-t border-brand-border/50">
        {/* API Settings */}
        <div className="bg-white/50 border border-brand-border rounded-3xl p-4 backdrop-blur-sm wine-card-shadow">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Key size={14} className="text-brand-gold" />
            <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">Dify Secret</span>
          </div>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Nhập API Key tại đây..."
            className="w-full bg-white text-brand-text border border-brand-border text-xs px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all placeholder:text-brand-text-muted/50"
          />
        </div>

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
