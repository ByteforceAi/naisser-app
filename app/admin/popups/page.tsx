"use client";

import { motion } from "framer-motion";
import { Plus, Image, Layers, Calendar } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminPopupsPage() {
  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-violet page-bg-dots">
      <div className="relative z-10 p-4 lg:p-8">
        {/* 헤더 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between mb-6 lg:ml-0 ml-12"
        >
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">팝업 관리</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">앱 내 팝업 배너 관리</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white touch-target"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
              boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
            }}
          >
            <Plus className="w-4 h-4" />
            새 팝업
          </motion.button>
        </motion.div>

        {/* 통계 카드 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.08 }}
          className="grid grid-cols-3 gap-3 mb-8 lg:ml-0 ml-12"
        >
          {[
            { label: "활성 팝업", value: "0", icon: Layers, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
            { label: "예약됨", value: "0", icon: Calendar, color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
            { label: "종료됨", value: "0", icon: Image, color: "#6B7280", bg: "rgba(107,114,128,0.08)" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.06 }}
              className="stat-card-premium"
              style={{ "--stat-accent": s.color } as React.CSSProperties}
            >
              <div className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: s.bg }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)]">{s.value}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <EmptyState
          icon={Image}
          title="등록된 팝업이 없어요"
          description="새 팝업을 만들어 사용자에게 중요한 소식을 알리세요"
        />
      </div>
    </div>
  );
}
