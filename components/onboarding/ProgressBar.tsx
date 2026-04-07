"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

/**
 * 프로그레스 바 — Interaction Spec v2.0
 * - width 애니메이션 (500ms smooth decel)
 * - 끝점에 glow flash
 * - 숫자 슬롯머신 전환
 */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="flex items-center gap-3">
      {/* 바 */}
      <div className="flex-1 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden relative">
        <motion.div
          className="h-full rounded-full relative"
          style={{ background: "linear-gradient(90deg, #2563eb, #3b82f6)" }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* 끝점 글로우 */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{
              background: "var(--accent-primary)",
              boxShadow: "0 0 8px 2px rgba(59,130,246,0.5)",
            }}
          />
        </motion.div>
      </div>

      {/* 슬롯머신 숫자 */}
      <div className="relative w-8 h-5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={current}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-end text-xs text-[var(--text-muted)] tabular-nums"
          >
            {current}/{total}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
