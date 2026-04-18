import { WineProduct } from "@/components/chat/WineCard";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  productCards?: WineProduct[];
  suggestedQuestions?: string[];
}

/** One selectable option inside an elicitation card. */
export interface ElicitationOption {
  /** Text shown to the user on the tap target. */
  label: string;
  /** Value fed back into the conversation when the user taps. */
  value: string;
}

/**
 * Structured payload emitted by the model when it calls `ask_elicitation_question`.
 * Chunk B will parse this from the Gemini function-call response and pass it to the UI.
 * Chunks C/D will render it as an interactive card.
 */
export interface ElicitationQuestion {
  /** User-facing question text. 1 sentence. Must match the user's language. */
  question: string;
  /** Semantic category used to enforce signal-priority ordering. */
  question_type: "occasion" | "pairing" | "budget" | "taste" | "other";
  /** 2–5 mutually exclusive answer options. */
  options: ElicitationOption[];
  /** When true the card shows a free-text "Lựa chọn khác" input row. Default: true. */
  allow_freeform: boolean;
  /** When true the card shows a skip button. Default: true. */
  skippable: boolean;
}
