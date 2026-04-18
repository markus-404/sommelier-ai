"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import MessageInput from "./MessageInput";
import { Sparkles, Wine, Search, Gift, User, Wand2 } from "lucide-react";
import WineCard, { WineProduct } from "./WineCard";
import ElicitationCard from "./ElicitationCard";
import SuggestedQuestions from "./SuggestedQuestions";
import { ProfileWizard } from "./ProfileWizard";
import { PairingWizard } from "./PairingWizard";
import { FeedbackCollector } from "./FeedbackCollector";
import { Message, TextMessage, ElicitationMessage, ElicitationQuestion } from "@/types/chat";
import { ChatSession } from "@/app/page";

const FOOTER_TEXT = "The Taste of Maturity";

const HARDCODED_QUESTIONS = [
  "Nhà Chát đang bán những dòng vang gì?",
  "Vang đỏ Nhà Chát nhập khẩu từ đâu?",
  "Giới thiệu những dòng vang hay dùng làm quà tặng",
  "Giới thiệu vang dễ uống cho người mới",
  "Thời gian giao hàng"
];

const SHORTCUTS = HARDCODED_QUESTIONS.map(q => ({
  icon: Wine,
  title: q,
  desc: ""
}));

interface ChatAreaProps {
  currentSession: ChatSession | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  userProfile: any;
  setUserProfile: (profile: any) => void;
  onCreateSession: (firstMsg: string, messages: Message[], conversationId: string) => string;
  onUpdateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isElicitation(msg: Message): msg is ElicitationMessage {
  return msg.role === "elicitation";
}

function isText(msg: Message): msg is TextMessage {
  return msg.role === "user" || msg.role === "assistant";
}

/** Validate an unknown object as ElicitationQuestion — mirrors the backend validator. */
function validateElicitationPayload(data: unknown): ElicitationQuestion | null {
  if (!data || typeof data !== "object") return null;
  const a = data as Record<string, unknown>;
  const VALID_TYPES = ["occasion", "pairing", "budget", "taste", "other"];
  if (
    typeof a.question !== "string" ||
    !VALID_TYPES.includes(a.question_type as string) ||
    !Array.isArray(a.options) ||
    a.options.length < 2 ||
    a.options.length > 5 ||
    typeof a.allow_freeform !== "boolean" ||
    typeof a.skippable !== "boolean"
  ) {
    return null;
  }
  for (const opt of a.options) {
    if (typeof (opt as any).label !== "string" || typeof (opt as any).value !== "string") return null;
  }
  return {
    question: a.question as string,
    question_type: a.question_type as ElicitationQuestion["question_type"],
    options: a.options as Array<{ label: string; value: string }>,
    allow_freeform: a.allow_freeform as boolean,
    skippable: a.skippable as boolean,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatArea({
  currentSession,
  isLoading,
  setIsLoading,
  userProfile,
  setUserProfile,
  onCreateSession,
  onUpdateSession
}: ChatAreaProps) {
  const [showProfileWizard, setShowProfileWizard] = useState(false);
  const [showPairingWizard, setShowPairingWizard] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showSuggestions, setShowSuggestions] = useState(true);
  const lastScrollTopRef = useRef(0);
  const scrollThreshold = 60;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    if (isNearBottom && !showSuggestions) {
      setShowSuggestions(true);
    } else if (!isNearBottom && showSuggestions) {
      setShowSuggestions(false);
    }
  };

  const messages = currentSession?.messages || [];
  const conversationId = currentSession?.conversationId || "";

  useEffect(() => {
    // Popup is now only manually triggered via the button
  }, [userProfile]);

  const prevSessionIdRef = useRef<string | undefined | null>(currentSession?.id);

  // Bug Fix TC-03: Abort ongoing streams when switching AWAY from an active session
  useEffect(() => {
    const prev = prevSessionIdRef.current;
    const curr = currentSession?.id;
    if (prev && prev !== curr) {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
          setIsLoading(false);
      }
    }
    prevSessionIdRef.current = curr;
  }, [currentSession?.id]);

  const handleProfileComplete = (profile: any) => {
    if (!profile) {
      setShowProfileWizard(false);
      return;
    }
    setUserProfile(profile);
    localStorage.setItem("nhat-chat-user-profile", JSON.stringify(profile));
    setShowProfileWizard(false);
    handleSendMessage(`Chào Sommelier, tôi thường dùng vang cho dịp ${profile.occasion}. Tôi thích vang ${profile.intensity} và ${profile.sweetness}. Hãy gợi ý cho tôi 1 chai vang phù hợp nhấté!`, "profile_welcome");
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const parseAssistantResponse = (text: string) => {
    const productCards: WineProduct[] = [];
    let cleanContent = text;

    const productRegex = /<product_card>([\s\S]*?)<\/product_card>/g;
    let match;
    while ((match = productRegex.exec(text)) !== null) {
      try {
        const product = JSON.parse(match[1]);
        productCards.push(product);
      } catch (e) {
        // Silently handle partial JSON during streaming
      }
    }
    cleanContent = cleanContent.replace(productRegex, "");
    // Hide unclosed <product_card> tail during streaming
    cleanContent = cleanContent.replace(/<product_card>[\s\S]*$/, "");

    const questionsRegex = /<suggested_questions>([\s\S]*?)<\/suggested_questions>/g;
    cleanContent = cleanContent.replace(questionsRegex, "");

    return { cleanContent, productCards };
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // ---------------------------------------------------------------------------
  // Core send logic — shared by MessageInput, elicitation taps, and skip
  // ---------------------------------------------------------------------------

  const handleSendMessage = async (text: string, source: string = "direct") => {
    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();

    const userMsg: TextMessage = { id: userMsgId, role: "user", content: text };
    const initialAssistantMsg: TextMessage = { id: assistantMsgId, role: "assistant", content: "" };

    // Option A: auto-dismiss any unanswered elicitation card when the user
    // sends a new message via the text input (mid-elicitation interrupt).
    const messagesWithDismissal = messages.map((m): Message => {
      if (isElicitation(m) && !m.answered) {
        return { ...m, answered: true, answer: "[user responded via chat instead]" };
      }
      return m;
    });

    let activeMessages: Message[] = [...messagesWithDismissal, userMsg, initialAssistantMsg];
    let activeSessionId = currentSession?.id;

    if (!activeSessionId) {
      activeSessionId = onCreateSession(text, activeMessages, conversationId);
    } else {
      onUpdateSession(activeSessionId, { messages: activeMessages });
    }

    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      // Build history: only text messages (user + assistant), skip elicitation UI messages
      const historyForBackend = messagesWithDismissal
        .filter(isText)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        signal: abortControllerRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          source,
          history: historyForBackend,
          conversationId: conversationId,
          user: "webapp-user",
          inputs: userProfile ? {
            user_intensity: userProfile.intensity,
            user_sweetness: userProfile.sweetness,
            user_occasion: userProfile.occasion
          } : {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Có lỗi xảy ra khi kết nối máy chủ.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));

                if (data.event === "message") {
                  assistantContent += data.answer;
                  const { cleanContent, productCards } = parseAssistantResponse(assistantContent);

                  activeMessages = activeMessages.map((msg): Message =>
                    msg.id === assistantMsgId ? {
                      ...msg,
                      role: "assistant",
                      content: cleanContent,
                      productCards: productCards.length > 0 ? productCards : undefined
                    } as TextMessage : msg
                  );

                  onUpdateSession(activeSessionId, {
                    messages: activeMessages,
                    conversationId: data.conversation_id || conversationId
                  });

                } else if (data.event === "elicitation_question") {
                  // Validate payload — warn and ignore if malformed
                  const payload = validateElicitationPayload(data.payload);
                  if (!payload) {
                    console.warn("[elicitation] Received malformed elicitation_question event:", data.payload);
                    continue;
                  }

                  // Commit current assistant prose (if any) before appending the card
                  const { cleanContent, productCards } = parseAssistantResponse(assistantContent);
                  activeMessages = activeMessages.map((msg): Message =>
                    msg.id === assistantMsgId ? {
                      ...msg,
                      role: "assistant",
                      content: cleanContent,
                      productCards: productCards.length > 0 ? productCards : undefined
                    } as TextMessage : msg
                  );

                  // Append elicitation card as a new message entry
                  const elicitationMsg: ElicitationMessage = {
                    id: `elicitation-${Date.now()}`,
                    role: "elicitation",
                    payload,
                    answered: false,
                  };
                  activeMessages = [...activeMessages, elicitationMsg];

                  onUpdateSession(activeSessionId, {
                    messages: activeMessages,
                    conversationId: data.conversation_id || conversationId,
                  });

                } else if (data.event === "error") {
                  throw new Error(data.message || data.error || "Đã xảy ra lỗi kết nối từ AI Server.");
                }
              } catch (e) { /* Ignore incomplete JSON during streaming */ }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        onUpdateSession(activeSessionId, {
          messages: activeMessages.map((msg): Message =>
            msg.id === assistantMsgId
              ? { ...msg, role: "assistant", content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}` } as TextMessage
              : msg
          )
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // ---------------------------------------------------------------------------
  // Elicitation submit handlers
  // ---------------------------------------------------------------------------

  const handleElicitationSelect = (elicitationMsgId: string, value: string) => {
    // Mark the card as answered in state
    const updatedMessages = messages.map((m): Message =>
      m.id === elicitationMsgId && isElicitation(m)
        ? { ...m, answered: true, answer: value }
        : m
    );
    if (currentSession?.id) {
      onUpdateSession(currentSession.id, { messages: updatedMessages });
    }
    // Submit the value as the next user turn
    handleSendMessage(value, "elicitation_option");
  };

  const handleElicitationFreeform = (elicitationMsgId: string, text: string) => {
    const updatedMessages = messages.map((m): Message =>
      m.id === elicitationMsgId && isElicitation(m)
        ? { ...m, answered: true, answer: text }
        : m
    );
    if (currentSession?.id) {
      onUpdateSession(currentSession.id, { messages: updatedMessages });
    }
    handleSendMessage(text, "elicitation_freeform");
  };

  const handleElicitationSkip = (elicitationMsgId: string) => {
    // Use explicit Vietnamese skip signal so the model sees it clearly in history.
    // "[skipped]" sentinel stored locally; "[Quý khách bỏ qua câu hỏi này]" goes to the model.
    const SKIP_SIGNAL = "[Quý khách bỏ qua câu hỏi này]";
    const updatedMessages = messages.map((m): Message =>
      m.id === elicitationMsgId && isElicitation(m)
        ? { ...m, answered: true, answer: "[skipped]" }
        : m
    );
    if (currentSession?.id) {
      onUpdateSession(currentSession.id, { messages: updatedMessages });
    }
    handleSendMessage(SKIP_SIGNAL, "elicitation_skip");
  };

  // ---------------------------------------------------------------------------

  const handleShortcutClick = (title: string) => {
    if (title === "Kết hợp Món ăn") {
        setShowPairingWizard(true);
    } else {
        handleSendMessage(`Tư vấn cho tôi: ${title}`, "shortcut");
    }
  };

  const handleFeedback = (msgId: string, rating: string, tags?: string[]) => {
    console.log(`Feedback for ${msgId}: ${rating}`, tags);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-brand-cream relative">
      {/* Wizards */}
      {showProfileWizard && <ProfileWizard onComplete={handleProfileComplete} />}
      {showPairingWizard && (
        <PairingWizard
            onPair={(food) => { setShowPairingWizard(false); handleSendMessage(food, "pairing_wizard"); }}
            onClose={() => setShowPairingWizard(false)}
        />
      )}

      {/* Top Header Placeholder / Blur */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-brand-cream/60 backdrop-blur-md z-10 border-b border-brand-border md:hidden flex items-center px-4">
        <h2 className="font-serif font-bold text-brand-red">Nhà Chát Sommelier</h2>
      </div>

      {/* Persistent Top Floating Action Bar */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex gap-2">
          <button
              onClick={() => setShowPairingWizard(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-[#f0e6da] rounded-xl text-[12px] font-sans font-semibold text-brand-red hover:bg-white hover:border-brand-gold transition-all shadow-sm group"
          >
              <Wand2 className="w-3.5 h-3.5" />
              Kết hợp món ăn
          </button>
          <button
              onClick={() => setShowProfileWizard(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-[#f0e6da] rounded-xl text-[12px] font-sans font-semibold text-brand-gold hover:bg-white hover:text-brand-red transition-all shadow-sm group"
          >
              <User className="w-3.5 h-3.5" />
              Thay đổi Gu
          </button>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 w-full overflow-y-auto pt-20 md:pt-14 pb-48 md:pb-52 px-4 md:px-10 scroll-smooth"
      >
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-5 duration-1000">
              <div className="w-20 h-20 bg-brand-red rounded-3xl flex items-center justify-center mb-8 shadow-2xl rotate-3">
                <Wine size={40} className="text-white" />
              </div>
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl text-[#3d2c23] mb-4 tracking-tight">
                  Thưởng vang đúng điệu
                </h2>
                <p className="text-brand-text-muted text-lg max-w-lg mx-auto font-light leading-relaxed">
                  Chào mừng bạn đến với <span className="text-brand-red font-semibold">Nhà Chát</span>. Tôi là Sommelier riêng của bạn, sẵn sàng kiến tạo trải nghiệm rượu vang hoàn hảo nhất.
                </p>
                {userProfile && Object.keys(userProfile).length > 0 && (
                  <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#fcfbf9] border border-[#f0e6da] shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[#3d2c23] text-xs font-medium max-w-[80%] mx-auto relative overflow-hidden group/badge">
                    <div className="absolute inset-0 bg-brand-gold/5 group-hover/badge:bg-brand-gold/10 transition-colors" />
                    <User size={14} className="text-brand-gold relative z-10" />
                    <span className="relative z-10">
                        <span className="font-bold text-brand-red">Gu cá nhân:</span> {userProfile.intensity}, {userProfile.sweetness}, {userProfile.occasion}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl pb-16">
                {SHORTCUTS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleShortcutClick(item.title)}
                    className="group flex items-center gap-3 p-4 bg-white/40 backdrop-blur-md hover:bg-white border border-white/60 hover:border-brand-gold rounded-full transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-gold/10 active:scale-95"
                  >
                    <div className="p-2 bg-white rounded-full group-hover:bg-brand-red group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-md">
                      <item.icon size={16} className="group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="font-sans font-medium text-[#3d2c23] text-sm tracking-tight pr-2">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full pb-48">
              {messages.map((msg, idx) => {
                // ── Elicitation card ──────────────────────────────────────────
                if (isElicitation(msg)) {
                  return (
                    <div
                      key={msg.id}
                      className="flex w-full gap-4 md:gap-6 flex-row animate-in fade-in slide-in-from-bottom-2 duration-500"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      {/* Same avatar as assistant */}
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg wine-gradient text-white">
                        <Wine size={22} />
                      </div>
                      <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[75%] w-full">
                        <ElicitationCard
                          payload={msg.payload}
                          disabled={msg.answered}
                          onSelect={(value) => handleElicitationSelect(msg.id, value)}
                          onFreeform={(text) => handleElicitationFreeform(msg.id, text)}
                          onSkip={() => handleElicitationSkip(msg.id)}
                        />
                      </div>
                    </div>
                  );
                }

                // ── Regular user / assistant message ──────────────────────────
                return (
                  <div
                    key={msg.id}
                    className={`flex w-full gap-4 md:gap-6 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      msg.role === "user" ? "bg-brand-cream border border-brand-border" : "wine-gradient text-white"
                    }`}>
                      {msg.role === "user" ? <User size={20} className="text-brand-gold" /> : <Wine size={22} />}
                    </div>

                    <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%]`}>
                      <div className={`rounded-3xl px-5 py-4 text-[15px] leading-relaxed wine-card-shadow ${
                        msg.role === "user"
                          ? "bg-brand-red text-white rounded-tr-none"
                          : "bg-white border border-brand-border text-brand-text rounded-tl-none"
                      }`}>
                        {msg.role === "assistant" ? (
                          msg.content === "" ? (
                            <div className="flex items-center h-6 gap-1.5 px-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          ) : (
                            <div className="prose prose-brand prose-slate dark:prose-invert max-w-none prose-p:my-1 prose-headings:text-brand-red prose-strong:text-brand-red prose-a:text-brand-gold prose-a:font-bold prose-ul:list-disc">
                              <ReactMarkdown
                                components={{
                                  a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline decoration-2 underline-offset-4 hover:decoration-brand-red transition-all" />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      {msg.role === "assistant" && (
                        <div className="flex flex-col gap-2">
                          <FeedbackCollector
                            messageId={msg.id}
                            onFeedback={(id, rating, tags) => handleFeedback(id, rating, tags)}
                          />
                          {msg.productCards && msg.productCards.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                              {msg.productCards.map((product, pIdx) => (
                                <div key={pIdx} className="animate-in fade-in slide-in-from-left-4 duration-500 w-full" style={{ animationDelay: `${200 + pIdx * 100}ms` }}>
                                  <WineCard product={product} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 md:py-6 bg-gradient-to-t from-brand-cream via-brand-cream/95 to-transparent flex flex-col items-center gap-2 z-20 pointer-events-none">
        <div className="w-full max-w-3xl flex flex-col items-center gap-2 pointer-events-auto relative">

          <div className={`w-full transition-all duration-500 overflow-hidden ${showSuggestions && messages.length > 0 && !isLoading ? 'max-h-[150px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-4'}`}>
               <SuggestedQuestions questions={HARDCODED_QUESTIONS} onSelect={(q) => handleSendMessage(q, "suggested_question")} />
          </div>

          <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} onStop={handleStop} />
          <p className="text-[11px] text-brand-text-muted/70 text-center mt-1 px-4">
            Cuộc trò chuyện có thể được ghi nhận để cải thiện chất lượng tư vấn.
          </p>
        </div>
      </div>
    </div>
  );
}
