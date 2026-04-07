"use client";

import { cn } from "@/lib/utils/cn";

const POST_TYPES = {
  case: { label: "📸 수업사례", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  question: { label: "❓ 질문", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  info: { label: "💡 정보", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
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
