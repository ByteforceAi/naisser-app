"use client";

import { motion } from "framer-motion";
import { MessageSquare, ArrowLeft, PenLine, Heart, MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRouter } from "next/navigation";

export default function InstructorCommunityActivityPage() {
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
        <h1 className="text-base font-bold">내 커뮤니티 활동</h1>
      </header>

      <div className="relative z-10 px-5 pt-6 pb-24">
        {/* 활동 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2 mb-8"
        >
          {[
            { label: "작성 글", value: "0", icon: PenLine, color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
            { label: "받은 좋아요", value: "0", icon: Heart, color: "#EC4899", bg: "rgba(236,72,153,0.08)" },
            { label: "받은 댓글", value: "0", icon: MessageCircle, color: "#059669", bg: "rgba(5,150,105,0.08)" },
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

        <EmptyState
          icon={MessageSquare}
          title="커뮤니티 활동이 없어요"
          description="첫 게시글을 작성해보세요! 다른 강사님들과 교류할 수 있어요."
          actionLabel="글 쓰기"
          onAction={() => { router.push("/community/write"); }}
        />
      </div>
    </div>
  );
}
