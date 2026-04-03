"use client";

import { useState, useRef, useEffect } from "react";
import { Workout } from "@/types/workout";
import { getCoachReply, getCoachSettings } from "@/lib/coach";

interface ChatMsg {
  id: string;
  from: "user" | "coach";
  text: string;
}

export default function CoachChat({ workouts }: { workouts: Workout[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const settings = getCoachSettings();

  useEffect(() => {
    if (messages.length === 0 && open) {
      setMessages([
        {
          id: "welcome",
          from: "coach",
          text: `Hej! Jestem ${settings.name}. Zapytaj mnie o cele, tempo, dystans, motywacje - chetnie pomoge!`,
        },
      ]);
    }
  }, [open, messages.length, settings.name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    const userMsg: ChatMsg = {
      id: Date.now().toString(36),
      from: "user",
      text: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const reply = getCoachReply(userMsg.text, workouts);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(36) + "r",
          from: "coach",
          text: reply,
        },
      ]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  }

  return (
    <>
      {/* Chat toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-28 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-b from-accent-green to-accent-green-dim text-white shadow-[0_10px_30px_rgba(255,255,255,0.15)] flex items-center justify-center text-2xl active:scale-95 transition-all animate-scale-in"
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 left-4 right-4 z-40 max-w-2xl mx-auto animate-fade-in-up">
          <div className="bg-surface-container rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col" style={{ maxHeight: "50vh" }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xl">
                🏋️
              </div>
              <div className="flex-1">
                <p className="font-[family-name:var(--font-lexend)] text-sm font-bold text-white">
                  {settings.name}
                </p>
                <p className="text-[10px] text-accent-green font-bold uppercase tracking-widest">
                  Online
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-on-surface-variant hover:text-white text-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: "200px" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.from === "user"
                        ? "bg-accent-green text-white rounded-br-md"
                        : "bg-surface-container-high text-on-surface rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-high text-on-surface-variant px-4 py-3 rounded-2xl rounded-bl-md text-sm">
                    <span className="animate-pulse">...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Napisz do trenera..."
                  className="flex-1 bg-surface-container-high text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:bg-surface-bright transition-colors placeholder:text-on-surface-variant/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-11 h-11 rounded-full bg-accent-green text-white flex items-center justify-center active:scale-95 transition-all disabled:opacity-30"
                >
                  ▶
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
