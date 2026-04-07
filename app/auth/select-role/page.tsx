"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SelectRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { router.replace("/"); return; }
    if (!session?.user) return;
    const role = (session.user as { role?: string }).role;
    if (role === "instructor") { router.replace("/instructor"); return; }
    if (role === "teacher") { router.replace("/teacher/home"); return; }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-grouped)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent-primary)" }} />
      </div>
    );
  }

  const userName = session?.user?.name || "회원";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-grouped)" }}>

      {/* ═══ 상단 프로필 영역 ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* 프로필 아바타 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 rounded-full mb-6 flex items-center justify-center"
          style={{ background: "var(--accent-primary)" }}
        >
          <span className="text-[32px] font-bold text-white">
            {userName.charAt(0)}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-10"
        >
          <h1 className="text-[22px] font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            {userName}님, 환영합니다
          </h1>
          <p className="text-[15px]" style={{ color: "var(--ios-gray)" }}>
            어떤 역할로 나이써를 사용하실 건가요?
          </p>
        </motion.div>

        {/* ═══ 역할 선택 — iOS Grouped List ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-grouped-secondary)" }}>
            {/* 강사 */}
            <button
              onClick={() => router.push("/onboarding/quick")}
              className="w-full flex items-center gap-4 px-4 py-[14px] text-left
                         active:bg-[rgba(0,0,0,0.04)] transition-colors"
              style={{ borderBottom: "0.5px solid var(--ios-separator)" }}
            >
              <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--accent-primary)" }}>
                <Users className="w-[22px] h-[22px] text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[17px] font-semibold block" style={{ color: "var(--text-primary)" }}>
                  강사입니다
                </span>
                <span className="text-[15px]" style={{ color: "var(--ios-gray)" }}>
                  학교에 수업을 알리고 싶어요
                </span>
              </div>
              <ChevronRight className="w-[14px] h-[14px] shrink-0" style={{ color: "var(--ios-gray3)" }} />
            </button>

            {/* 교사 */}
            <button
              onClick={() => router.push("/teacher/register")}
              className="w-full flex items-center gap-4 px-4 py-[14px] text-left
                         active:bg-[rgba(0,0,0,0.04)] transition-colors"
            >
              <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--accent-success)" }}>
                <BookOpen className="w-[22px] h-[22px] text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[17px] font-semibold block" style={{ color: "var(--text-primary)" }}>
                  교사입니다
                </span>
                <span className="text-[15px]" style={{ color: "var(--ios-gray)" }}>
                  좋은 강사를 찾고 싶어요
                </span>
              </div>
              <ChevronRight className="w-[14px] h-[14px] shrink-0" style={{ color: "var(--ios-gray3)" }} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* 하단 */}
      <footer className="text-center pb-8 px-6" style={{ paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))" }}>
        <p className="text-[13px]" style={{ color: "var(--ios-gray)" }}>
          NAISSER — 학교와 강사를 연결합니다
        </p>
      </footer>
    </div>
  );
}
