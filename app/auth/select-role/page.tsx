"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * /auth/select-role — 역할 선택
 *
 * 디스코드 서버 선택 + 게임 캐릭터 선택 스타일
 * 두 개의 "문(포털)"을 선택하는 느낌
 * - 강사: 블루-바이올렛 포털 (활동적, 따뜻한)
 * - 교사: 에메랄드-틸 포털 (안정적, 차분한)
 */
export default function SelectRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hoveredRole, setHoveredRole] = useState<"instructor" | "teacher" | null>(null);

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
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #2563eb, #7c3aed, #2563eb)",
              animation: "spin 3s linear infinite",
            }}
          />
          <div className="absolute inset-[3px] rounded-full" style={{ background: "#F8F9FC" }} />
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "회원";

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#0B0C10" }}>
      {/* ─── 배경: 미묘한 그리드 + 메시 ─── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 그리드 패턴 */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* 중앙 빛 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: hoveredRole === "instructor"
              ? "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)"
              : hoveredRole === "teacher"
              ? "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
            transition: "background 0.6s ease",
          }}
        />
      </div>

      {/* ─── 상단 ─── */}
      <header className="relative z-10 px-6 pt-[env(safe-area-inset-top)] py-5">
        <Link href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 홈으로
        </Link>
      </header>

      {/* ─── 메인 ─── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* AI 오브 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-10"
          >
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #2563eb, #7c3aed, #10b981, #2563eb)",
                  animation: "spin 8s linear infinite",
                }}
              />
              <div className="absolute inset-[2px] rounded-full" style={{ background: "#14151a" }} />
              <div className="absolute inset-[5px] rounded-full"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03))",
                }}
              />
              <div className="absolute -inset-4 rounded-full -z-10"
                style={{
                  background: "conic-gradient(from 0deg, #2563eb30, #7c3aed30, #10b98130, #2563eb30)",
                  filter: "blur(20px)",
                  animation: "spin 8s linear infinite",
                }}
              />
            </div>
          </motion.div>

          {/* 텍스트 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-[26px] font-bold text-white tracking-tight mb-3">
              {userName}님, 환영합니다
            </h1>
            <p className="text-[15px] text-white/40 leading-relaxed">
              어떤 역할로 시작하시겠어요?
            </p>
          </motion.div>

          {/* ─── 포털 카드 2개 ─── */}
          <div className="grid grid-cols-2 gap-4">
            {/* 강사 포털 */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 200, damping: 20 }}
              onMouseEnter={() => setHoveredRole("instructor")}
              onMouseLeave={() => setHoveredRole(null)}
              onClick={() => router.push("/onboarding")}
              className="relative group"
            >
              {/* 카드 */}
              <div className="relative overflow-hidden rounded-3xl p-6 pb-8 text-center transition-all duration-500"
                style={{
                  background: hoveredRole === "instructor"
                    ? "linear-gradient(180deg, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.08) 100%)"
                    : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${hoveredRole === "instructor" ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: hoveredRole === "instructor"
                    ? "0 8px 40px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  transform: hoveredRole === "instructor" ? "translateY(-4px)" : "translateY(0)",
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* 상단 글로우 라인 */}
                <div className="absolute top-0 left-[10%] right-[10%] h-[1px] transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)",
                    opacity: hoveredRole === "instructor" ? 1 : 0,
                  }}
                />

                {/* 아이콘 (SVG, 이모지 아님) */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500"
                  style={{
                    background: hoveredRole === "instructor"
                      ? "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.15))"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${hoveredRole === "instructor" ? "rgba(37,99,235,0.2)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    className="transition-colors duration-500"
                    style={{ color: hoveredRole === "instructor" ? "#60a5fa" : "rgba(255,255,255,0.3)" }}
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>

                <h3 className="text-lg font-bold tracking-tight mb-2 transition-colors duration-500"
                  style={{ color: hoveredRole === "instructor" ? "#93bbfd" : "rgba(255,255,255,0.7)" }}
                >
                  강사
                </h3>
                <p className="text-xs leading-relaxed transition-colors duration-500"
                  style={{ color: hoveredRole === "instructor" ? "rgba(147,187,253,0.6)" : "rgba(255,255,255,0.25)" }}
                >
                  학교에 수업을<br />알리고 싶어요
                </p>

                {/* 하단 화살표 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-500"
                  style={{
                    opacity: hoveredRole === "instructor" ? 1 : 0,
                    transform: `translateX(-50%) translateY(${hoveredRole === "instructor" ? "0" : "4px"})`,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </motion.button>

            {/* 교사 포털 */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, type: "spring", stiffness: 200, damping: 20 }}
              onMouseEnter={() => setHoveredRole("teacher")}
              onMouseLeave={() => setHoveredRole(null)}
              onClick={() => router.push("/teacher/register")}
              className="relative group"
            >
              <div className="relative overflow-hidden rounded-3xl p-6 pb-8 text-center transition-all duration-500"
                style={{
                  background: hoveredRole === "teacher"
                    ? "linear-gradient(180deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.08) 100%)"
                    : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${hoveredRole === "teacher" ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)"}`,
                  boxShadow: hoveredRole === "teacher"
                    ? "0 8px 40px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  transform: hoveredRole === "teacher" ? "translateY(-4px)" : "translateY(0)",
                  minHeight: "220px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* 상단 글로우 라인 */}
                <div className="absolute top-0 left-[10%] right-[10%] h-[1px] transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)",
                    opacity: hoveredRole === "teacher" ? 1 : 0,
                  }}
                />

                {/* 아이콘 */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500"
                  style={{
                    background: hoveredRole === "teacher"
                      ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${hoveredRole === "teacher" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    className="transition-colors duration-500"
                    style={{ color: hoveredRole === "teacher" ? "#34d399" : "rgba(255,255,255,0.3)" }}
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>

                <h3 className="text-lg font-bold tracking-tight mb-2 transition-colors duration-500"
                  style={{ color: hoveredRole === "teacher" ? "#6ee7b7" : "rgba(255,255,255,0.7)" }}
                >
                  교사
                </h3>
                <p className="text-xs leading-relaxed transition-colors duration-500"
                  style={{ color: hoveredRole === "teacher" ? "rgba(110,231,183,0.6)" : "rgba(255,255,255,0.25)" }}
                >
                  좋은 강사를<br />찾고 싶어요
                </p>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-500"
                  style={{
                    opacity: hoveredRole === "teacher" ? 1 : 0,
                    transform: `translateX(-50%) translateY(${hoveredRole === "teacher" ? "0" : "4px"})`,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          </div>

          {/* 둘러보기 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-10"
          >
            <Link href="/teacher/home"
              className="text-sm text-white/20 hover:text-white/40 transition-colors">
              먼저 둘러볼게요 →
            </Link>
          </motion.div>
        </div>
      </main>

      {/* 하단 */}
      <footer className="relative z-10 text-center pb-8 px-6">
        <p className="text-[11px] text-white/10">
          NAISSER — 학교와 강사를 연결합니다
        </p>
      </footer>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
