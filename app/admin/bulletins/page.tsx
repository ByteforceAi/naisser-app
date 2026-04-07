"use client";

import { motion } from "framer-motion";
import { Plus, Megaphone, Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminBulletinsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      <div className="relative z-10 p-4 lg:p-8">
        {/* 헤더 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between mb-6 lg:ml-0 ml-12"
        >
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">공지사항 관리</h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">플랫폼 공지 및 알림 관리</p>
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
            새 공지
          </motion.button>
        </motion.div>

        {/* 검색 & 필터 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.08 }}
          className="flex items-center gap-2 mb-6 lg:ml-0 ml-12"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              placeholder="공지사항 검색..."
              className="ds-input pl-9"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl
                             border border-[var(--glass-border)] bg-[var(--bg-surface)] touch-target">
            <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </motion.div>

        {/* 빈 상태 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <EmptyState
            icon={Megaphone}
            title="등록된 공지사항이 없어요"
            description="새 공지사항을 작성하면 강사와 교사에게 알림이 전송됩니다"
          />
        </motion.div>
      </div>
    </div>
  );
}
