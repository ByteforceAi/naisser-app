"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, School, ArrowLeft, X } from "lucide-react";
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

type RoleType = "instructor" | "teacher" | null;

export default function SelectRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoggedIn = status === "authenticated";
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);

  /** 역할 카드 클릭 */
  function handleRoleClick(role: "instructor" | "teacher") {
    const targetUrl =
      role === "instructor"
        ? "/onboarding?intent=instructor"
        : "/teacher/register?intent=teacher";

    if (isLoggedIn) {
      // 이미 로그인 → 바로 이동
      router.push(targetUrl);
    } else {
      // 로그인 안 됨 → provider 선택 모달 표시
      setSelectedRole(role);
    }
  }

  /** 소셜 로그인 시작 */
  function handleSocialLogin(provider: "kakao" | "google") {
    if (!selectedRole) return;
    const targetUrl =
      selectedRole === "instructor"
        ? "/onboarding?intent=instructor"
        : "/teacher/register?intent=teacher";
    signIn(provider, { callbackUrl: targetUrl });
  }

  const roleLabel = selectedRole === "instructor" ? "강사" : "교사";

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
            className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
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
              : "역할을 선택하면 로그인이 진행됩니다"}
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-3">
          {/* 강사 선택 */}
          <button
            onClick={() => handleRoleClick("instructor")}
            className={`glass-card flex items-center gap-4 p-5 w-full text-left group
                       transition-all duration-300
                       ${selectedRole === "instructor" ? "border-[var(--accent-primary)]/50 shadow-btn-primary" : "hover:border-[var(--accent-primary)]/30"}`}
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
            className={`glass-card flex items-center gap-4 p-5 w-full text-left group
                       transition-all duration-300
                       ${selectedRole === "teacher" ? "border-[var(--accent-success)]/50 shadow-glass-hover" : "hover:border-[var(--accent-success)]/30"}`}
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

      {/* ═══ 소셜 로그인 선택 바텀시트 ═══ */}
      <AnimatePresence>
        {selectedRole && !isLoggedIn && (
          <>
            {/* 백드롭 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelectedRole(null)}
            />

            {/* 바텀시트 */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)]
                         rounded-t-2xl px-6 pt-6 pb-8 max-w-lg mx-auto"
            >
              {/* 핸들바 */}
              <div className="w-10 h-1 rounded-full bg-[var(--bg-muted)] mx-auto mb-4" />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  {roleLabel}로 로그인
                </h2>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center
                             hover:bg-[var(--bg-muted)] transition-colors touch-target"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-[var(--text-secondary)] mb-6">
                소셜 계정으로 간편하게 시작하세요
              </p>

              <div className="space-y-3">
                {/* 카카오 로그인 */}
                <button
                  onClick={() => handleSocialLogin("kakao")}
                  className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl
                             text-base font-semibold bg-[#FEE500] text-[#191919]
                             hover:bg-[#FDD800] transition-colors touch-target"
                >
                  <KakaoIcon className="w-5 h-5" />
                  카카오로 시작하기
                </button>

                {/* 구글 로그인 */}
                <button
                  onClick={() => handleSocialLogin("google")}
                  className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl
                             text-base font-semibold border border-[var(--glass-border)]
                             bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)]
                             transition-colors touch-target"
                >
                  <GoogleIcon className="w-5 h-5" />
                  구글로 시작하기
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)] text-center mt-4">
                로그인 시{" "}
                <span className="underline">이용약관</span> 및{" "}
                <span className="underline">개인정보처리방침</span>에 동의합니다
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
