"use client";

import { motion } from "framer-motion";

/** 봇 타이핑 인디케이터 — 점 3개 바운스 */
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-1 px-4 py-3 rounded-xl rounded-bl-sm
                 bg-[var(--bg-surface)] border border-[var(--glass-border)]
                 shadow-glass w-fit"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-[var(--text-muted)]"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
}
