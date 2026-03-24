"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Heart, Sparkles, Check } from "lucide-react";

interface ProfileWizardProps {
  onComplete: (profile: any) => void;
}

const steps = [
  {
    id: "intensity",
    question: "Bạn thích rượu vang đậm đà hay nhẹ nhàng?",
    options: [
      { label: "Nhẹ nhàng & Thanh thoát", value: "light" },
      { label: "Vừa phải & Cân bằng", value: "medium" },
      { label: "Đậm đà & Mạnh mẽ", value: "bold" },
    ],
  },
  {
    id: "sweetness",
    question: "Gu của bạn về độ ngọt như thế nào?",
    options: [
      { label: "Chát & Khô (Dry)", value: "dry" },
      { label: "Hơi ngọt (Off-dry)", value: "off-dry" },
      { label: "Ngọt ngào (Sweet)", value: "sweet" },
    ],
  },
  {
    id: "occasion",
    question: "Bạn thường tìm rượu cho dịp nào nhất?",
    options: [
      { label: "Thưởng thức hàng ngày", value: "daily" },
      { label: "Tiệc tùng & Hội họp", value: "party" },
      { label: "Biếu tặng sang trọng", value: "gift" },
    ],
  },
];

export const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<any>({});
  const [isVisible, setIsVisible] = useState(true);

  const handleSelect = (value: string) => {
    const newProfile = { ...profile, [steps[currentStep].id]: value };
    setProfile(newProfile);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("wine_profile", JSON.stringify(newProfile));
      setIsVisible(false);
      setTimeout(() => onComplete(newProfile), 500);
    }
  };

  if (!isVisible && currentStep === steps.length - 1) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-brand-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-brand-gold/5 pointer-events-none" />
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onComplete(null), 500);
              }}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-brand-cream hover:bg-brand-red/10 text-brand-text-muted hover:text-brand-red transition-all z-20"
            >
              <span className="text-xl font-light">&times;</span>
            </button>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl wine-gradient flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-brand-text font-serif font-black text-xl italic">Wine Journey</h2>
                    <p className="text-brand-gold text-[10px] font-bold tracking-[0.2em] uppercase">Profile Setup</p>
                  </div>
                </div>
                <div className="text-brand-text-muted/40 text-sm font-black italic">
                  0{currentStep + 1} / 0{steps.length}
                </div>
              </div>

              <motion.h3 
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-brand-text text-2xl font-serif font-bold mb-8 leading-tight italic"
              >
                {steps[currentStep].question}
              </motion.h3>

              <div className="space-y-3">
                {steps[currentStep].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className="w-full text-left p-5 rounded-2xl bg-brand-cream-sidebar hover:bg-brand-red/5 border border-brand-border hover:border-brand-red/30 transition-all duration-300 group/btn flex justify-between items-center"
                  >
                    <span className="text-brand-text-muted group-hover/btn:text-brand-red font-bold transition-colors">
                      {option.label}
                    </span>
                    <div className="w-6 h-6 rounded-full border border-brand-border group-hover/btn:border-brand-red group-hover/btn:bg-brand-red flex items-center justify-center transition-all">
                      <Check className="w-3 h-3 text-transparent group-hover/btn:text-white" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-10 flex gap-1.5">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${i <= currentStep ? "wine-gradient" : "bg-brand-border"}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
