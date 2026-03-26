"use client";

import { useState } from "react";
import { Pen, Search } from "lucide-react";
import Link from "next/link";
import { SUBJECT_CATEGORIES } from "@/lib/constants/categories";
import { EmptyState } from "@/components/shared/EmptyState";
import { PostCard, type PostCardData } from "@/components/community/PostCard";

const TABS = [
  { id: "all", label: "전체" },
  { id: "topic", label: "주제별" },
  { id: "school", label: "학교별" },
] as const;

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const posts: PostCardData[] = []; // TODO: API fetch

  return (
    <div className="min-h-screen pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 px-4 pt-4 pb-2 bg-[var(--bg-primary)]/95 backdrop-blur-lg">
        <h1 className="text-xl font-bold mb-3">커뮤니티</h1>

        {/* 탭 */}
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-elevated)]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 주제 필터 (주제별 탭일 때만) */}
        {activeTab === "topic" && (
          <div className="mt-2 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-1">
              {SUBJECT_CATEGORIES.slice(0, -1).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedTopic(cat.id === selectedTopic ? null : cat.id)}
                  className={`bubble-chip whitespace-nowrap text-xs ${selectedTopic === cat.id ? "selected" : ""}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* 피드 */}
      <div className="px-4 space-y-3 mt-2">
        {posts.length > 0 ? (
          posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)
        ) : (
          <EmptyState
            icon={Search}
            title="첫 번째 이야기를 나눠보세요!"
            description="수업 사례, 질문, 정보를 공유해보세요."
            actionLabel="글 쓰기"
            onAction={() => window.location.href = "/community/write"}
          />
        )}
      </div>

      {/* FAB 글쓰기 버튼 */}
      <Link
        href="/community/write"
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full
                   bg-[var(--accent-primary)] text-white shadow-btn-primary
                   hover:shadow-btn-primary-hover
                   flex items-center justify-center
                   transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
      >
        <Pen className="w-5 h-5" />
      </Link>
    </div>
  );
}
