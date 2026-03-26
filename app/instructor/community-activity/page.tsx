"use client";

import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function InstructorCommunityActivityPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">내 커뮤니티 활동</h1>
      <EmptyState
        icon={MessageSquare}
        title="커뮤니티 활동이 없어요"
        description="첫 게시글을 작성해보세요!"
        actionLabel="글 쓰기"
        onAction={() => { window.location.href = "/community/write"; }}
      />
    </div>
  );
}
