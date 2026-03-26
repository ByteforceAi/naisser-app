"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, School, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * /auth/select-role
 *
 * 로그인 완료 후 무조건 여기로 옴 (redirect callback).
 * - role이 있으면 → 해당 홈으로 자동 이동
 * - role이 "new"면 → 강사/교사 선택 카드 표시
 * - 미로그인이면 → 랜딩으로 보냄
 */
export default function SelectRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // 미로그인 → 랜딩으로
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (!session?.user) return;
    const role = (session.user as { role?: string }).role;

    // 기존 사용자 → 역할별 홈으로 자동 이동
    if (role === "instructor") { router.replace("/instructor"); return; }
    if (role === "teacher") { router.replace("/teacher/home"); return; }

    // role === "new" → 여기 머무름 (카드 선택 UI)
  }, [status, session, router]);

  // 로딩 중이거나 리다이렉트 중이면 빈 화면
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const userName = session?.user?.name || "회원";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm"
      >
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
          <h1 className="text-2xl font-bold mb-2">
            {userName}님, 환영합니다! 🎉
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            어떤 역할로 나이써를 사용하실 건가요?
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-3">
          {/* 강사 선택 */}
          <button
            onClick={() => router.push("/onboarding")}
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
            onClick={() => router.push("/teacher/register")}
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
