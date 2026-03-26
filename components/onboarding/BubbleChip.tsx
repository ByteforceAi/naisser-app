"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

interface BubbleChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}

/** 선택 칩 — 바운스 애니메이션 + 선택/해제 토글 */
export function BubbleChip({
  label,
  selected,
  onClick,
  delay = 0,
}: BubbleChipProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay, ease: "easeOut" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "bubble-chip gap-1.5 touch-target",
        selected && "selected"
      )}
    >
      {selected && <Check className="w-3.5 h-3.5" />}
      {label}
    </motion.button>
  );
}
