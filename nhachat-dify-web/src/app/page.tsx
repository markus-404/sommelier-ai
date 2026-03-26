"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import { Message } from "@/types/chat";

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  conversationId: string;
}

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load profile and sessions from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("nhat-chat-user-profile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    const savedSessions = localStorage.getItem("nha-chat-sessions");
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
        // Optionally select the most recent session
        const parsed = JSON.parse(savedSessions);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Could not parse sessions");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nha-chat-sessions", JSON.stringify(sessions));
    }
  }, [sessions, isLoaded]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const handleNewChat = () => {
    if (isLoading) {
      setShowConfirmModal(true);
    } else {
      setCurrentSessionId(null);
    }
  };

  const confirmNewChat = () => {
    setShowConfirmModal(false);
    setIsLoading(false);
    setCurrentSessionId(null);
  };

  const handleSwitchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleUpdateSession = (sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates } : s));
  };

  const handleCreateSession = (firstMsg: string, messages: Message[], conversationId: string = "") => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: firstMsg.length > 30 ? firstMsg.substring(0, 30) + "..." : firstMsg,
      messages,
      conversationId
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-brand-cream">
      {/* Sidebar */}
      <div className="w-[260px] h-full flex-shrink-0 border-r border-[#e8dccb] bg-brand-cream-sidebar hidden md:block">
        <Sidebar 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onNewChat={handleNewChat}
          onSwitchSession={handleSwitchSession}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 h-full flex flex-col relative overflow-hidden">
        <ChatArea 
          currentSession={currentSession}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onCreateSession={handleCreateSession}
          onUpdateSession={handleUpdateSession}
        />
        
        {/* Custom Confirmation Modal overlaying main area */}
        {showConfirmModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#2a1b15]/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-brand-cream w-[90%] max-w-sm rounded-[2rem] p-8 shadow-2xl border border-brand-gold/20 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-14 h-14 rounded-full bg-white border border-brand-border flex items-center justify-center mb-5 shadow-sm text-brand-red font-serif text-2xl font-black">
                !
              </div>
              <h3 className="font-serif font-black text-[#2a1b15] text-xl mb-3">Tạo cuộc trò chuyện mới?</h3>
              <p className="text-[13px] text-brand-text-muted font-medium leading-relaxed mb-8">
                Sommelier vẫn đang chuẩn bị câu trả lời cho bạn. Bạn có chắc chắn muốn bỏ dở và bắt đầu một cuộc trò chuyện mới không?
              </p>
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3.5 px-4 bg-white border border-brand-border rounded-xl text-[13px] font-bold text-brand-text hover:bg-[#f9f5f0] transition-colors"
                >
                  Tiếp tục chờ
                </button>
                <button 
                  onClick={confirmNewChat}
                  className="flex-1 py-3.5 px-4 wine-gradient text-white rounded-xl text-[13px] font-bold shadow-md hover:shadow-lg hover:shadow-brand-red/20 transition-all active:scale-95"
                >
                  Xác nhận rời
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
