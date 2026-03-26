"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { id: "pending", label: "대기중" },
  { id: "accepted", label: "수락" },
  { id: "rejected", label: "거절" },
  { id: "expired", label: "만료" },
] as const;

export default function InstructorRequestsPage() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">의뢰함</h1>

      {/* 탭 */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200",
              activeTab === tab.id
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <EmptyState
        icon={Inbox}
        title="아직 수업 요청이 없어요"
        description="프로필을 완성하면 교사님들의 요청을 받을 수 있어요"
      />
    </div>
  );
}
