import { sql } from "./db";

export type LogPayload = {
  session_id: string | null;
  msg_num: number;
  question: string;
  source: string;
  has_profile: boolean;
  occasion: string;
  intensity: string;
  sweetness: string;
  user_agent: string;
  referrer: string;
};

export function logQuestion(p: LogPayload) {
  if (!sql) return;
  sql`
    INSERT INTO questions
      (session_id, msg_num, question, source, has_profile, occasion, intensity, sweetness, user_agent, referrer)
    VALUES
      (${p.session_id}, ${p.msg_num}, ${p.question}, ${p.source}, ${p.has_profile},
       ${p.occasion}, ${p.intensity}, ${p.sweetness}, ${p.user_agent}, ${p.referrer})
  `.catch((err: unknown) => console.error("[log_question] insert failed:", err));
}
