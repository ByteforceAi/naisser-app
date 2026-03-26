"use client";

import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function TeacherSearchPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">강사 검색</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          placeholder="강사명, 주제, 지역으로 검색"
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-[var(--glass-border)]
                     bg-[var(--bg-surface)] text-sm
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
        />
      </div>
      <EmptyState
        icon={Search}
        title="검색어를 입력해주세요"
        description="강사명, 강의 주제, 지역으로 검색할 수 있어요"
      />
    </div>
  );
}
