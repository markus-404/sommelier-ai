import { WineProduct } from "@/components/chat/WineCard";

/** Regular user or assistant text message. */
export interface TextMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  productCards?: WineProduct[];
  suggestedQuestions?: string[];
}

/**
 * Elicitation card — a UI-only message rendered in the assistant's column.
 * Never sent to the backend as part of conversation history.
 * The user's answer (if any) is submitted as a separate user TextMessage turn.
 */
export interface ElicitationMessage {
  id: string;
  role: "elicitation";
  payload: ElicitationQuestion;
  /** True once the user taps an option, submits freeform, or taps skip. */
  answered: boolean;
  /** The value/text the user selected, or "[skipped]" for skip. */
  answer?: string;
}

/** Discriminated union of all message shapes in the conversation. */
export type Message = TextMessage | ElicitationMessage;

/** One selectable option inside an elicitation card. */
export interface ElicitationOption {
  /** Text shown to the user on the tap target. */
  label: string;
  /** Value fed back into the conversation when the user taps. */
  value: string;
}

/**
 * Structured payload emitted by the model when it calls `ask_elicitation_question`.
 * Chunk B parses this from the Gemini function-call response.
 * Chunk C renders it. Chunk D wires the submit callbacks.
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
