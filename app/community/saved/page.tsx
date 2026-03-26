"use client";

import { ArrowLeft, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";

export default function SavedPostsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-surface)] border-b border-[var(--glass-border)]">
        <button onClick={() => router.back()} className="touch-target">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold">저장한 글</h1>
      </header>

      <div className="px-4 py-4">
        <EmptyState
          icon={Bookmark}
          title="저장한 글이 없어요"
          description="관심 있는 게시글을 저장해보세요"
        />
      </div>
    </div>
  );
}
