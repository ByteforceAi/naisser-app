"use client";

import { cn } from "@/lib/utils/cn";

/** 뱃지 타입 → 이모지 + 라벨 매핑 */
const BADGE_CONFIG: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  early_bird: { emoji: "🐣", label: "얼리버드", color: "bg-yellow-50 text-yellow-700" },
  verified: { emoji: "✅", label: "인증강사", color: "bg-green-50 text-green-700" },
  review_king: { emoji: "⭐", label: "리뷰왕", color: "bg-orange-50 text-orange-700" },
  active_instructor: { emoji: "🔥", label: "활발한 강사", color: "bg-red-50 text-red-600" },
  veteran: { emoji: "🏆", label: "베테랑", color: "bg-purple-50 text-purple-700" },
  reviewer: { emoji: "📝", label: "리뷰어", color: "bg-blue-50 text-blue-700" },
  active_teacher: { emoji: "🔥", label: "활발한 교사", color: "bg-red-50 text-red-600" },
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
