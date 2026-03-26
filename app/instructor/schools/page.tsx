"use client";

import { School } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function InstructorSchoolsPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">활동학교 관리</h1>
      <EmptyState
        icon={School}
        title="등록된 활동학교가 없어요"
        description="학교를 검색하여 추가해보세요"
        actionLabel="학교 추가"
        onAction={() => {}}
      />
    </div>
  );
}
