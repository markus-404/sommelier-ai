"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import MessageInput from "./MessageInput";
import { Sparkles, Wine, Search, Gift, User } from "lucide-react";

const SHORTCUTS = [
  { icon: Wine, title: "Khám phá Vang", desc: "Theo quốc gia, giống nho" },
  { icon: Search, title: "Tìm Vang", desc: "Đỏ, Trắng, Sủi bọt" },
  { icon: Gift, title: "Quà tặng", desc: "Cho ngày lễ, đối tác" },
  { icon: Sparkles, title: "Kết hợp Món ăn", desc: "Bò bít tết, hải sản" },
];

export default function ChatArea({ apiKey }: { apiKey: string }) {
  const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMsgId = Date.now().toString();
    const assistantMsgId = (Date.now() + 1).toString();
    
    // 1. Add User Message
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: text }]);
    
    // 2. Prepare Assistant Message Placeholder
    setMessages((prev) => [...prev, { id: assistantMsgId, role: "assistant", content: "" }]);
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId: conversationId,
          user: "webapp-user",
          apiKey: apiKey
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Có lỗi xảy ra khi kết nối máy chủ.");
      }

      // 3. Handle Streaming Response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          
          // Dify returns multiple events in one chunk separated by newlines
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                
                if (data.event === "message") {
                  assistantContent += data.answer;
                  // Update message content in real-time
                  setMessages((prev) => 
                    prev.map((msg) => 
                      msg.id === assistantMsgId ? { ...msg, content: assistantContent } : msg
                    )
                  );
                }
                
                if (data.conversation_id && !conversationId) {
                  setConversationId(data.conversation_id);
                }
              } catch (e) {
                // Ignore incomplete JSON or other events
              }
            }
          }
        }
      }
    } catch (error: any) {
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === assistantMsgId 
            ? { ...msg, content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}` } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortcutClick = (title: string) => {
    handleSendMessage(`Tư vấn cho tôi: ${title}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-brand-cream relative">
      {/* Top Header Placeholder / Blur */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-brand-cream/60 backdrop-blur-md z-10 border-b border-brand-border md:hidden flex items-center px-4">
        <h2 className="font-serif font-bold text-brand-red">Nhà Chát Sommelier</h2>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 w-full overflow-y-auto pt-20 md:pt-10 pb-32 px-4 md:px-10 scroll-smooth"
      >
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
          {messages.length === 0 ? (
            // Empty State (Refined)
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
              </div>

              {/* Shortcuts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {SHORTCUTS.map((item, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleShortcutClick(item.title)}
                    className="group flex flex-col items-center justify-center p-6 bg-white/70 hover:bg-white border border-brand-border rounded-2xl transition-all duration-300 hover:-translate-y-2 wine-card-shadow active:scale-95"
                  >
                    <div className="p-3 bg-brand-cream rounded-xl mb-4 group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                      <item.icon size={28} />
                    </div>
                    <span className="font-bold text-[#3d2c23] text-sm mb-1">{item.title}</span>
                    <span className="text-xs text-brand-text-muted text-center leading-snug">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Feed (Premium)
            messages.map((msg, idx) => (
              <div 
                key={msg.id} 
                className={`flex w-full gap-4 md:gap-6 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  msg.role === "user" ? "bg-brand-cream border border-brand-border" : "wine-gradient text-white"
                }`}>
                  {msg.role === "user" ? <User size={20} className="text-brand-gold" /> : <Wine size={22} />}
                </div>
                
                {/* Message Bubble */}
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

      {/* Input Overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-brand-cream via-brand-cream/90 to-transparent flex justify-center z-20">
        <div className="w-full max-w-3xl">
          <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
