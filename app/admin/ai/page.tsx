"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FOLLOW_UP_CHIPS = [
  "이번 주 신규 강사 현황",
  "지역별 강사 분포 분석",
  "리뷰 만족도 트렌드",
  "인기 강의 주제 TOP 5",
];

export default function AdminAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async (text?: string) => {
    const query = text || input.trim();
    if (!query || isStreaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setIsStreaming(true);

    // SSE 스트리밍
    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "죄송합니다, 오류가 발생했습니다." },
        ]);
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantContent += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            } catch {
              // non-JSON line, skip
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "네트워크 오류가 발생했습니다." },
      ]);
    } finally {
      setIsStreaming(false);
    }

    // 자동 스크롤
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg-grouped)" }}>
      {/* 헤더 */}
      <header className="relative z-10 shrink-0 px-4 lg:px-8 py-4 border-b border-[var(--glass-border)] lg:ml-0 ml-12
                          bg-[var(--bg-surface)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-secondary)]/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AI 어시스턴트</h1>
            <p className="text-xs text-[var(--text-muted)]">강사 DB 기반 인사이트</p>
          </div>
        </div>
      </header>

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-12 h-12 text-[var(--accent-secondary)]/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">무엇을 도와드릴까요?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">
              강사 데이터 분석, 트렌드 인사이트, 추천 등을 도와드립니다.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {FOLLOW_UP_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-2 rounded-xl text-xs font-medium
                             bg-[var(--bg-elevated)] border border-[var(--glass-border)]
                             hover:border-[var(--accent-secondary)]/50 hover:bg-[var(--accent-secondary)]/5
                             transition-all duration-200"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--accent-secondary)] text-white rounded-br-sm"
                  : "bg-[var(--bg-elevated)] border border-[var(--glass-border)] rounded-bl-sm"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" && isStreaming && i === messages.length - 1 && (
                <span className="inline-block w-1 h-4 bg-[var(--accent-secondary)] ml-0.5 animate-pulse align-text-bottom" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 입력 */}
      <div className="shrink-0 px-4 lg:px-8 py-4 border-t border-[var(--glass-border)]">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="질문을 입력하세요..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--glass-border)]
                       bg-[var(--bg-elevated)] text-sm
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent-secondary)]/30
                       disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="w-11 h-11 flex items-center justify-center rounded-xl
                       bg-[var(--accent-secondary)] text-white
                       disabled:opacity-40 transition-all touch-target"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
