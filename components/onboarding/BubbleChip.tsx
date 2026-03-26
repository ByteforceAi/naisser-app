"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

interface BubbleChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}

/**
 * 버블칩 — Spotify/Apple Music 온보딩 스타일
 *
 * - rounded-full 완전 알약형
 * - 선택 시 그라데이션 배경 + 우상단 체크 뱃지
 * - Spring bounce (탱탱한 피드백)
 * - 넉넉한 터치 영역 (px-5 py-3)
 */
export function BubbleChip({
  label,
  selected,
  onClick,
  delay = 0,
}: BubbleChipProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        type: "spring" as const,
        stiffness: 400,
        damping: 12,
      }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-2 px-5 py-3 rounded-full",
        "text-[15px] font-medium select-none touch-target",
        "border-[1.5px] transition-colors duration-200",
        selected
          ? "bg-gradient-to-r from-blue-500 to-violet-500 border-transparent text-white shadow-lg shadow-blue-500/20"
          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      {/* 선택 시 체크 아이콘 */}
      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring" as const, stiffness: 500, damping: 15 }}
          >
            <Check className="w-4 h-4" strokeWidth={2.5} />
          </motion.span>
        )}
      </AnimatePresence>
      <span>{label}</span>
    </motion.button>
  );
}
