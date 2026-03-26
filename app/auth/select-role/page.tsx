"use client";

import { motion } from "framer-motion";
import { GraduationCap, School, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// 카카오 아이콘 (인라인 SVG)
function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.56-.95 3.6-.98 3.83 0 0-.02.17.09.24.1.06.23.01.23.01.31-.04 3.56-2.32 4.11-2.72.61.09 1.24.13 1.89.13 5.52 0 10-3.58 10-7.94S17.52 3 12 3z" />
    </svg>
  );
}

export default function SelectRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = status === "authenticated";

  /** 역할 선택 후 이동 — 로그인 안 됐으면 소셜 로그인 먼저 */
  function handleRoleClick(role: "instructor" | "teacher") {
    const targetUrl = role === "instructor" ? "/onboarding" : "/teacher/register";

    if (isLoggedIn) {
      router.push(targetUrl);
    } else {
      // 소셜 로그인 후 해당 경로로 리다이렉트
      signIn(undefined, { callbackUrl: targetUrl });
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm"
      >
        {/* 뒤로가기 */}
        <motion.div variants={fadeInUp} className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                       transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
        </motion.div>

        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h1 className="text-2xl font-bold mb-2">어떤 역할로 시작할까요?</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {isLoggedIn
              ? `${session?.user?.name || "회원"}님, 역할을 선택해주세요`
              : "소셜 로그인 후 역할이 설정됩니다"}
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-3">
          {/* 강사 선택 */}
          <button
            onClick={() => handleRoleClick("instructor")}
            className="glass-card flex items-center gap-4 p-5 w-full text-left group
                       hover:border-[var(--accent-primary)]/30 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center
                            group-hover:bg-blue-100 transition-colors shrink-0">
              <GraduationCap className="w-7 h-7 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-base">강사입니다</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                학교에 수업을 알리고 싶어요
              </p>
            </div>
          </button>

          {/* 교사 선택 */}
          <button
            onClick={() => handleRoleClick("teacher")}
            className="glass-card flex items-center gap-4 p-5 w-full text-left group
                       hover:border-[var(--accent-success)]/30 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center
                            group-hover:bg-green-100 transition-colors shrink-0">
              <School className="w-7 h-7 text-[var(--accent-success)]" />
            </div>
            <div>
              <h3 className="font-semibold text-base">교사입니다</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                좋은 강사를 찾고 싶어요
              </p>
            </div>
          </button>
        </motion.div>

        {/* 로그인 상태 안내 */}
        {!isLoggedIn && (
          <motion.div variants={fadeInUp} className="mt-6 text-center">
            <p className="text-xs text-[var(--text-muted)] mb-3">
              역할 선택 시 소셜 로그인이 진행됩니다
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => signIn("kakao", { callbackUrl: "/auth/select-role" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           bg-[#FEE500] text-[#191919] hover:bg-[#FDD800]
                           transition-colors touch-target"
              >
                <KakaoIcon className="w-4 h-4" />
                카카오 로그인
              </button>
              <button
                onClick={() => signIn("google", { callbackUrl: "/auth/select-role" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           border border-[var(--glass-border)] bg-[var(--bg-surface)]
                           hover:bg-[var(--bg-elevated)] transition-colors touch-target"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                구글 로그인
              </button>
            </div>
          </motion.div>
        )}

        {/* 둘러보기 */}
        <motion.div variants={fadeInUp} className="mt-6 text-center">
          <Link
            href="/teacher/home"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            먼저 둘러볼게요 →
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
