"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  GraduationCap,
  School,
  MapPin,
  BookOpen,
  ChevronRight,
  Star,
  Users,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SocialLoginSheet from "@/components/shared/SocialLoginSheet";

// ─── 애니메이션 variants ───
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── CountUp 훅 ───
function useCountUp(end: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOut cubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return { count, ref };
}

// ─── 인기 강사 미리보기 카드 (더미) ───
const PREVIEW_INSTRUCTORS = [
  { name: "김예술", topics: ["환경&생태", "공예"], region: "수도권", rating: 4.8, reviews: 15 },
  { name: "이코딩", topics: ["AI디지털", "실습체험"], region: "대전충남", rating: 4.9, reviews: 23 },
  { name: "박체육", topics: ["체육&신체활동"], region: "부산경남", rating: 4.7, reviews: 8 },
];

type LoginIntent = "instructor" | "teacher" | null;

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loginIntent, setLoginIntent] = useState<LoginIntent>(null);

  const instructorCount = useCountUp(127);
  const teacherCount = useCountUp(89);
  const regionCount = useCountUp(9);
  const topicCount = useCountUp(15);

  // ─── 이미 로그인된 사용자 자동 리다이렉트 ───
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const role = (session.user as { role?: string }).role;
    if (role === "instructor") router.replace("/instructor");
    else if (role === "teacher") router.replace("/teacher/home");
    // role === "new" → 랜딩에 머무름 (역할 선택 필요)
  }, [status, session, router]);

  /** CTA 버튼 클릭 */
  function handleCTA(intent: "instructor" | "teacher") {
    if (status === "authenticated") {
      // 이미 로그인 → 바로 이동
      const url = intent === "instructor" ? "/onboarding" : "/teacher/register";
      router.push(url);
    } else {
      // 미로그인 → 바텀시트 열기
      setLoginIntent(intent);
    }
  }

  const callbackUrl =
    loginIntent === "instructor"
      ? "/onboarding?intent=instructor"
      : "/teacher/register?intent=teacher";

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* ═══ 히어로 섹션 ═══ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-12 pb-20">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent pointer-events-none" />

        <motion.div
          className="relative z-10 text-center max-w-lg mx-auto"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* 로고 */}
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="text-sm font-medium text-[var(--accent-primary)] tracking-wide uppercase">
              Education Matching Platform
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-[2.5rem] font-bold tracking-tight leading-tight mb-4"
          >
            학교와 강사를 연결하는
            <br />
            <span className="text-[var(--accent-primary)]">가장 쉬운 방법</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-[var(--text-secondary)] text-base sm:text-lg mb-8 leading-relaxed"
          >
            검증된 강사를 찾고, 수업을 요청하세요.
            <br />
            나이써가 연결해드립니다.
          </motion.p>

          {/* CTA 버튼 → 바텀시트에서 소셜 로그인 선택 */}
          <motion.div variants={fadeInUp} className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            <button
              onClick={() => handleCTA("instructor")}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6
                         bg-[var(--accent-primary)] text-white rounded-xl font-semibold text-base
                         shadow-btn-primary hover:shadow-btn-primary-hover
                         transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0
                         touch-target"
            >
              <GraduationCap className="w-5 h-5" />
              강사로 시작하기
            </button>
            <button
              onClick={() => handleCTA("teacher")}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-6
                         bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl font-semibold text-base
                         border border-[var(--glass-border)]
                         shadow-glass hover:shadow-glass-hover
                         transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0
                         touch-target"
            >
              <School className="w-5 h-5" />
              교사로 시작하기
            </button>
          </motion.div>

          {/* 둘러보기 */}
          <motion.div variants={fadeInUp} className="mt-4">
            <Link
              href="/teacher/home"
              className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                         transition-colors duration-200"
            >
              둘러보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 이런 분들을 위해 ═══ */}
      <section className="px-4 pb-16">
        <motion.div
          className="max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-xl font-bold text-center mb-6"
          >
            💡 이런 분들을 위해 만들었어요
          </motion.h2>

          <div className="grid grid-cols-2 gap-3">
            <motion.div variants={fadeInUp} className="glass-card p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <GraduationCap className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <h3 className="font-semibold text-sm mb-1">강사님</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                학교에 수업을 알리고 싶은 분
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="glass-card p-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                <School className="w-5 h-5 text-[var(--accent-success)]" />
              </div>
              <h3 className="font-semibold text-sm mb-1">교사님</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                좋은 강사를 쉽게 찾고 싶은 분
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ 등록 현황 (CountUp) ═══ */}
      <section className="px-4 pb-16 bg-[var(--bg-elevated)]/50 py-12">
        <motion.div
          className="max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeInUp} className="text-xl font-bold text-center mb-8">
            📊 현재 등록 현황
          </motion.h2>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { ...instructorCount, label: "강사", icon: Users },
              { ...teacherCount, label: "교사", icon: School },
              { ...regionCount, label: "지역", icon: MapPin },
              { ...topicCount, label: "주제", icon: BookOpen },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp} ref={stat.ref}>
                <div className="glass-card p-3">
                  <stat.icon className="w-5 h-5 mx-auto mb-1 text-[var(--accent-primary)]" />
                  <div className="text-xl font-bold text-[var(--accent-primary)]">
                    {stat.count}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ 인기 강사 미리보기 ═══ */}
      <section className="px-4 pb-16">
        <motion.div
          className="max-w-lg mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeInUp} className="text-xl font-bold mb-6">
            인기 강사 미리보기
          </motion.h2>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {PREVIEW_INSTRUCTORS.map((inst, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="glass-card p-4 min-w-[260px] snap-start shrink-0"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-lg">
                    {inst.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{inst.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <MapPin className="w-3 h-3" />
                      {inst.region}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {inst.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2.5 py-1 text-xs rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{inst.rating}</span>
                    <span className="text-[var(--text-muted)] text-xs">
                      ({inst.reviews}개 리뷰)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Eye className="w-3.5 h-3.5" />
                    연락처 비공개
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ 주의사항 + 푸터 ═══ */}
      <section className="px-4 pb-8">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="glass-card p-4 text-xs text-[var(--text-secondary)] leading-relaxed">
            <p className="font-semibold mb-1">📌 교사님 주의사항</p>
            <p>
              계약 체결 전 강사님과 꼭 통화하시고 수업에 대한 이야기를 나누시기
              바랍니다.
            </p>
          </div>
          <div className="glass-card p-4 text-xs text-[var(--text-secondary)] leading-relaxed">
            <p className="font-semibold mb-1">📌 강사님 주의사항</p>
            <p>
              본 어플에서 계약은 진행하지 않습니다. 계약은 직접 학교로 가셔서
              대면하게 진행하시기 바랍니다.
            </p>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-[var(--text-muted)]">
        <p>© 2026 나이써 NAISSER. All rights reserved.</p>
      </footer>

      {/* 소셜 로그인 바텀시트 */}
      <SocialLoginSheet
        isOpen={loginIntent !== null}
        onClose={() => setLoginIntent(null)}
        callbackUrl={callbackUrl}
        roleLabel={loginIntent === "instructor" ? "강사" : "교사"}
      />
    </main>
  );
}
