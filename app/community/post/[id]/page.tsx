"use client";

import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { MessageSquare } from "lucide-react";

export default function PostDetailPage() {
  const router = useRouter();
  const [comment, setComment] = useState("");

  // TODO: fetch post by id
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--glass-border)]">
        <button onClick={() => router.back()} className="touch-target">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold">게시글</h1>
      </header>

      <div className="flex-1 px-4 py-6">
        <EmptyState
          icon={MessageSquare}
          title="게시글을 불러오는 중..."
          description="잠시만 기다려주세요"
        />
      </div>

      {/* 댓글 입력 */}
      <div className="shrink-0 px-4 py-3 bg-[var(--bg-surface)] border-t border-[var(--glass-border)]">
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-primary)] text-sm
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
          />
          <button
            disabled={!comment.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--accent-primary)] text-white
                       disabled:opacity-40 touch-target"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
