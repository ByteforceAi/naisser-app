"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * /auth/select-role
 * 로그인 완료 후 role이 "new"인 사용자만 보는 화면
 * - 기존 사용자 → 자동 리다이렉트
 * - 랜딩과 동일한 프리미엄 톤
 */
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F9FC" }}>
        {/* 랜딩 오브와 동일한 로딩 */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: "conic-gradient(from 0deg, #2563eb, #7c3aed, #2563eb)",
              animationDuration: "3s",
            }}
          />
          <div className="absolute inset-[3px] rounded-full bg-white" />
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "회원";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8F9FC" }}>
      {/* ─── 배경 메시 그라데이션 (랜딩과 동일) ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[70%] h-[70%] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #2563eb, transparent 70%)" }} />
        <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
      </div>

      {/* ─── 상단 뒤로가기 ─── */}
      <header className="relative z-10 px-6 pt-[env(safe-area-inset-top)] py-4">
        <Link href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 홈으로
        </Link>
      </header>

      {/* ─── 메인 콘텐츠 ─── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* AI 오브 (랜딩과 동일) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-8"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #2563eb, #7c3aed, #2563eb)",
                  animation: "spin 8s linear infinite",
                }}
              />
              <div className="absolute inset-[3px] rounded-full"
                style={{ background: "linear-gradient(180deg, #f0f0ff 0%, #e8e8f8 100%)" }}
              />
              <div className="absolute inset-[6px] rounded-full"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)",
                }}
              />
              {/* 글로우 */}
              <div className="absolute -inset-3 rounded-full -z-10"
                style={{
                  background: "conic-gradient(from 0deg, #2563eb40, #7c3aed40, #2563eb40)",
                  filter: "blur(15px)",
                  animation: "spin 8s linear infinite",
                }}
              />
            </div>
          </motion.div>

          {/* 환영 텍스트 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              {userName}님, 환영합니다.
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              어떤 역할로 나이써를 사용하실 건가요?
            </p>
          </motion.div>

          {/* ─── 역할 선택 카드 ─── */}
          <div className="space-y-3">
            {/* 강사 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/onboarding")}
              className="w-full text-left p-5 rounded-2xl transition-all duration-200 group"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid rgba(37,99,235,0.08)",
                boxShadow: "0 2px 12px rgba(37,99,235,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.08))",
                  }}
                >
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[15px] text-gray-900 group-hover:text-blue-600 transition-colors">
                    강사입니다
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    학교에 수업을 알리고 싶어요
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>

            {/* 교사 */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/teacher/register")}
              className="w-full text-left p-5 rounded-2xl transition-all duration-200 group"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid rgba(5,150,105,0.08)",
                boxShadow: "0 2px 12px rgba(5,150,105,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, rgba(5,150,105,0.1), rgba(16,185,129,0.08))",
                  }}
                >
                  <span className="text-2xl">🏫</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[15px] text-gray-900 group-hover:text-emerald-600 transition-colors">
                    교사입니다
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    좋은 강사를 찾고 싶어요
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          </div>

          {/* 둘러보기 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <Link href="/teacher/home"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              먼저 둘러볼게요 →
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* ─── 하단 안내 ─── */}
      <footer className="relative z-10 text-center pb-8 px-6">
        <p className="text-[11px] text-gray-300">
          나이써는 학교와 강사를 연결하는 교육 매칭 플랫폼입니다
        </p>
      </footer>
    </div>
  );
}
