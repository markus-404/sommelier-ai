import React from 'react';
import { ExternalLink, ShoppingCart } from 'lucide-react';

interface WineProduct {
  name: string;
  price: string;
  link: string;
}

export default function WineCard({ product }: { product: WineProduct }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-brand-border wine-card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl max-w-sm mb-4">
      <div className="p-5">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="font-serif font-bold text-brand-red text-lg leading-tight group-hover:text-brand-red-light transition-colors">
            {product.name}
          </h3>
          <div className="bg-brand-cream-sidebar p-2 rounded-xl text-brand-gold">
            <ShoppingCart size={18} />
          </div>
        </div>
        
        <div className="flex flex-col gap-1 mb-4">
          <span className="text-2xl font-bold text-brand-text">
            {product.price}
          </span>
          <span className="text-[10px] text-brand-text-muted font-medium uppercase tracking-wider">
            Lưu ý: Giá chưa bao gồm 10% VAT
          </span>
        </div>

        <a 
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-brand-cream border border-brand-border text-brand-red font-semibold rounded-xl hover:bg-brand-red hover:text-white hover:border-brand-red transition-all duration-300 group"
        >
          <span>Xem chi tiết</span>
          <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}
