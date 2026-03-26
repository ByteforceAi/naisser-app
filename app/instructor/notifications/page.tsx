"use client";

import { Bell } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function InstructorNotificationsPage() {
  // TODO: fetch notifications from /api/notifications
  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">알림</h1>
        <button className="text-sm text-[var(--accent-primary)] font-medium touch-target">
          전체 읽음
        </button>
      </div>

      <EmptyState
        icon={Bell}
        title="알림이 없어요"
        description="새로운 의뢰나 소식이 오면 알려드릴게요"
      />
    </div>
  );
}
