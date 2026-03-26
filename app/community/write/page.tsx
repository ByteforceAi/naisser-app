"use client";

import { useState } from "react";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const POST_TYPES = [
  { id: "free", label: "💬 자유" },
  { id: "case", label: "📸 수업사례" },
  { id: "question", label: "❓ 질문" },
  { id: "info", label: "💡 정보" },
] as const;

export default function CommunityWritePage() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState("free");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardType: "all", body, postType }),
      });
      if (res.ok) router.push("/community");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--glass-border)]">
        <button onClick={() => router.back()} className="touch-target">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold">글 쓰기</h1>
        <button
          onClick={handleSubmit}
          disabled={!body.trim() || isSubmitting}
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
            body.trim()
              ? "bg-[var(--accent-primary)] text-white"
              : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
          )}
        >
          {isSubmitting ? "등록 중..." : "등록"}
        </button>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* 글 유형 선택 */}
        <div className="flex gap-2">
          {POST_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setPostType(type.id)}
              className={`bubble-chip text-xs ${postType === type.id ? "selected" : ""}`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* 본문 */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="수업 경험, 질문, 정보를 자유롭게 공유해보세요..."
          rows={12}
          maxLength={5000}
          className="w-full p-0 text-base leading-relaxed bg-transparent resize-none
                     focus:outline-none placeholder:text-[var(--text-muted)]"
        />

        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <button className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-[var(--bg-elevated)] touch-target">
            <ImagePlus className="w-5 h-5" />
            <span>사진 추가</span>
          </button>
          <span>{body.length}/5,000</span>
        </div>
      </div>
    </div>
  );
}
