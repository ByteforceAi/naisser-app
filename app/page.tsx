"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ChevronRight,
  Star,
  Users,
  School,
  X,
} from "lucide-react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SplashScreen } from "@/components/shared/SplashScreen";
import { getCategoryLabel } from "@/lib/constants/categories";

// ─── 인라인 아이콘 ───
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

// ─── AI 오브 (떠다니는 구체) ───
function AiOrb({ size = "lg" }: { size?: "sm" | "lg" }) {
  const isLg = size === "lg";
  const dim = isLg ? "w-20 h-20" : "w-10 h-10";
  const r = isLg ? "rounded-[20px]" : "rounded-[10px]";
  const innerR = isLg ? "rounded-[14px]" : "rounded-[7px]";
  return (
    <div className={`${dim} ${r} relative overflow-hidden`} style={{
      animation: "orbFloat 3s ease-in-out infinite",
      background: "rgba(255,255,255,0.6)",
      backdropFilter: "blur(14px) saturate(1.4)",
      WebkitBackdropFilter: "blur(14px) saturate(1.4)",
      boxShadow: isLg
        ? "0 12px 40px rgba(0,136,255,0.12), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.02)"
        : "0 4px 16px rgba(0,136,255,0.1), inset 0 1px 0 rgba(255,255,255,0.5)",
      border: "0.5px solid rgba(255,255,255,0.5)",
    }}>
      {/* 내부 Orb — 원형으로 클리핑 */}
      <div className={`absolute ${isLg ? "inset-3" : "inset-1.5"} rounded-full overflow-hidden`}>
        <div className="absolute inset-0" style={{
          background: "conic-gradient(from 0deg, #0088ff, #6155f5, #cb30e0, #0088ff)",
          animation: "orbSpin 5s linear infinite",
        }} />
        <div className={`absolute inset-[3px] rounded-full`} style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
        }} />
        <div className={`absolute inset-[6px] rounded-full opacity-50`} style={{
          background: "radial-gradient(circle at 35% 35%, rgba(0,136,255,0.5), rgba(97,85,245,0.3), transparent 70%)",
        }} />
      </div>
      {/* 상단 하이라이트 */}
      {isLg && (
        <div className="absolute inset-x-2 top-1.5 h-8 rounded-t-[16px] opacity-20 pointer-events-none" style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.9), transparent)",
        }} />
      )}
    </div>
  );
}

// ─── 단어 모프 텍스트 (A2 — 타이핑 대신 crossfade morph) ───
function MorphText({ texts, className }: { texts: string[]; className?: string }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % texts.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [texts]);

  return (
    <span className={`relative inline-block ${className || ""}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={texts[idx]}
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          className="inline-block"
        >
          {texts[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── 애니메이션 ───
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };

// ─── CountUp ───
function useCountUp(end: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // ease-in-out cubic for slot machine feel
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setCount(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration]);
  return { count, ref };
}

// ─── 더미 강사 ───
// PREVIEW 폴백 (API 실패 시)
const PREVIEW_FALLBACK = [
  { name: "강사", topics: ["진로&직업"], region: "수도권", rating: 0, reviews: 0 },
  { name: "강사", topics: ["AI디지털"], region: "대전충남", rating: 0, reviews: 0 },
  { name: "강사", topics: ["체육&신체활동"], region: "부산경남", rating: 0, reviews: 0 },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [loginLoading, setLoginLoading] = useState<"kakao" | "google" | null>(null);
  const [splashDone, setSplashDone] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);

  /** CTA 클릭 → squish + ripple → 바텀시트 */
  function handleCTAClick() {
    setRipple(true);
    setTimeout(() => {
      setShowLogin(true);
      setRipple(false);
    }, 400);
  }

  /** 소셜 로그인 클릭 → 로딩 → redirect */
  function handleLogin(provider: "kakao" | "google") {
    setLoginLoading(provider);
    setTimeout(() => signIn(provider), 600);
  }

  // ─── 실제 DB 통계 + 강사 미리보기 fetch ───
  const [stats, setStats] = useState({ instructors: 0, teachers: 0, regions: 0, topics: 0 });
  const [preview, setPreview] = useState(PREVIEW_FALLBACK);

  useEffect(() => {
    fetch("/api/landing/stats")
      .then((r) => r.json())
      .then((d) => d.data && setStats(d.data))
      .catch(() => {});
    fetch("/api/landing/instructors")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.length) {
          setPreview(
            d.data.map((inst: { name: string; topics: string[]; regions: string[]; rating: number; reviews: number }) => ({
              name: inst.name,
              topics: inst.topics.slice(0, 2).map((t: string) => getCategoryLabel(t, "subject")),
              region: getCategoryLabel(inst.regions[0] || "", "region"),
              rating: inst.rating,
              reviews: inst.reviews,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const c1 = useCountUp(stats.instructors);
  const c2 = useCountUp(stats.teachers);
  const c3 = useCountUp(stats.regions);
  const c4 = useCountUp(stats.topics);

  // ─── 로그인 상태 자동 리다이렉트 ───
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    const role = (session.user as { role?: string }).role;
    if (role === "instructor") router.replace("/instructor");
    else if (role === "teacher") router.replace("/teacher/home");
    else if (role === "new") router.replace("/auth/select-role");
  }, [status, session, router]);

  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--bg-primary)]">
      {/* ═══ 스플래시 스크린 (최초 부팅) ═══ */}
      {!splashDone && (
        <SplashScreen
          isReady={status !== "loading"}
          onComplete={handleSplashComplete}
        />
      )}
      {/* ═══ 키프레임 ═══ */}
      <style jsx global>{`
        @keyframes orbSpin { to { transform: rotate(360deg); } }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes meshMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gridFade {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        @keyframes pulseRipple {
          0% { width: 0; height: 0; opacity: 0.7; }
          100% { width: 600px; height: 600px; opacity: 0; }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          70% { opacity: 1; transform: translateY(-3px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes subtleFadeIn {
          0% { opacity: 0; transform: translateY(8px) scale(0.97); filter: blur(2px); }
          60% { opacity: 0.7; filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes shineSweep {
          0% { left: -100%; }
          100% { left: 150%; }
        }
        @keyframes spinLoader {
          to { transform: rotate(360deg); }
        }
        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rainbowShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes sparkleRotate {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(15deg) scale(1.15); }
        }
        /* Liquid Glass CTA 버튼 */
        .btn-liquid {
          position: relative;
          border: none;
          border-radius: 1000px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          background: transparent;
          z-index: 1;
          padding: 2px;
        }
        .btn-liquid::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1000px;
          padding: 1.5px;
          background: linear-gradient(135deg, rgba(0,136,255,0.4), rgba(97,85,245,0.3), rgba(203,48,224,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        .btn-liquid::after {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 1000px;
          background: linear-gradient(135deg, rgba(0,136,255,0.15), rgba(97,85,245,0.1), rgba(203,48,224,0.08));
          filter: blur(20px);
          z-index: -1;
          opacity: 0.6;
          transition: opacity 0.3s;
        }
        .btn-liquid:hover::after {
          opacity: 1;
        }
        .btn-liquid .btn-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(14px) saturate(1.4);
          -webkit-backdrop-filter: blur(14px) saturate(1.4);
          color: #0f172a;
          border-radius: 1000px;
          padding: 16px 36px;
          transition: all 0.3s ease;
          min-width: 200px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 16px rgba(0,0,0,0.06);
        }
        .btn-liquid:hover .btn-inner {
          background: rgba(255, 255, 255, 0.85);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 24px rgba(0,0,0,0.08);
        }
        .btn-liquid .sparkle {
          display: inline-block;
          font-size: 16px;
          color: var(--accent-primary);
          animation: sparkleRotate 2s ease-in-out infinite;
        }

        /* Legacy — 레인보우 글로우 버튼 (사용 안 함, 호환용) */
        .btn-rainbow {
          position: relative;
          border: none;
          border-radius: 14px;
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          background: transparent;
          z-index: 1;
          padding: 2px;
        }
        .btn-rainbow::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 14px;
          padding: 2px;
          background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd);
          background-size: 300% 300%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: rainbowShift 3s ease infinite;
          z-index: -1;
        }
        .btn-rainbow::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 18px;
          background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd);
          background-size: 300% 300%;
          animation: rainbowShift 3s ease infinite;
          filter: blur(16px);
          opacity: 0.35;
          z-index: -2;
          transition: all 0.3s ease;
        }
        .btn-rainbow:hover::after {
          opacity: 0.6;
          filter: blur(24px);
        }
        .btn-rainbow:hover .btn-inner {
          background: rgba(255, 255, 255, 0.88);
        }
        .btn-rainbow .btn-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.95);
          color: #1a1a2e;
          border-radius: 12px;
          padding: 14px 32px;
          transition: background 0.3s ease;
          min-width: 200px;
        }
        .btn-rainbow .sparkle {
          display: inline-block;
          font-size: 16px;
          color: #5f27cd;
          animation: sparkleRotate 2s ease-in-out infinite;
        }
      `}</style>

      {/* ═══ 히어로 ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* 메시 그라데이션 배경 */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.15), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.1), transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(5,150,105,0.08), transparent 50%)",
            animation: "meshMove 20s ease infinite",
            backgroundSize: "200% 200%",
          }}
        />
        {/* 도트 그리드 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            animation: "gridFade 4s ease-in-out infinite",
          }}
        />

        <motion.div
          className="relative z-10 text-center max-w-lg mx-auto"
          variants={stagger}
          initial="hidden"
          animate={splashDone ? "visible" : "hidden"}
        >
          {/* AI 오브 */}
          <motion.div variants={fadeInUp} className="flex justify-center mb-8">
            <AiOrb size="lg" />
          </motion.div>

          {/* 로고 */}
          <motion.div variants={fadeInUp} className="mb-3">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--accent-primary)] uppercase">
              NAISSER
            </span>
          </motion.div>

          {/* 메인 카피 — 글자 조립 효과 */}
          <motion.h1
            variants={fadeInUp}
            className="text-[2rem] sm:text-[2.75rem] font-bold tracking-tight leading-[1.2] mb-5"
          >
            <span className="inline-flex flex-wrap justify-center">
              {"학교와 강사를".split("").map((char, i) => (
                <motion.span
                  key={`hero-${i}`}
                  initial={{
                    opacity: 0,
                    x: (Math.random() - 0.5) * 120,
                    y: (Math.random() - 0.5) * 80,
                    rotate: (Math.random() - 0.5) * 30,
                    scale: 0.5,
                  }}
                  animate={splashDone ? {
                    opacity: 1, x: 0, y: 0, rotate: 0, scale: 1,
                  } : { opacity: 0 }}
                  transition={{
                    delay: i * 0.06,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="inline-block"
                  style={char === " " ? { width: "0.3em" } : {}}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </span>
            <br />
            <MorphText
              texts={["연결합니다", "매칭합니다", "이어줍니다"]}
              className="text-[var(--accent-primary)]"
            />
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-[var(--text-secondary)] text-base sm:text-lg mb-10 leading-relaxed max-w-sm mx-auto"
          >
            검증된 강사를 찾고, 수업을 요청하세요.
            <br />
            AI가 최적의 매칭을 도와드립니다.
          </motion.p>

          {/* ═══ 단일 CTA: 레인보우 글로우 + Pulse Ripple ═══ */}
          <motion.div variants={fadeInUp} className="flex flex-col items-center gap-5 relative">
            {/* Pulse Ripple (클릭 시) */}
            <AnimatePresence>
              {ripple && (
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-30"
                  initial={{ width: 0, height: 0, opacity: 0.7 }}
                  animate={{ width: 600, height: 600, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    background: "radial-gradient(circle, rgba(63,81,181,0.2) 0%, rgba(63,81,181,0.05) 60%, transparent 70%)",
                  }}
                />
              )}
            </AnimatePresence>

            <motion.button
              ref={ctaRef}
              onClick={handleCTAClick}
              className="btn-liquid touch-target"
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="btn-inner">
                <span className="sparkle">✦</span>
                시작하기
              </div>
            </motion.button>

            <div className="flex gap-4">
              <Link
                href="/teacher/preview"
                className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)]
                           hover:text-[var(--text-secondary)] transition-colors"
              >
                <School className="w-3.5 h-3.5" />
                교사 둘러보기
              </Link>
              <Link
                href="/instructor/preview"
                className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)]
                           hover:text-[var(--text-secondary)] transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                강사 둘러보기
              </Link>
            </div>
          </motion.div>

          <motion.p variants={fadeInUp} className="mt-10 text-[11px] text-[var(--text-muted)]">
            시작하기를 누르면 이용약관 및 개인정보처리방침에 동의합니다
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ 핵심 기능 3가지 ═══ */}
      <section className="px-4 py-24">
        <motion.div className="max-w-lg mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.p variants={fadeInUp} className="text-xs font-semibold text-blue-500 tracking-widest uppercase text-center mb-3">
            HOW IT WORKS
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-12 text-[var(--text-primary)]">
            3단계로 끝나는 매칭
          </motion.h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "프로필 등록", desc: "강사는 AI 챗봇과 대화하며 수업 정보를 입력합니다", icon: Users, color: "#2563EB", bg: "rgba(37,99,235,0.06)" },
              { step: "02", title: "AI 매칭", desc: "교사가 조건을 입력하면 AI가 최적의 강사 3명을 추천합니다", icon: Star, color: "#7C3AED", bg: "rgba(124,58,237,0.06)" },
              { step: "03", title: "수업 연결", desc: "의뢰를 보내고, 서류까지 한번에 관리합니다", icon: School, color: "#059669", bg: "rgba(5,150,105,0.06)" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="flex gap-4 p-5 rounded-xl transition-all"
                style={{ background: item.bg, border: `1px solid ${item.color}10` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${item.color}12` }}>
                  <span className="text-lg font-black" style={{ color: item.color }}>{item.step}</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">{item.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ 등록 현황 — 대형 카운트업 ═══ */}
      <section className="px-4 py-24" style={{ background: "linear-gradient(180deg, #F8F9FC 0%, #EEF1F8 100%)" }}>
        <motion.div className="max-w-lg mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeInUp} className="text-xs font-semibold text-blue-500 tracking-widest uppercase text-center mb-3">
            GROWING FAST
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-12 text-[var(--text-primary)]">
            이미 많은 분들이 함께합니다
          </motion.h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { ...c1, label: "등록 강사", suffix: "명", color: "#2563EB" },
              { ...c2, label: "등록 교사", suffix: "명", color: "#059669" },
              { ...c3, label: "활동 지역", suffix: "개", color: "#7C3AED" },
              { ...c4, label: "수업 주제", suffix: "개", color: "#D97706" },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeInUp} ref={s.ref}>
                <div className="p-5 rounded-xl text-center" style={{
                  background: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}>
                  <div className="text-3xl font-black text-[var(--text-primary)]">
                    {s.count}<span className="text-lg font-bold ml-0.5" style={{ color: s.color }}>{s.suffix}</span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-1.5 font-medium">{s.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ 강사 미리보기 ═══ */}
      <section className="px-4 py-24">
        <motion.div className="max-w-lg mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeInUp} className="text-xs font-semibold text-blue-500 tracking-widest uppercase text-center mb-3">
            DISCOVER
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-4 text-[var(--text-primary)]">
            이런 강사님이 기다리고 있어요
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-sm text-[var(--text-muted)] text-center mb-10">
            로그인하면 연락처와 상세 프로필을 볼 수 있습니다
          </motion.p>
          <div className="space-y-3">
            {preview.map((inst, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="p-4 rounded-xl flex items-center gap-4"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center text-lg font-bold text-blue-600 shrink-0">
                  {inst.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">{inst.name}</h3>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-[var(--text-secondary)]">{inst.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5">
                    <MapPin className="w-3 h-3" />{inst.region}
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {inst.topics.map((t) => (
                      <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{t}</span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeInUp} className="text-center mt-6">
            <Link href="/teacher/home" className="inline-flex items-center gap-1 text-sm text-blue-500 font-medium">
              전체 강사 보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 강사 업무관리 — 차별화 포인트 ═══ */}
      <section className="px-4 py-24" style={{ background: "linear-gradient(180deg, #F8F9FC 0%, #EEF1F8 100%)" }}>
        <motion.div className="max-w-lg mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.p variants={fadeInUp} className="text-xs font-semibold text-blue-500 tracking-widest uppercase text-center mb-3">
            FOR INSTRUCTORS
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-center mb-4 text-[var(--text-primary)]">
            강사님의 업무를 한곳에서
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-sm text-[var(--text-muted)] text-center mb-10">
            서류 관리부터 경력 증명까지, 프리랜서의 모든 것
          </motion.p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "서류함", desc: "한 번 올리면 어디서든", emoji: "🔒" },
              { title: "출강이력", desc: "자동으로 경력이 쌓임", emoji: "📊" },
              { title: "출강확인서", desc: "PDF 자동 생성", emoji: "📄" },
              { title: "포트폴리오", desc: "수업 사진·영상 관리", emoji: "🎨" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="p-4 rounded-xl text-center"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                <div className="text-2xl mb-2">{item.emoji}</div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">{item.title}</h3>
                <p className="text-[11px] text-[var(--text-muted)]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ 하단 CTA ═══ */}
      <section className="px-4 py-24">
        <motion.div
          className="max-w-lg mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="flex justify-center mb-6">
            <AiOrb size="sm" />
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-2xl font-bold mb-3 text-[var(--text-primary)]">
            지금 바로 시작하세요
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-sm text-[var(--text-secondary)] mb-8">
            3초 만에 가입하고, 최적의 매칭을 경험하세요.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <motion.button
              onClick={handleCTAClick}
              className="btn-liquid touch-target"
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="btn-inner">
                <span className="sparkle">✦</span>
                무료로 시작하기
              </div>
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 주의사항 ═══ */}
      <section className="px-4 pb-8">
        <div className="max-w-lg mx-auto space-y-3">
          {[
            { label: "교사님", text: "계약 체결 전 강사님과 꼭 통화하시고 수업에 대한 이야기를 나누시기 바랍니다." },
            { label: "강사님", text: "본 어플에서 계약은 진행하지 않습니다. 계약은 직접 학교로 가셔서 대면하게 진행하시기 바랍니다." },
          ].map((notice, i) => (
            <div key={i} className="p-4 rounded-xl text-xs text-[var(--text-secondary)] leading-relaxed"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <p className="font-semibold text-[var(--text-secondary)] mb-1">{notice.label} 주의사항</p>
              <p>{notice.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-10 text-center text-xs text-[var(--text-muted)]">
        <p>© 2026 NAISSER. All rights reserved.</p>
        <p className="mt-1">BYTEFORCE</p>
      </footer>

      {/* ═══ 로그인 바텀시트 — Full Interaction Spec ═══ */}
      <AnimatePresence>
        {showLogin && (
          <>
            {/* 배경 Blur + Dim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40"
              onClick={() => { setShowLogin(false); setLoginLoading(null); }}
              style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px) brightness(0.75)" }}
            />

            {/* 바텀시트 — iOS 26 Liquid Glass Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 1,
              }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto px-6 pt-5 pb-8"
              style={{
                borderRadius: "var(--liquid-radius-sheet) var(--liquid-radius-sheet) 0 0",
                background: "var(--liquid-bg)",
                backdropFilter: "blur(var(--liquid-frost)) saturate(1.4)",
                WebkitBackdropFilter: "blur(var(--liquid-frost)) saturate(1.4)",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
                border: "0.5px solid rgba(255,255,255,0.4)",
                borderBottom: "none",
              }}
            >
              {/* Grabber — iOS 26 규격 36×5pt */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.18, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const }}
                className="rounded-full mx-auto mb-5"
                style={{
                  width: "var(--liquid-grabber-w)",
                  height: "var(--liquid-grabber-h)",
                  background: "rgba(0,0,0,0.15)",
                }}
              />

              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.26, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const }}
                className="flex items-center justify-between mb-2"
              >
                <div className="flex items-center gap-2.5">
                  <AiOrb size="sm" />
                  <h2 className="text-lg font-bold">나이써 시작하기</h2>
                </div>
                <button
                  onClick={() => { setShowLogin(false); setLoginLoading(null); }}
                  className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center touch-target
                             hover:bg-[var(--bg-muted)] transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.34, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const }}
                className="text-sm text-[var(--text-secondary)] mb-6 ml-[52px]"
              >
                소셜 계정으로 3초 만에 시작하세요
              </motion.p>

              {/* 그룹 B: 로그인 버튼 — subtle fade-in, stagger 100ms */}
              <div className="space-y-3">
                {/* 카카오 버튼 */}
                <motion.button
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
                  onClick={() => handleLogin("kakao")}
                  disabled={loginLoading !== null}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.97, y: 1 }}
                  className="group relative flex items-center justify-center gap-3 w-full py-4 rounded-xl
                             text-[15px] font-bold bg-[#FEE500] text-[#191919]
                             hover:shadow-[0_4px_20px_rgba(254,229,0,0.35)]
                             transition-shadow duration-200 touch-target overflow-hidden
                             disabled:opacity-70"
                >
                  {/* Shine sweep on hover */}
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <div className="absolute top-0 h-full w-[60%] bg-gradient-to-r from-transparent via-white/30 to-transparent
                                    -left-full group-hover:animate-[shineSweep_600ms_ease-out]" />
                  </div>

                  {loginLoading === "kakao" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#191919]/30 border-t-[#191919] rounded-full animate-[spinLoader_700ms_linear_infinite]" />
                      <span className="opacity-70">로그인 중...</span>
                    </>
                  ) : (
                    <>
                      <KakaoIcon className="w-5 h-5" />
                      카카오로 시작하기
                    </>
                  )}
                </motion.button>

                {/* 구글 버튼 */}
                <motion.button
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
                  onClick={() => handleLogin("google")}
                  disabled={loginLoading !== null}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.97, y: 1 }}
                  className="group relative flex items-center justify-center gap-3 w-full py-3.5 rounded-xl
                             text-sm font-semibold border border-[var(--glass-border)]
                             bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)]
                             hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]
                             transition-all duration-200 touch-target overflow-hidden
                             disabled:opacity-70"
                >
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <div className="absolute top-0 h-full w-[60%] bg-gradient-to-r from-transparent via-black/5 to-transparent
                                    -left-full group-hover:animate-[shineSweep_600ms_ease-out]" />
                  </div>

                  {loginLoading === "google" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[var(--text-muted)]/30 border-t-[var(--text-primary)] rounded-full animate-[spinLoader_700ms_linear_infinite]" />
                      <span className="opacity-70">로그인 중...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4" />
                      구글 계정으로 시작하기
                    </>
                  )}
                </motion.button>
              </div>

              {/* 이용약관 */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.5, ease: "easeOut" }}
                className="text-[11px] text-[var(--text-muted)] text-center mt-5"
              >
                계속하면 이용약관 및 개인정보처리방침에 동의합니다
              </motion.p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
