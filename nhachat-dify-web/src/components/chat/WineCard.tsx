import React from 'react';
import { ExternalLink, ShoppingCart, MapPin, Utensils } from 'lucide-react';

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
    <div className="bg-white rounded-3xl overflow-hidden border border-brand-border wine-card-shadow transition-all duration-500 hover:shadow-2xl max-w-xl mb-6 group">
      <div className="flex flex-col md:flex-row">
        {/* Left: Image Section */}
        <div className="md:w-2/5 relative h-64 md:h-auto bg-brand-cream-sidebar flex items-center justify-center p-6 overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="h-full w-auto object-contain transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="text-brand-gold opacity-20 capitalize text-4xl font-serif">NhaChat</div>
          )}
          <div className="absolute top-4 left-4 bg-brand-red text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            Sản phẩm đề xuất
          </div>
        </div>

        {/* Right: Content Section */}
        <div className="md:w-3/5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                {product.type || "RƯỢU VANG NHẬP KHẨU"}
              </span>
              <span className="text-lg font-serif font-black text-brand-red tracking-tight">
                {product.price}
              </span>
            </div>

            <h3 className="font-serif font-bold text-brand-text text-xl leading-snug mb-3 pr-8 group-hover:text-brand-red transition-colors duration-300">
              {product.name}
            </h3>

            {product.description && (
              <p className="text-sm text-brand-text-muted leading-relaxed mb-4 line-clamp-3 italic">
                "{product.description}"
              </p>
            )}

            <div className="space-y-3 mb-6">
              {product.origin && (
                <div className="flex items-center gap-2 text-xs text-brand-text">
                  <div className="p-1 px-2 border border-brand-border rounded-lg bg-brand-cream flex items-center gap-1.5 font-medium">
                    <MapPin size={12} className="text-brand-gold" />
                    <span>{product.origin}</span>
                  </div>
                </div>
              )}

              {product.pairings && product.pairings.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-brand-gold mr-1">
                    <Utensils size={12} />
                  </div>
                  {product.pairings.map((pairing, i) => (
                    <span key={i} className="text-[10px] bg-brand-cream-sidebar text-brand-text-muted px-2.5 py-1 rounded-full font-bold border border-brand-border/30">
                      {pairing}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-auto">
            <a 
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-text text-white font-bold rounded-2xl hover:bg-brand-red transition-all duration-300 shadow-lg shadow-brand-text/10"
            >
              <span className="text-sm">Xem sản phẩm</span>
              <ExternalLink size={14} className="opacity-70" />
            </a>
            <button className="p-3 border border-brand-border rounded-2xl text-brand-text hover:bg-brand-cream transition-colors">
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
