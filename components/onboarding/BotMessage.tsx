"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface BotMessageProps {
  text: string;
  /** 타자기 효과 속도 (ms/글자), 0이면 즉시 표시 */
  typeSpeed?: number;
  onComplete?: () => void;
}

/** 봇 메시지 — 타자기 효과 (20ms/글자) + slideUp + fadeIn */
export function BotMessage({
  text,
  typeSpeed = 20,
  onComplete,
}: BotMessageProps) {
  const [displayedText, setDisplayedText] = useState(
    typeSpeed === 0 ? text : ""
  );
  const [isComplete, setIsComplete] = useState(typeSpeed === 0);

  useEffect(() => {
    if (typeSpeed === 0) {
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    let index = 0;
    setDisplayedText("");
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, typeSpeed);

    return () => clearInterval(interval);
  }, [text, typeSpeed, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex gap-2 items-end max-w-[85%]"
    >
      {/* 봇 아바타 — Liquid Glass mini Orb */}
      <div className="w-8 h-8 rounded-[10px] shrink-0 overflow-hidden" style={{
        background: "var(--glass-bg, rgba(255,255,255,0.6))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "0.5px solid var(--glass-border)",
        boxShadow: "0 2px 8px rgba(0,136,255,0.1)",
        padding: "2px",
      }}>
        <div className="w-full h-full rounded-[8px] overflow-hidden relative">
          <div className="absolute inset-0" style={{
            background: "conic-gradient(from 0deg, var(--accent-primary), #6155f5, var(--accent-primary))",
            animation: "orbSpin 5s linear infinite",
          }} />
          <div className="absolute inset-[2px] rounded-[6px]" style={{ background: "var(--bg-surface)" }} />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: "var(--accent-primary)" }}>N</div>
        </div>
      </div>

      {/* 메시지 버블 — Liquid Glass frost */}
      <div
        className="px-4 py-3 rounded-xl rounded-bl-sm text-sm leading-relaxed"
        style={{
          background: "var(--glass-bg, rgba(255,255,255,0.65))",
          backdropFilter: "blur(14px) saturate(1.4)",
          WebkitBackdropFilter: "blur(14px) saturate(1.4)",
          border: "0.5px solid var(--glass-border)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.4)",
          color: "var(--text-primary)",
        }}
      >
        {displayedText}
        {!isComplete && (
          <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-text-bottom" style={{ background: "var(--accent-primary)" }} />
        )}
      </div>
    </motion.div>
  );
}
