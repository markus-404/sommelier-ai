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

  // Load profile from localStorage (moved from ChatArea)
  useEffect(() => {
    const savedProfile = localStorage.getItem("nhat-chat-user-profile");
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const handleNewChat = () => {
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
      <div className="flex-1 h-full flex flex-col relative">
        <ChatArea 
          currentSession={currentSession}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onCreateSession={handleCreateSession}
          onUpdateSession={handleUpdateSession}
        />
      </div>
    </main>
  );
}
