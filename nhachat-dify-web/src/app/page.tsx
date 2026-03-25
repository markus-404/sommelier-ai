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
