"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Inbox, ArrowLeft, Bell, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "pending", label: "대기중", emoji: "⏳" },
  { id: "accepted", label: "수락", emoji: "✅" },
  { id: "rejected", label: "거절", emoji: "❌" },
  { id: "expired", label: "만료", emoji: "⏰" },
] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function InstructorRequestsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3" style={{
        background: "var(--bg-grouped)",
        opacity: 0.95,
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
      }}>
        <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-lg active:bg-[var(--bg-muted)] touch-target">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />
        </button>
        <h1 className="text-base font-bold flex-1">의뢰함</h1>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center
                           bg-[var(--bg-surface)] border border-[var(--glass-border)] touch-target">
          <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </header>

      <div className="relative z-10 px-5 pt-4 pb-24">
        {/* 프리미엄 탭 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="tabs-premium mb-6"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "tab-premium",
                activeTab === tab.id && "active"
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* 안내 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl p-4 mb-8 flex items-start gap-3"
          style={{ background: "var(--bg-grouped-secondary)", border: "none" }}
        >
          <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))" }}>
            <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">
              수업 의뢰가 도착하면 알려드려요
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              프로필을 완성할수록 교사님들의 의뢰를 받을 확률이 높아집니다.
            </p>
          </div>
        </motion.div>

        <EmptyState
          icon={Inbox}
          title="아직 수업 요청이 없어요"
          description="프로필을 완성하면 교사님들의 요청을 받을 수 있어요"
        />
      </div>
    </div>
  );
}
