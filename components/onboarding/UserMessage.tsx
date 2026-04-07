"use client";

import { motion } from "framer-motion";

interface UserMessageProps {
  text: string;
}

/** 사용자 메시지 버블 — 우측 정렬, slideUp */
export function UserMessage({ text }: UserMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex justify-end"
    >
      <div
        className="px-4 py-3 rounded-xl rounded-br-sm max-w-[85%]
                    bg-[var(--accent-primary)] text-white
                    text-sm leading-relaxed"
      >
        {text}
      </div>
    </motion.div>
  );
}
