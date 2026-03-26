"use client";

import { Plus, Megaphone } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AdminBulletinsPage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6 lg:ml-0 ml-12">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                           bg-[var(--accent-secondary)] text-white transition-all touch-target">
          <Plus className="w-4 h-4" />
          새 공지
        </button>
      </div>
      <EmptyState
        icon={Megaphone}
        title="등록된 공지사항이 없어요"
        description="새 공지사항을 작성해보세요"
      />
    </div>
  );
}
