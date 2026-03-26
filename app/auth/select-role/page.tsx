"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, School, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SocialLoginSheet from "@/components/shared/SocialLoginSheet";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type RoleType = "instructor" | "teacher" | null;

/**
 * /auth/select-role
 * 이 페이지는 두 가지 경우에 도달:
 * 1. 소셜 로그인은 됐지만 role이 "new"인 사용자
 * 2. 직접 URL로 접근한 비로그인 사용자
 *
 * role이 이미 있는 사용자는 자동으로 해당 페이지로 리다이렉트
 */
export default function SelectRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);

  // ─── 이미 role이 있는 사용자 리다이렉트 ───
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const role = (session.user as { role?: string }).role;
    if (role === "instructor") router.replace("/instructor");
    else if (role === "teacher") router.replace("/teacher/home");
    // role === "new" → 여기 머무름
  }, [status, session, router]);

  const isLoggedIn = status === "authenticated";
  const isNewUser =
    isLoggedIn && (session?.user as { role?: string })?.role === "new";

  /** 역할 카드 클릭 */
  function handleRoleClick(role: "instructor" | "teacher") {
    const targetUrl =
      role === "instructor" ? "/onboarding" : "/teacher/register";

    if (isNewUser) {
      // 로그인 O + role없음 → 바로 이동
      router.push(targetUrl);
    } else if (isLoggedIn) {
      // 로그인 O + role있음 → 이미 위에서 리다이렉트됨
      return;
    } else {
      // 미로그인 → 바텀시트
      setSelectedRole(role);
    }
  }

  const callbackUrl =
    selectedRole === "instructor"
      ? "/onboarding?intent=instructor"
      : "/teacher/register?intent=teacher";

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
          <h1 className="text-2xl font-bold mb-2">어떤 역할로 시작할까요?</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {isNewUser
              ? `${session?.user?.name || "회원"}님, 역할을 선택해주세요`
              : "역할을 선택하면 로그인이 진행됩니다"}
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-3">
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

        <motion.div variants={fadeInUp} className="mt-6 text-center">
          <Link
            href="/teacher/home"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            먼저 둘러볼게요 →
          </Link>
        </motion.div>
      </motion.div>

      {/* 소셜 로그인 바텀시트 (비로그인 사용자만) */}
      <SocialLoginSheet
        isOpen={selectedRole !== null && !isLoggedIn}
        onClose={() => setSelectedRole(null)}
        callbackUrl={callbackUrl}
        roleLabel={selectedRole === "instructor" ? "강사" : "교사"}
      />
    </div>
  );
}
