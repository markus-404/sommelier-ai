"use client";

/**
 * DEV-ONLY preview page for ElicitationCard component.
 * Not linked from the main app. Not intended for production.
 * Visit at http://localhost:4000/_dev/elicitation-preview
 */

import ElicitationCard from "@/components/chat/ElicitationCard";
import type { ElicitationQuestion } from "@/types/chat";

const MOCK_OCCASION: ElicitationQuestion = {
  question: "Quý khách đang tìm vang cho dịp nào ạ?",
  question_type: "occasion",
  options: [
    { label: "Bữa cơm gia đình", value: "family_dinner" },
    { label: "Tiếp khách / tiệc", value: "hosting" },
    { label: "Quà tặng", value: "gift" },
  ],
  allow_freeform: true,
  skippable: false,
};

const MOCK_BUDGET: ElicitationQuestion = {
  question: "Quý khách dự định ngân sách khoảng bao nhiêu cho mỗi chai ạ?",
  question_type: "budget",
  options: [
    { label: "Dưới 500k", value: "under_500k" },
    { label: "500k – 1 triệu", value: "500k_1m" },
    { label: "1 – 2 triệu", value: "1m_2m" },
    { label: "Trên 2 triệu", value: "above_2m" },
  ],
  allow_freeform: true,
  skippable: true,
};

const MOCK_TASTE: ElicitationQuestion = {
  question: "Quý khách thích vang đậm hay nhẹ hơn?",
  question_type: "taste",
  options: [
    { label: "Đậm, nhiều tannin", value: "full_bodied" },
    { label: "Nhẹ, dễ uống", value: "light_bodied" },
  ],
  allow_freeform: false,
  skippable: true,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-text-muted/60 border-b border-brand-border pb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function stub(name: string) {
  return (...args: unknown[]) => console.log(`[${name}]`, ...args);
}

export default function ElicitationPreviewPage() {
  return (
    <div className="min-h-screen bg-brand-cream py-12 px-4">
      <div className="max-w-xl mx-auto flex flex-col gap-10">
        <div>
          <h1 className="font-serif text-3xl text-brand-red mb-1">ElicitationCard Preview</h1>
          <p className="text-sm text-brand-text-muted">Dev-only. Not linked from production.</p>
        </div>

        {/* Mock 1: Occasion — freeform on, skip off */}
        <Section title="1 — Occasion · allow_freeform: true · skippable: false">
          <ElicitationCard
            payload={MOCK_OCCASION}
            onSelect={stub("onSelect")}
            onFreeform={stub("onFreeform")}
            onSkip={stub("onSkip")}
          />
        </Section>

        {/* Mock 2: Budget — freeform on, skip on */}
        <Section title="2 — Budget · allow_freeform: true · skippable: true">
          <ElicitationCard
            payload={MOCK_BUDGET}
            onSelect={stub("onSelect")}
            onFreeform={stub("onFreeform")}
            onSkip={stub("onSkip")}
          />
        </Section>

        {/* Mock 3: Taste — freeform off, skip on */}
        <Section title="3 — Taste · allow_freeform: false · skippable: true">
          <ElicitationCard
            payload={MOCK_TASTE}
            onSelect={stub("onSelect")}
            onFreeform={stub("onFreeform")}
            onSkip={stub("onSkip")}
          />
        </Section>

        {/* Mock 4: Disabled state */}
        <Section title="4 — Budget · disabled: true (locked state preview)">
          <ElicitationCard
            payload={MOCK_BUDGET}
            onSelect={stub("onSelect")}
            onFreeform={stub("onFreeform")}
            onSkip={stub("onSkip")}
            disabled
          />
        </Section>
      </div>
    </div>
  );
}
