import { WineProduct } from "@/components/chat/WineCard";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  productCards?: WineProduct[];
  suggestedQuestions?: string[];
}
