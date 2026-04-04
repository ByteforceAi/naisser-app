"use client";

import { motion } from "framer-motion";
import { School, ArrowLeft, MapPin, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRouter } from "next/navigation";

export default function InstructorSchoolsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots">
      {/* 프리미엄 헤더 */}
      <header className="page-header-premium">
        <button onClick={() => router.back()} className="ds-back-btn touch-target">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold flex-1">활동학교 관리</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
            boxShadow: "0 2px 8px rgba(59,108,246,0.25)",
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          학교 추가
        </motion.button>
      </header>

      <div className="relative z-10 px-5 pt-6 pb-24">
        {/* 안내 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="ds-card p-4 mb-8 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
            style={{ background: "rgba(37,99,235,0.08)" }}>
            <MapPin className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">
              활동학교를 등록하세요
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              자주 방문하는 학교를 등록하면 일정 관리와 출강이력이 자동으로 연동됩니다.
            </p>
          </div>
        </motion.div>

        <EmptyState
          icon={School}
          title="등록된 활동학교가 없어요"
          description="학교를 검색하여 추가해보세요"
        />
      </div>
    </div>
  );
}
