"use client";

import { Star } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function InstructorReviewsPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">내 리뷰</h1>
      <EmptyState
        icon={Star}
        title="아직 리뷰가 없어요"
        description="교사님들이 리뷰를 남기면 여기에 표시됩니다"
      />
    </div>
  );
}
