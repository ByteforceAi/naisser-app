"use client";

import { Plus, Image } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AdminPopupsPage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6 lg:ml-0 ml-12">
        <h1 className="text-2xl font-bold">팝업 관리</h1>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                           bg-[var(--accent-secondary)] text-white transition-all touch-target">
          <Plus className="w-4 h-4" />
          새 팝업
        </button>
      </div>
      <EmptyState
        icon={Image}
        title="등록된 팝업이 없어요"
        description="새 팝업을 만들어보세요"
      />
    </div>
  );
}
