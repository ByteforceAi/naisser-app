"use client";

import { cn } from "@/lib/utils/cn";

/** 뱃지 타입 → 이모지 + 라벨 매핑 */
const BADGE_CONFIG: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  early_bird: { emoji: "🐣", label: "얼리버드", color: "bg-[rgba(255,204,0,0.08)] text-[#FF9500]" },
  verified: { emoji: "✅", label: "인증강사", color: "bg-[rgba(52,199,89,0.08)] text-[#34C759]" },
  review_king: { emoji: "⭐", label: "리뷰왕", color: "bg-[rgba(255,149,0,0.08)] text-[#FF9500]" },
  active_instructor: { emoji: "🔥", label: "활발한 강사", color: "bg-[rgba(255,59,48,0.08)] text-[#FF3B30]" },
  veteran: { emoji: "🏆", label: "베테랑", color: "bg-[rgba(88,86,214,0.08)] text-[#5856D6]" },
  reviewer: { emoji: "📝", label: "리뷰어", color: "bg-[rgba(0,122,255,0.08)] text-[#007AFF]" },
  active_teacher: { emoji: "🔥", label: "활발한 교사", color: "bg-[rgba(255,59,48,0.08)] text-[#FF3B30]" },
};

interface BadgeIconProps {
  type: string;
  size?: "sm" | "md";
}

export function BadgeIcon({ type, size = "sm" }: BadgeIconProps) {
  const config = BADGE_CONFIG[type];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full font-medium",
        config.color,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      )}
    >
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}
