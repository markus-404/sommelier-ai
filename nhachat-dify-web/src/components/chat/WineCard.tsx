import React from 'react';
import { ExternalLink, ShoppingCart, MapPin, Utensils, Wine, Sparkles } from 'lucide-react';

export interface WineProduct {
  name: string;
  price: string;
  image?: string;
  type?: string;
  description?: string;
  origin?: string;
  pairings?: string[];
  link: string;
}

export default function WineCard({ product }: { product: WineProduct }) {
  return (
    <div className="relative w-full max-w-xl my-6 overflow-hidden bg-white/95 backdrop-blur-2xl border border-brand-gold/40 rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] transition-all duration-700 hover:shadow-[0_40px_70px_-15px_rgba(184,134,11,.2)] hover:-translate-y-2 group group-hover:bg-white">
      
      {/* Decorative Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] opacity-30 z-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row h-full">
        {/* Left: Image / Visual Section */}
        <div className="md:w-[40%] p-6 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-brand-cream-sidebar/20 to-brand-cream-sidebar/60 border-b md:border-b-0 md:border-r border-brand-gold/10">
          <div className="absolute top-4 left-4 bg-gradient-to-r from-brand-red to-[#5a1c24] text-white text-[9px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-[0.25em] shadow-xl flex items-center gap-1">
            <Sparkles size={10} className="text-brand-gold fill-brand-gold" />
            Đề xuất
          </div>
          
          <div className="relative w-36 h-48 md:h-64 mt-4 lg:mt-0 flex items-center justify-center transform transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_25px_25px_rgba(0,0,0,0.25)]"
              />
            ) : (
              // Enhanced Premium Placeholder
              <div className="w-24 h-48 rounded-t-[3rem] rounded-b-xl bg-gradient-to-b from-[#2a1b15] to-[#1a100d] flex items-center justify-center shadow-[0_20px_30px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute -left-10 top-16 w-40 h-4 bg-white/10 -rotate-45 blur-[4px]" />
                <Wine size={38} className="text-brand-gold/90 absolute top-8 drop-shadow-md stroke-[1.5]" />
                <div className="absolute bottom-6 border border-brand-gold/50 text-brand-gold/90 text-[8px] uppercase tracking-[0.3em] px-2 py-0.5 rounded-sm font-bold bg-black/40 backdrop-blur-md">
                  Nhà Chát
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Content Section */}
        <div className="md:w-[60%] p-7 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[9px] font-bold text-brand-text-muted uppercase tracking-[0.2em] bg-brand-gold/10 px-3 py-1.5 rounded-md border border-brand-gold/20">
                {product.type || "Rượu Vang Chính Hãng"}
              </span>
            </div>

            <h3 className="font-serif font-black text-[#2a1b15] text-[22px] leading-[1.2] mb-3 group-hover:text-brand-red transition-colors duration-400">
              {product.name}
            </h3>
            
            <div className="mb-5 border-b border-brand-gold/20 pb-4 inline-block">
              <span className="text-[28px] font-serif font-black text-brand-red tracking-tight drop-shadow-sm">
                {product.price}
              </span>
            </div>

            {product.description && (
              <p className="text-[13px] text-[#6b5850] leading-relaxed mb-6 line-clamp-3 font-medium flex items-start gap-2 italic">
                <span className="text-brand-gold text-xl leading-none">"</span>
                {product.description}
                <span className="text-brand-gold text-xl leading-none translate-y-2">"</span>
              </p>
            )}

            <div className="space-y-3 mb-8">
              {product.origin && (
                <div className="flex items-center gap-3 text-xs text-[#2a1b15]">
                  <div className="w-8 h-8 rounded-full bg-[#f9f5f0] flex items-center justify-center border border-[#e6d8c8] shadow-sm">
                    <MapPin size={14} className="text-brand-gold" />
                  </div>
                  <span className="font-semibold">{product.origin}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-auto">
            <a 
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-[#2a1b15] text-white font-bold rounded-2xl hover:bg-brand-red hover:shadow-[0_15px_30px_-10px_rgba(155,28,49,0.5)] transition-all duration-400 transform active:scale-95 group/btn overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="text-[13px] font-serif tracking-[0.1em] uppercase relative z-10">Khám phá chi tiết</span>
              <ExternalLink size={16} className="opacity-90 stroke-[2.5] relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
