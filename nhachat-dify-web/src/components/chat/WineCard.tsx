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
    <div className="relative w-full max-w-[280px] sm:max-w-[300px] my-5 mx-auto bg-white overflow-hidden rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(155,28,49,0.15)] transition-all duration-500 hover:-translate-y-2 group flex flex-col border border-[#f0e6da]">
      
      {/* 55% Top Area: Prominent Image Presentation (Strict >=50% rule) */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-t from-[#fcfbf9] to-[#f4ebe1] p-6 flex flex-col items-center justify-center overflow-hidden border-b border-[#f0e6da]/50">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] opacity-50 z-20 pointer-events-none" />
        
        {/* Badge */}
        <div className="absolute top-5 left-5 z-30 bg-white/95 backdrop-blur-md shadow-sm border border-[#eee5d8] text-brand-red text-[9px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Sparkles size={10} className="text-brand-gold fill-brand-gold" />
          Đề xuất
        </div>

        {/* Product Image */}
        <div className="relative z-10 w-full h-full flex items-center justify-center transform transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-1">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="max-h-full max-w-[85%] object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)]"
            />
          ) : (
            <div className="w-20 h-40 rounded-t-[2.5rem] rounded-b-xl bg-gradient-to-b from-[#2a1b15] to-[#1a100d] flex items-center justify-center shadow-lg relative overflow-hidden">
              <Wine size={32} className="text-brand-gold/90 absolute top-6 stroke-[1.5]" />
            </div>
          )}
        </div>
      </div>

      {/* 45% Bottom Area: Content & Conversion */}
      <div className="flex-1 flex flex-col p-5 bg-white relative">
        
        {/* Type & Origin */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-brand-red uppercase tracking-[0.2em] bg-brand-red/5 px-2 py-0.5 rounded">
            {product.type || "Rượu Vang"}
          </span>
          {product.origin && (
            <div className="flex items-center gap-1.5 text-[10px] text-[#8c7b74] font-semibold">
              <MapPin size={11} className="text-brand-gold" />
              <span className="truncate max-w-[90px]">{product.origin}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif font-black text-[#2a1b15] text-[18px] sm:text-[20px] leading-[1.2] mb-2 line-clamp-2 min-h-[48px] group-hover:text-brand-red transition-colors duration-300">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="mb-4">
          <span className="text-[22px] font-serif font-black text-brand-red tracking-tight">
            {product.price}
          </span>
        </div>

        {/* Sensory Quote */}
        {product.description && (
          <p className="text-[12px] text-[#6b5850] leading-relaxed mb-6 line-clamp-2 font-medium italic border-l-2 border-brand-gold/30 pl-3 min-h-[40px]">
            "{product.description}"
          </p>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1">
          <a 
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-br from-[#2a1b15] to-[#1f130f] text-white rounded-[1.2rem] hover:from-brand-red hover:to-[#8a1426] hover:shadow-[0_10px_20px_-5px_rgba(155,28,49,0.3)] transition-all duration-300 active:scale-[0.98] group/btn overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="text-[12px] font-bold tracking-[0.1em] uppercase relative z-10 transition-colors">Chi tiết</span>
            <ExternalLink size={15} className="opacity-90 stroke-[2.5] relative z-10 transition-transform group-hover/btn:rotate-45" />
          </a>
        </div>
      </div>
    </div>
  );
}
