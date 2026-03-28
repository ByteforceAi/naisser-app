"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * /auth/select-role — 역할 선택 (라이트 테마)
 *
 * 심플 & 프리미엄 — 글래스모피즘 카드 2장
 * 호버 시 테두리 글로우 + 배경 메시 반응
 */
export default function SelectRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hoveredRole, setHoveredRole] = useState<
    "instructor" | "teacher" | null
  >(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
    if (!session?.user) return;
    const role = (session.user as { role?: string }).role;
    if (role === "instructor") {
      router.replace("/instructor");
      return;
    }
    if (role === "teacher") {
      router.replace("/teacher/home");
      return;
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F8F9FC" }}
      >
        <div className="relative w-16 h-16">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, #2563eb, #7c3aed, #2563eb)",
              animation: "spin 3s linear infinite",
            }}
          />
          <div
            className="absolute inset-[3px] rounded-full"
            style={{ background: "#F8F9FC" }}
          />
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "회원";

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#F8F9FC" }}
    >
      {/* ─── 배경: 미묘한 그리드 + 호버 메시 ─── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 그리드 패턴 (라이트) */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* 중앙 글로우 — 호버에 반응 */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              hoveredRole === "instructor"
                ? "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)"
                : hoveredRole === "teacher"
                  ? "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 70%)",
            transition: "background 0.6s ease",
          }}
        />
      </div>

      {/* ─── 상단 ─── */}
      <header className="relative z-10 px-6 pt-[env(safe-area-inset-top)] py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 홈으로
        </Link>
      </header>

      {/* ─── 메인 ─── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* AI 오브 (라이트 버전) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-10"
          >
            <div className="relative w-14 h-14">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, #2563eb, #7c3aed, #10b981, #2563eb)",
                  animation: "spin 8s linear infinite",
                }}
              />
              <div
                className="absolute inset-[2px] rounded-full"
                style={{ background: "#F8F9FC" }}
              />
              <div
                className="absolute inset-[5px] rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(16,185,129,0.08))",
                }}
              />
              <div
                className="absolute -inset-4 rounded-full -z-10"
                style={{
                  background:
                    "conic-gradient(from 0deg, #2563eb20, #7c3aed20, #10b98120, #2563eb20)",
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
            <h1 className="text-[26px] font-bold text-gray-900 tracking-tight mb-3">
              {userName}님, 환영합니다
            </h1>
            <p className="text-[15px] text-gray-400 leading-relaxed">
              어떤 역할로 나이써를 사용하실 건가요?
            </p>
          </motion.div>

          {/* ─── 역할 카드 2개 (세로 배치, 모바일 친화) ─── */}
          <div className="flex flex-col gap-3">
            {/* 강사 카드 */}
            <motion.button
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.35,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredRole("instructor")}
              onMouseLeave={() => setHoveredRole(null)}
              onTouchStart={() => setHoveredRole("instructor")}
              onTouchEnd={() => setHoveredRole(null)}
              onClick={() => router.push("/onboarding/quick")}
              className="relative w-full text-left"
            >
              <div
                className="flex items-center gap-4 rounded-2xl px-5 py-5 transition-all duration-300"
                style={{
                  background:
                    hoveredRole === "instructor"
                      ? "rgba(255,255,255,0.95)"
                      : "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(12px)",
                  border: `1.5px solid ${
                    hoveredRole === "instructor"
                      ? "rgba(37,99,235,0.25)"
                      : "rgba(0,0,0,0.06)"
                  }`,
                  boxShadow:
                    hoveredRole === "instructor"
                      ? "0 8px 32px rgba(37,99,235,0.12), 0 2px 8px rgba(0,0,0,0.04)"
                      : "0 2px 8px rgba(0,0,0,0.03)",
                  transform:
                    hoveredRole === "instructor"
                      ? "translateY(-2px)"
                      : "translateY(0)",
                }}
              >
                {/* 아이콘 */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    background:
                      hoveredRole === "instructor"
                        ? "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.08))"
                        : "rgba(37,99,235,0.06)",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-colors duration-300"
                    style={{
                      color:
                        hoveredRole === "instructor"
                          ? "#2563eb"
                          : "#93a3b8",
                    }}
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>

                {/* 텍스트 */}
                <div className="flex-1">
                  <h3
                    className="text-base font-bold tracking-tight mb-0.5 transition-colors duration-300"
                    style={{
                      color:
                        hoveredRole === "instructor"
                          ? "#1e40af"
                          : "#1f2937",
                    }}
                  >
                    강사입니다
                  </h3>
                  <p className="text-sm text-gray-400">
                    학교에 수업을 알리고 싶어요
                  </p>
                </div>

                {/* 화살표 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-300 shrink-0"
                  style={{
                    color:
                      hoveredRole === "instructor"
                        ? "#2563eb"
                        : "#d1d5db",
                    transform:
                      hoveredRole === "instructor"
                        ? "translateX(2px)"
                        : "translateX(0)",
                  }}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </motion.button>

            {/* 교사 카드 */}
            <motion.button
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.45,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHoveredRole("teacher")}
              onMouseLeave={() => setHoveredRole(null)}
              onTouchStart={() => setHoveredRole("teacher")}
              onTouchEnd={() => setHoveredRole(null)}
              onClick={() => router.push("/teacher/register")}
              className="relative w-full text-left"
            >
              <div
                className="flex items-center gap-4 rounded-2xl px-5 py-5 transition-all duration-300"
                style={{
                  background:
                    hoveredRole === "teacher"
                      ? "rgba(255,255,255,0.95)"
                      : "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(12px)",
                  border: `1.5px solid ${
                    hoveredRole === "teacher"
                      ? "rgba(16,185,129,0.25)"
                      : "rgba(0,0,0,0.06)"
                  }`,
                  boxShadow:
                    hoveredRole === "teacher"
                      ? "0 8px 32px rgba(16,185,129,0.12), 0 2px 8px rgba(0,0,0,0.04)"
                      : "0 2px 8px rgba(0,0,0,0.03)",
                  transform:
                    hoveredRole === "teacher"
                      ? "translateY(-2px)"
                      : "translateY(0)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    background:
                      hoveredRole === "teacher"
                        ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))"
                        : "rgba(16,185,129,0.06)",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-colors duration-300"
                    style={{
                      color:
                        hoveredRole === "teacher" ? "#059669" : "#93a3b8",
                    }}
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>

                <div className="flex-1">
                  <h3
                    className="text-base font-bold tracking-tight mb-0.5 transition-colors duration-300"
                    style={{
                      color:
                        hoveredRole === "teacher" ? "#065f46" : "#1f2937",
                    }}
                  >
                    교사입니다
                  </h3>
                  <p className="text-sm text-gray-400">
                    좋은 강사를 찾고 싶어요
                  </p>
                </div>

                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-300 shrink-0"
                  style={{
                    color:
                      hoveredRole === "teacher" ? "#059669" : "#d1d5db",
                    transform:
                      hoveredRole === "teacher"
                        ? "translateX(2px)"
                        : "translateX(0)",
                  }}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
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
            <Link
              href="/teacher/home"
              className="text-sm text-gray-300 hover:text-gray-500 transition-colors"
            >
              먼저 둘러볼게요 →
            </Link>
          </motion.div>
        </div>
      </main>

      {/* 하단 */}
      <footer className="relative z-10 text-center pb-8 px-6">
        <p className="text-[11px] text-gray-300">
          NAISSER — 학교와 강사를 연결합니다
        </p>
      </footer>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
