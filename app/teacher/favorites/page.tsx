"use client";

import { Heart } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function TeacherFavoritesPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">즐겨찾기</h1>
      <EmptyState
        icon={Heart}
        title="저장한 강사가 없어요"
        description="관심 있는 강사를 저장해보세요"
        actionLabel="강사 찾기"
        onAction={() => { window.location.href = "/teacher/home"; }}
      />
    </div>
  );
}
