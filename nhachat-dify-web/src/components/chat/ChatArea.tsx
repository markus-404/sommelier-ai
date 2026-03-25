"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import MessageInput from "./MessageInput";
import { Sparkles, Wine, Search, Gift, User, Wand2 } from "lucide-react";
import WineCard, { WineProduct } from "./WineCard";
import SuggestedQuestions from "./SuggestedQuestions";
import { ProfileWizard } from "./ProfileWizard";
import { PairingWizard } from "./PairingWizard";
import { FeedbackCollector } from "./FeedbackCollector";
import { Message } from "@/types/chat";
import { ChatSession } from "@/app/page";

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

  const messages = currentSession?.messages || [];
  const conversationId = currentSession?.conversationId || "";

  // Show profile wizard for new users
  useEffect(() => {
    if (!userProfile) {
      const timer = setTimeout(() => setShowProfileWizard(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [userProfile]);

  const handleProfileComplete = (profile: any) => {
    if (!profile) {
      setShowProfileWizard(false);
      return;
    }
    setUserProfile(profile);
    localStorage.setItem("nhat-chat-user-profile", JSON.stringify(profile));
    setShowProfileWizard(false);
    
    // Auto send a welcome message based on profile
    handleSendMessage(`Chào Sommelier, tôi thường dùng vang cho dịp ${profile.occasion}. Tôi thích vang ${profile.intensity} và ${profile.sweetness}. Hãy gợi ý cho tôi 1 chai vang phù hợp nhấté!`);
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const parseAssistantResponse = (text: string) => {
    const productCards: WineProduct[] = [];
    const suggestedQuestions: string[] = [];
    let cleanContent = text;

    // Extract product cards
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

    // Extract suggested questions (ignored, we use hardcoded ones)
    const questionsRegex = /<suggested_questions>([\s\S]*?)<\/suggested_questions>/g;
    cleanContent = cleanContent.replace(questionsRegex, "");

    return { cleanContent, productCards, suggestedQuestions: HARDCODED_QUESTIONS };
  };

  const handleSendMessage = async (text: string) => {
    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();
    
    const userMsg: Message = { id: userMsgId, role: "user", content: text };
    const initialAssistantMsg: Message = { id: assistantMsgId, role: "assistant", content: "" };
    
    let activeMessages = [...messages, userMsg, initialAssistantMsg];
    let activeSessionId = currentSession?.id;

    // If it's a new chat, create a session first
    if (!activeSessionId) {
      activeSessionId = onCreateSession(text, activeMessages, conversationId);
    } else {
      onUpdateSession(activeSessionId, { messages: activeMessages });
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
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
                  const { cleanContent, productCards, suggestedQuestions } = parseAssistantResponse(assistantContent);
                  
                  activeMessages = activeMessages.map((msg) => 
                    msg.id === assistantMsgId ? { 
                      ...msg, 
                      content: cleanContent,
                      productCards: productCards.length > 0 ? productCards : undefined,
                      suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : undefined
                    } : msg
                  );

                  onUpdateSession(activeSessionId, { 
                    messages: activeMessages,
                    conversationId: data.conversation_id || conversationId
                  });
                }
              } catch (e) { /* Ignore incomplete JSON */ }
            }
          }
        }
      }
    } catch (error: any) {
      onUpdateSession(activeSessionId, {
        messages: activeMessages.map((msg) => 
          msg.id === assistantMsgId 
            ? { ...msg, content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}` } 
            : msg
        )
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortcutClick = (title: string) => {
    if (title === "Kết hợp Món ăn") {
        setShowPairingWizard(true);
    } else {
        handleSendMessage(`Tư vấn cho tôi: ${title}`);
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
            onPair={(food) => { setShowPairingWizard(false); handleSendMessage(food); }} 
            onClose={() => setShowPairingWizard(false)} 
        />
      )}

      {/* Top Header Placeholder / Blur */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-brand-cream/60 backdrop-blur-md z-10 border-b border-brand-border md:hidden flex items-center px-4">
        <h2 className="font-serif font-bold text-brand-red">Nhà Chát Sommelier</h2>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 w-full overflow-y-auto pt-20 md:pt-10 pb-48 md:pb-56 px-4 md:px-10 scroll-smooth"
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
                {userProfile && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium">
                    <User size={12} />
                    Đang áp dụng Gu cá nhân: {userProfile.prefer}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl">
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
            messages.map((msg, idx) => (
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
                      <div className="prose prose-brand prose-slate dark:prose-invert max-w-none prose-p:my-1 prose-headings:text-brand-red prose-strong:text-brand-red prose-a:text-brand-gold prose-a:font-bold prose-ul:list-disc">
                        <ReactMarkdown 
                          components={{
                            a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline decoration-2 underline-offset-4 hover:decoration-brand-red transition-all" />,
                          }}
                        >
                          {msg.content || "..."}
                        </ReactMarkdown>
                      </div>
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
                      {msg.productCards?.map((product, pIdx) => (
                        <div key={pIdx} className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
                          <WineCard product={product} />
                        </div>
                      ))}
                      {msg.suggestedQuestions && (
                        <SuggestedQuestions 
                          questions={msg.suggestedQuestions} 
                          onSelect={handleSendMessage} 
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isLoading && !messages[messages.length-1]?.content && (
            <div className="flex gap-4 md:gap-6 flex-row animate-pulse">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl wine-gradient text-white flex items-center justify-center shadow-lg">
                <Wine size={22} />
              </div>
              <div className="bg-white border border-brand-border rounded-3xl rounded-tl-none px-6 py-4 flex items-center gap-1.5 wine-card-shadow">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-bounce" />
                <div className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-bounce [animation-delay:-.3s]" />
                <div className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-bounce [animation-delay:-.5s]" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-brand-cream via-brand-cream/90 to-transparent flex flex-col items-center gap-4 z-20">
        <div className="flex gap-2 mb-2">
            <button 
                onClick={() => setShowPairingWizard(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-brand-border rounded-full text-xs font-serif font-bold text-brand-red hover:bg-white hover:border-brand-gold transition-all shadow-sm group"
            >
                <Wand2 className="w-3.5 h-3.5" />
                Kết hợp món ăn
            </button>
            <button 
                onClick={() => setShowProfileWizard(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-brand-border rounded-full text-xs font-serif font-bold text-brand-gold hover:bg-white hover:border-brand-red transition-all shadow-sm group"
            >
                <User className="w-3.5 h-3.5" />
                Thay đổi Gu
            </button>
        </div>
        <div className="w-full max-w-3xl">
          <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
