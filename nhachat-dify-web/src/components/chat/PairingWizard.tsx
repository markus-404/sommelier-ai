"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Pizza, Beef, Fish, Leaf, X, ChevronRight, Wand2 } from "lucide-react";

interface PairingWizardProps {
  onPair: (foodInfo: string) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "red-meat", label: "Thịt Đỏ", icon: Beef, description: "Bò, cừu, nướng..." },
  { id: "white-meat", label: "Thịt Trắng", icon: Pizza, description: "Gà, vịt, heo..." },
  { id: "seafood", label: "Hải Sản", icon: Fish, description: "Cá, tôm, cua..." },
  { id: "veg", label: "Rau Quả", icon: Leaf, description: "Salad, món chay..." },
];

export const PairingWizard: React.FC<PairingWizardProps> = ({ onPair, onClose }) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [cookingMethod, setCookingMethod] = useState("");

  const handleComplete = () => {
    const category = CATEGORIES.find(c => c.id === selectedCat)?.label;
    onPair(`Tôi đang dùng món ${category} (${cookingMethod}). Hãy gợi ý rượu phù hợp.`);
  };

  return (
    <div className="absolute inset-0 z-40 bg-brand-cream/95 backdrop-blur-2xl border border-brand-border rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="p-6 border-b border-brand-border flex justify-between items-center bg-white/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg wine-gradient flex items-center justify-center text-white">
            <Wand2 className="w-4 h-4" />
          </div>
          <h3 className="text-brand-red font-serif text-lg font-bold tracking-tight">Trợ lý Kết hợp Món ăn</h3>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-red/10 text-brand-red/50 hover:text-brand-red transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {!selectedCat ? (
          <div>
            <p className="text-brand-text-muted text-[11px] mb-8 font-bold uppercase tracking-[0.2em] text-center">Bước 1: Chọn nguyên liệu chính</p>
            <div className="grid grid-cols-2 gap-5">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(128, 42, 60, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCat(cat.id)}
                  className="p-8 rounded-3xl bg-white border border-brand-border hover:border-brand-gold hover:bg-brand-cream-sidebar transition-all flex flex-col items-center gap-4 text-center group wine-card-shadow"
                >
                  <div className="w-16 h-16 rounded-2xl bg-brand-cream-sidebar flex items-center justify-center group-hover:bg-brand-gold/10 transition-colors border border-brand-border/50">
                    <cat.icon className="w-8 h-8 text-brand-gold group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-brand-text font-bold text-base">{cat.label}</span>
                    <span className="text-brand-text-muted text-[10px] uppercase font-medium tracking-wider">{cat.description}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <button 
              onClick={() => setSelectedCat(null)}
              className="text-brand-gold text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-brand-red transition-colors mb-2"
            >
              ← Bắt đầu lại
            </button>
            
            <div className="space-y-2">
              <h4 className="text-brand-red text-2xl font-serif font-black italic">Món {CATEGORIES.find(c => c.id === selectedCat)?.label}</h4>
              <p className="text-brand-text-muted text-sm font-medium">Bạn dự định chế biến như thế nào?</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {["Nướng/Chiên đậm đà", "Hấp/Luộc thanh đạm", "Sốt kem/Béo ngậy", "Cay/Nhiều gia vị"].map((method) => (
                <button
                  key={method}
                  onClick={() => setCookingMethod(method)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-bold ${
                    cookingMethod === method 
                      ? "bg-brand-gold/10 border-brand-gold text-brand-red shadow-inner" 
                      : "bg-white border-brand-border text-brand-text hover:border-brand-gold/50"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {cookingMethod && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleComplete}
                className="w-full py-5 rounded-2xl wine-gradient text-white font-bold shadow-xl shadow-brand-red/20 flex items-center justify-center gap-3 mt-6 hover:brightness-110 active:scale-[0.98] transition-all group"
              >
                <span className="tracking-wide">TÌM RƯỢU NGAY</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
      
      <div className="p-5 text-center bg-brand-cream-sidebar border-t border-brand-border">
        <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-[0.3em] opacity-50">Nhà Chát Sommelier • Professional Pairing Engine</p>
      </div>
    </div>
  );
};
