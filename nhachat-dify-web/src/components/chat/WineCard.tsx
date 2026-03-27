import React from 'react';
import { ExternalLink, MapPin, Sparkles, Wine } from 'lucide-react';

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
    <div className="relative w-full max-w-[450px] my-3 mx-auto bg-white overflow-hidden rounded-[1.5rem] shadow-[0_8px_30px_-5px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_40px_-5px_rgba(155,28,49,0.12)] transition-all duration-300 group flex flex-row border border-[#f0e6da] h-[190px]">
      
      {/* 40% Left Area: Image */}
      <div className="relative w-[40%] h-full bg-gradient-to-t from-[#fcfbf9] to-[#f4ebe1] p-3 flex flex-col items-center justify-center border-r border-[#f0e6da]/50 overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] opacity-50 z-20 pointer-events-none" />
        
        <div className="absolute top-3 left-3 z-30 bg-white/95 backdrop-blur-md shadow-sm border border-[#eee5d8] text-brand-red text-[8px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1">
          <Sparkles size={8} className="text-brand-gold fill-brand-gold" />
          <span className="hidden sm:inline">Trọn lọc</span>
        </div>

        <div className="relative z-10 w-full h-full flex items-center justify-center transform transition-transform duration-500 group-hover:scale-105">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="max-h-full max-w-[90%] object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)]"
            />
          ) : (
            <div className="w-12 h-24 rounded-t-full rounded-b-[0.5rem] bg-gradient-to-b from-[#2a1b15] to-[#1a100d] flex items-center justify-center shadow-lg relative">
              <Wine size={20} className="text-brand-gold/90 absolute top-4 stroke-[1.5]" />
            </div>
          )}
        </div>
      </div>

      {/* 60% Right Area: Info */}
      <div className="w-[60%] flex flex-col p-4 bg-white relative justify-between">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-bold text-brand-red uppercase tracking-wider bg-brand-red/5 px-2 py-0.5 rounded truncate max-w-[50%]">
              {product.type || "Rượu Vang"}
            </span>
            {product.origin && (
              <div className="flex items-center gap-1 text-[9px] text-[#8c7b74] font-semibold truncate max-w-[45%]">
                <MapPin size={10} className="text-brand-gold shrink-0" />
                <span className="truncate">{product.origin}</span>
              </div>
            )}
          </div>

          <h3 className="font-serif font-black text-[#2a1b15] text-[14px] sm:text-[15px] leading-[1.2] mb-1 line-clamp-2 group-hover:text-brand-red transition-colors duration-300" title={product.name}>
            {product.name}
          </h3>
          
          <div className="mb-2">
            <span className="text-[16px] font-serif font-black text-brand-red tracking-tight">
              {product.price}
            </span>
          </div>

          {product.description && (
            <p className="text-[11px] text-[#6b5850] leading-snug line-clamp-2 font-medium italic border-l-2 border-brand-gold/30 pl-2">
              "{product.description}"
            </p>
          )}
        </div>

        <a 
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-br from-[#2a1b15] to-[#1f130f] text-white rounded-xl hover:from-[#9B1C31] hover:to-[#7a1424] hover:shadow-[0_5px_15px_-3px_rgba(155,28,49,0.3)] transition-all duration-300 active:scale-[0.98] group/btn"
        >
          <span className="text-[11px] font-bold tracking-wider uppercase">Chi tiết</span>
          <ExternalLink size={12} className="opacity-90 stroke-[2.5] transition-transform group-hover/btn:rotate-45" />
        </a>
      </div>
    </div>
  );
}
