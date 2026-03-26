"use client";

import { cn } from "@/lib/utils/cn";

const POST_TYPES = {
  case: { label: "📸 수업사례", color: "bg-blue-50 text-blue-700" },
  question: { label: "❓ 질문", color: "bg-orange-50 text-orange-700" },
  info: { label: "💡 정보", color: "bg-green-50 text-green-700" },
  free: { label: "💬 자유", color: "bg-gray-50 text-gray-600" },
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
