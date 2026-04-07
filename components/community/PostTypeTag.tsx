"use client";

import { cn } from "@/lib/utils/cn";

const POST_TYPES = {
  case: { label: "📸 수업사례", color: "bg-[rgba(0,122,255,0.08)] text-[#007AFF]" },
  question: { label: "❓ 질문", color: "bg-[rgba(255,149,0,0.08)] text-[#FF9500]" },
  info: { label: "💡 정보", color: "bg-[rgba(52,199,89,0.08)] text-[#34C759]" },
  free: { label: "💬 자유", color: "bg-[var(--bg-muted)] text-[var(--text-secondary)]" },
} as const;

interface PostTypeTagProps {
  type: keyof typeof POST_TYPES;
}

export function PostTypeTag({ type }: PostTypeTagProps) {
  const config = POST_TYPES[type] || POST_TYPES.free;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        config.color
      )}
    >
      {config.label}
    </span>
  );
}
