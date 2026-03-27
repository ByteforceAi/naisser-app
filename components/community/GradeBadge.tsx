"use client";

import { cn } from "@/lib/utils/cn";

export type GradeKey = "sprout" | "active" | "veteran" | "mentor";

const GRADE_MAP: Record<
  GradeKey,
  { emoji: string; label: string; color: string }
> = {
  sprout: { emoji: "\u{1F331}", label: "\uC0C8\uC2F9", color: "#22C55E" },
  active: { emoji: "\u{1F33F}", label: "\uD65C\uB3D9", color: "#10B981" },
  veteran: {
    emoji: "\u{1F333}",
    label: "\uBCA0\uD14C\uB791",
    color: "#059669",
  },
  mentor: { emoji: "\u2B50", label: "\uBA58\uD1A0", color: "#F59E0B" },
};

interface GradeBadgeProps {
  grade: GradeKey;
  size?: "sm" | "md";
  className?: string;
}

/**
 * 커뮤니티 등급 배지
 * - 반익명 프로필 옆에 표시
 * - 멘토는 금색 테두리 특별 스타일
 */
export function GradeBadge({
  grade,
  size = "sm",
  className,
}: GradeBadgeProps) {
  const info = GRADE_MAP[grade] || GRADE_MAP.sprout;
  const isMentor = grade === "mentor";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium rounded-full",
        size === "sm" && "text-[10px] px-1.5 py-0.5",
        size === "md" && "text-xs px-2 py-1",
        isMentor
          ? "bg-amber-50 text-amber-700 ring-1 ring-amber-300"
          : "bg-emerald-50 text-emerald-700",
        className
      )}
      style={
        isMentor
          ? undefined
          : { backgroundColor: `${info.color}10`, color: info.color }
      }
    >
      <span>{info.emoji}</span>
      <span>{info.label}</span>
    </span>
  );
}
