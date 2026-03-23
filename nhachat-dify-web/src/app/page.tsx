"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/chat/ChatArea";

export default function Home() {
  const [apiKey, setApiKey] = useState("");

  return (
    <main className="flex h-screen w-full overflow-hidden bg-brand-cream">
      {/* Sidebar - Khóa chiều rộng 260px */}
      <div className="w-[260px] h-full flex-shrink-0 border-r border-[#e8dccb] bg-brand-cream-sidebar hidden md:block">
        <Sidebar apiKey={apiKey} setApiKey={setApiKey} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 h-full flex flex-col relative">
        <ChatArea apiKey={apiKey} />
      </div>
    </main>
  );
}
