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
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      <div className="sticky top-0 z-50 px-5 py-3 flex items-center gap-3"
        style={{ background: "var(--bg-grouped)", opacity: 0.95, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors touch-target">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        </button>
        <h1 className="text-[17px] font-semibold" style={{ color: "var(--text-primary)" }}>차단/뮤트 관리</h1>
      </div>

      <div className="max-w-[520px] mx-auto px-5 pt-2">
        {muted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UserX className="w-10 h-10 mb-3" style={{ color: "var(--text-muted)", opacity: 0.4 }} />
            <p className="text-[15px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>차단한 사용자가 없어요</p>
            <p className="text-[13px]" style={{ color: "var(--ios-gray)" }}>게시글 더보기 메뉴에서 뮤트할 수 있어요</p>
          </div>
        ) : (
          <div>
            <p className="text-[13px] px-4 mb-2" style={{ color: "var(--ios-gray)" }}>뮤트된 사용자의 글이 피드에서 숨겨집니다</p>
            <div className="rounded-[14px] overflow-hidden" style={{ background: "var(--bg-grouped-secondary)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              {muted.map((id, i) => (
                <motion.div key={id} layout
                  className="flex items-center justify-between px-4 py-3"
                  style={i < muted.length - 1 ? { borderBottom: "0.5px solid var(--ios-separator)" } : {}}>
                  <span className="text-[15px]" style={{ color: "var(--text-primary)" }}>사용자 {id.slice(0, 8)}...</span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => unmute(id)}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-500/5 transition-colors">
                    해제
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
