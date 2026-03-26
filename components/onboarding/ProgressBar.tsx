"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

/** 온보딩 프로그레스 바 — 상단 고정, width transition 500ms ease-out */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1 bg-[var(--bg-muted)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[var(--accent-primary)] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-[var(--text-muted)] tabular-nums whitespace-nowrap">
        {current}/{total}
      </span>
    </div>
  );
}
