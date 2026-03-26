"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  MapPin,
  BookOpen,
  ChevronRight,
  Star,
  Users,
  School,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── 카카오/구글 인라인 아이콘 ───
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

// ─── 애니메이션 ───
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

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
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration]);
  return { count, ref };
}

// ─── 더미 강사 ───
const PREVIEW_INSTRUCTORS = [
  { name: "김예술", topics: ["환경&생태", "공예"], region: "수도권", rating: 4.8, reviews: 15 },
  { name: "이코딩", topics: ["AI디지털", "실습체험"], region: "대전충남", rating: 4.9, reviews: 23 },
  { name: "박체육", topics: ["체육&신체활동"], region: "부산경남", rating: 4.7, reviews: 8 },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const instructorCount = useCountUp(127);
  const teacherCount = useCountUp(89);
  const regionCount = useCountUp(9);
  const topicCount = useCountUp(15);

  // ─── 이미 로그인된 사용자 → 바로 보내기 ───
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const role = (session.user as { role?: string }).role;
    if (role === "instructor") router.replace("/instructor");
    else if (role === "teacher") router.replace("/teacher/home");
    else if (role === "new") router.replace("/auth/select-role");
  }, [status, session, router]);

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* ═══ 히어로 ═══ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-12 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent pointer-events-none" />

        <motion.div
          className="relative z-10 text-center max-w-lg mx-auto"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
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
            className="text-[var(--text-secondary)] text-base sm:text-lg mb-10 leading-relaxed"
          >
            검증된 강사를 찾고, 수업을 요청하세요.
            <br />
            나이써가 연결해드립니다.
          </motion.p>

          {/* ═══ CTA: 카카오 큰 버튼 + 구글 작은 버튼 ═══ */}
          <motion.div variants={fadeInUp} className="flex flex-col gap-3 w-full max-w-xs mx-auto">
            <button
              onClick={() => signIn("kakao")}
              className="flex items-center justify-center gap-3 w-full py-4 px-6
                         bg-[#FEE500] text-[#191919] rounded-xl font-bold text-base
                         hover:bg-[#FDD800] transition-all duration-200 ease-out
                         hover:-translate-y-0.5 active:translate-y-0 touch-target
                         shadow-[0_2px_8px_rgba(254,229,0,0.4)]"
            >
              <KakaoIcon className="w-5 h-5" />
              카카오로 3초 만에 시작
            </button>

            <button
              onClick={() => signIn("google")}
              className="flex items-center justify-center gap-3 w-full py-3.5 px-6
                         bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl
                         font-semibold text-sm border border-[var(--glass-border)]
                         hover:bg-[var(--bg-elevated)] transition-all duration-200 ease-out
                         touch-target"
            >
              <GoogleIcon className="w-4 h-4" />
              구글 계정으로 시작
            </button>
          </motion.div>

          {/* 둘러보기 */}
          <motion.div variants={fadeInUp} className="mt-5 flex flex-col items-center gap-2">
            <Link
              href="/teacher/home"
              className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              둘러보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.p variants={fadeInUp} className="mt-8 text-xs text-[var(--text-muted)]">
            시작하기를 누르면{" "}
            <span className="underline">이용약관</span> 및{" "}
            <span className="underline">개인정보처리방침</span>에 동의합니다
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ 이런 분들을 위해 ═══ */}
      <section className="px-4 pb-16">
        <motion.div className="max-w-lg mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.h2 variants={fadeInUp} className="text-xl font-bold text-center mb-6">
            💡 이런 분들을 위해 만들었어요
          </motion.h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.div variants={fadeInUp} className="glass-card p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <h3 className="font-semibold text-sm mb-1">강사님</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">학교에 수업을 알리고 싶은 분</p>
            </motion.div>
            <motion.div variants={fadeInUp} className="glass-card p-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                <School className="w-5 h-5 text-[var(--accent-success)]" />
              </div>
              <h3 className="font-semibold text-sm mb-1">교사님</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">좋은 강사를 쉽게 찾고 싶은 분</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ 등록 현황 ═══ */}
      <section className="px-4 pb-16 bg-[var(--bg-elevated)]/50 py-12">
        <motion.div className="max-w-lg mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeInUp} className="text-xl font-bold text-center mb-8">📊 현재 등록 현황</motion.h2>
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
                  <div className="text-xl font-bold text-[var(--accent-primary)]">{stat.count}</div>
                  <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ 인기 강사 미리보기 ═══ */}
      <section className="px-4 pb-16">
        <motion.div className="max-w-lg mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeInUp} className="text-xl font-bold mb-6">인기 강사 미리보기</motion.h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {PREVIEW_INSTRUCTORS.map((inst, i) => (
              <motion.div key={i} variants={fadeInUp} className="glass-card p-4 min-w-[260px] snap-start shrink-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-lg">{inst.name.charAt(0)}</div>
                  <div>
                    <h3 className="font-semibold text-sm">{inst.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><MapPin className="w-3 h-3" />{inst.region}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {inst.topics.map((topic) => (<span key={topic} className="px-2.5 py-1 text-xs rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)]">{topic}</span>))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{inst.rating}</span>
                    <span className="text-[var(--text-muted)] text-xs">({inst.reviews}개 리뷰)</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><Eye className="w-3.5 h-3.5" />연락처 비공개</div>
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
            <p>계약 체결 전 강사님과 꼭 통화하시고 수업에 대한 이야기를 나누시기 바랍니다.</p>
          </div>
          <div className="glass-card p-4 text-xs text-[var(--text-secondary)] leading-relaxed">
            <p className="font-semibold mb-1">📌 강사님 주의사항</p>
            <p>본 어플에서 계약은 진행하지 않습니다. 계약은 직접 학교로 가셔서 대면하게 진행하시기 바랍니다.</p>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-[var(--text-muted)]">
        <p>© 2026 나이써 NAISSER. All rights reserved.</p>
      </footer>
    </main>
  );
}
