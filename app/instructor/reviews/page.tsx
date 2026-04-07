"use client";

import { motion } from "framer-motion";
import { Star, ArrowLeft, TrendingUp, BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRouter } from "next/navigation";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function InstructorReviewsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      {/* 프리미엄 헤더 */}
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3" style={{
        background: "var(--bg-grouped)",
        opacity: 0.95,
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
      }}>
        <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-lg active:bg-[var(--bg-muted)] touch-target">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />
        </button>
        <h1 className="text-base font-bold">내 리뷰</h1>
      </header>

      <div className="relative z-10 px-5 pt-6 pb-24">
        {/* 리뷰 요약 카드 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4 }}
          className="grid grid-cols-3 gap-2 mb-8"
        >
          {[
            { label: "평균 평점", value: "—", icon: Star, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
            { label: "총 리뷰", value: "0건", icon: BarChart3, color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
            { label: "재요청률", value: "—", icon: TrendingUp, color: "#059669", bg: "rgba(5,150,105,0.08)" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
              className="stat-card-premium"
              style={{ "--stat-accent": s.color } as React.CSSProperties}
            >
              <div
                className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: s.bg }}
              >
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)]">{s.value}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 빈 상태 */}
        <EmptyState
          icon={Star}
          title="아직 리뷰가 없어요"
          description="교사님들이 수업 후 리뷰를 남기면 여기에 표시됩니다. 프로필을 완성하면 더 많은 매칭 기회가 생겨요!"
        />
      </div>
    </div>
  );
}
