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
      {/* 봇 아바타 */}
      <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center shrink-0 text-white text-xs font-bold">
        N
      </div>

      {/* 메시지 버블 */}
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm
                    bg-[var(--bg-surface)] border border-[var(--glass-border)]
                    shadow-glass text-sm leading-relaxed"
      >
        {displayedText}
        {!isComplete && (
          <span className="inline-block w-0.5 h-4 bg-[var(--text-primary)] ml-0.5 animate-pulse align-text-bottom" />
        )}
      </div>
    </motion.div>
  );
}
