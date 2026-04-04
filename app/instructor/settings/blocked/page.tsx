"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, UserX, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BlockedUsersPage() {
  const router = useRouter();
  const [muted, setMuted] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("naisser_muted") || "[]");
      setMuted(saved);
    } catch { /* */ }
  }, []);

  const unmute = (id: string) => {
    const next = muted.filter((m) => m !== id);
    setMuted(next);
    try { localStorage.setItem("naisser_muted", JSON.stringify(next)); } catch { /* */ }
  };

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots">
      <header className="sticky top-0 z-40 community-header">
        <div className="max-w-[520px] mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--subtle-hover)] transition-colors touch-target">
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <h1 className="text-[15px] font-bold text-[var(--text-primary)]">차단/뮤트 관리</h1>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 pt-4">
        {muted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UserX className="w-10 h-10 text-[var(--text-muted)] mb-3" style={{ opacity: 0.4 }} />
            <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">차단한 사용자가 없어요</p>
            <p className="text-[12px] text-[var(--text-muted)]">게시글 더보기 메뉴에서 뮤트할 수 있어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-[var(--text-muted)] mb-3">뮤트된 사용자의 글이 피드에서 숨겨집니다</p>
            {muted.map((id) => (
              <motion.div key={id} layout
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--subtle-border)]">
                <span className="text-[13px] text-[var(--text-primary)]">사용자 {id.slice(0, 8)}...</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => unmute(id)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-red-500 hover:bg-red-500/5 transition-colors">
                  해제
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
