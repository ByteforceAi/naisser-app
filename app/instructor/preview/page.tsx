"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  FileCheck, History, Briefcase, CalendarDays, BarChart3,
  MessageCircle, ChevronRight, Shield, Star, ArrowLeft,
  Sparkles, CheckCircle2, TrendingUp, Clock, Award,
  Send, Heart, BookOpen, Zap, Play, Pause,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { SlotNumber } from "@/components/shared/SlotNumber";
import { InteractiveTutorial } from "@/components/instructor/InteractiveTutorial";

// ═══ 모션 프리셋 ═══
const ease = [0.22, 1, 0.36, 1] as const;
const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } },
};

// ═══ 피처 데이터 ═══
const FEATURES = [
  { icon: FileCheck, title: "서류함", desc: "범죄경력·통장·보험·자격증을 한 번 올리면 어디서든 제출", color: "#2563EB", gradient: "from-blue-500 to-blue-600", demo: "6종 서류 자동 관리" },
  { icon: History, title: "출강이력", desc: "수업할수록 자동으로 경력이 쌓이고 확인서가 발급됩니다", color: "#7C3AED", gradient: "from-violet-500 to-purple-600", demo: "월별 통계 + CSV" },
  { icon: Briefcase, title: "포트폴리오", desc: "수업 사진·영상을 올려 교사에게 어필하세요", color: "#059669", gradient: "from-emerald-500 to-green-600", demo: "이미지 + 영상 갤러리" },
  { icon: CalendarDays, title: "수업 캘린더", desc: "일정 충돌 감지, 한 달 수업 한눈에 관리", color: "#D97706", gradient: "from-amber-500 to-orange-600", demo: "충돌 알림 자동 감지" },
  { icon: BarChart3, title: "인사이트", desc: "프로필 조회수·문의·공유 통계로 홍보 전략을 세우세요", color: "#DC2626", gradient: "from-red-500 to-rose-600", demo: "조회·문의·공유 추적" },
  { icon: MessageCircle, title: "커뮤니티", desc: "단가 공유, 노하우, 구인·구직 — 강사끼리만의 라운지", color: "#0891B2", gradient: "from-cyan-500 to-teal-600", demo: "실시간 커뮤니티 피드" },
];

// ═══ 강사 여정 타임라인 ═══
const JOURNEY = [
  { step: 1, title: "30초 가입", desc: "카카오로 가입 → 이름·주제·지역 입력", icon: Zap, color: "#2563EB" },
  { step: 2, title: "프로필 완성", desc: "서류 업로드 + 포트폴리오 → 인증마크 획득", icon: Shield, color: "#7C3AED" },
  { step: 3, title: "교사 매칭", desc: "교사가 검색 → 수업 의뢰 → 수락", icon: Send, color: "#059669" },
  { step: 4, title: "수업 & 성장", desc: "출강이력 자동 기록 → 경력 증명 → 리뷰 축적", icon: TrendingUp, color: "#D97706" },
];

// ═══ 인터랙티브 대시보드 탭 ═══
const DASHBOARD_TABS = ["홈", "캘린더", "서류함"] as const;

export default function InstructorPreviewPage() {
  const [instructorCount, setInstructorCount] = useState(0);
  const [activeTab, setActiveTab] = useState<typeof DASHBOARD_TABS[number]>("홈");
  const [profileProgress, setProfileProgress] = useState(0);
  const [demoLessons, setDemoLessons] = useState(0);
  const [showFab, setShowFab] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [journeyStep, setJourneyStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  // 패럴랙스
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // FAB 표시
  const fabRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 데이터 fetch
  useEffect(() => {
    fetch("/api/landing/stats")
      .then((r) => r.json())
      .then((d) => d.data && setInstructorCount(d.data.instructors))
      .catch(() => {});
  }, []);

  // 대시보드 프로필 진행 애니메이션
  const dashRef = useRef<HTMLDivElement>(null);
  const dashInView = useInView(dashRef, { once: true, margin: "-100px" });
  useEffect(() => {
    if (!dashInView) return;
    const t1 = setTimeout(() => setProfileProgress(35), 500);
    const t2 = setTimeout(() => setProfileProgress(72), 1500);
    const t3 = setTimeout(() => setDemoLessons(24), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [dashInView]);

  // 여정 자동 재생
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setJourneyStep((p) => (p + 1) % JOURNEY.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      {/* ═══ 프리미엄 헤더 ═══ */}
      <header className="sticky top-0 z-50 px-5 py-3 flex items-center gap-3"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px) saturate(1.3)",
          WebkitBackdropFilter: "blur(20px) saturate(1.3)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <Link href="/" className="p-2 -ml-2 rounded-xl active:bg-black/5 transition-colors touch-target">
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <h1 className="text-[15px] font-bold text-[var(--text-primary)]">강사 둘러보기</h1>
        <div className="flex-1" />
        {instructorCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold
                       px-2.5 py-1 rounded-full bg-blue-50"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <SlotNumber value={instructorCount} className="text-[11px]" /> 명 활동 중
          </motion.div>
        )}
      </header>

      {/* ═══ 패럴랙스 히어로 ═══ */}
      <motion.section
        className="relative px-5 pt-12 pb-10 overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* 메시 그라디언트 배경 */}
        <div className="absolute inset-0 -z-10" style={{
          background: "radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.08), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.06), transparent 50%)",
        }} />

        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeIn} className="mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600
                             px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
              <Sparkles className="w-3 h-3" /> FOR INSTRUCTORS
            </span>
          </motion.div>
          <motion.h2 variants={fadeIn}
            className="text-[1.75rem] font-extrabold text-[var(--text-primary)] leading-[1.25] mb-4"
          >
            프리랜서 강사의<br />
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              모든 업무를 한곳에서
            </span>
          </motion.h2>
          <motion.p variants={fadeIn} className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
            서류 관리, 경력 증명, 수업 일정까지.<br />
            <strong className="text-[var(--text-primary)]">나이써</strong>가 강사님의 업무 파트너가 됩니다.
          </motion.p>
        </motion.div>
      </motion.section>

      {/* ═══ 튜토리얼 시작 배너 ═══ */}
      {!tutorialMode && !tutorialCompleted && (
        <section className="px-5 pb-6">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTutorialMode(true)}
            className="w-full p-4 rounded-2xl text-left flex items-center gap-3 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.08))",
              border: "1.5px solid rgba(37,99,235,0.12)",
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500
                            flex items-center justify-center shadow-lg shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[13px] text-[var(--text-primary)]">인터랙티브 튜토리얼</h3>
              <p className="text-[11px] text-[var(--text-secondary)]">5개 미션으로 나이써 기능을 체험해보세요</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
              시작 <ChevronRight className="w-3.5 h-3.5" />
            </div>
            {/* 쉬머 효과 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"
              style={{ animation: "skeletonShimmer 3s infinite" }} />
          </motion.button>
        </section>
      )}

      {/* ═══ 튜토리얼 모드 ═══ */}
      {tutorialMode && (
        <InteractiveTutorial
          onComplete={() => { setTutorialMode(false); setTutorialCompleted(true); }}
          onSkip={() => { setTutorialMode(false); setTutorialCompleted(true); }}
        />
      )}

      {/* ═══ 1. 인터랙티브 피처 카드 (탭 가능) ═══ */}
      <section className="px-5 pb-10">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          <motion.p variants={fadeIn} className="text-xs font-bold text-violet-500 tracking-widest uppercase mb-2">
            WHAT YOU GET
          </motion.p>
          <motion.h3 variants={fadeIn} className="text-lg font-bold text-[var(--text-primary)] mb-5">
            이 모든 것이 무료입니다
          </motion.h3>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <motion.button
                key={f.title}
                variants={scaleIn}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
                className="text-left p-4 rounded-2xl relative overflow-hidden transition-all duration-300"
                style={{
                  background: expandedFeature === i
                    ? `linear-gradient(135deg, ${f.color}08, ${f.color}15)`
                    : "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  border: expandedFeature === i
                    ? `1.5px solid ${f.color}30`
                    : "1px solid rgba(0,0,0,0.04)",
                  boxShadow: expandedFeature === i
                    ? `0 4px 20px ${f.color}15`
                    : "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div className="flex items-start gap-2.5 mb-2">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.gradient}
                                   flex items-center justify-center shrink-0`}>
                    <f.icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[13px] text-[var(--text-primary)]">{f.title}</h4>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedFeature === i ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-2">{f.desc}</p>
                      <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: f.color }}>
                        <CheckCircle2 className="w-3 h-3" />
                        {f.demo}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] text-[var(--text-muted)] line-clamp-1"
                    >
                      {f.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ 2. 인터랙티브 대시보드 데모 ═══ */}
      <section className="px-5 pb-12" ref={dashRef}>
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p variants={fadeIn} className="text-xs font-bold text-emerald-500 tracking-widest uppercase mb-2">
            LIVE DEMO
          </motion.p>
          <motion.h3 variants={fadeIn} className="text-lg font-bold text-[var(--text-primary)] mb-1">
            직접 눌러보세요
          </motion.h3>
          <motion.p variants={fadeIn} className="text-[12px] text-[var(--text-muted)] mb-5">
            실제 대시보드와 동일한 UI입니다
          </motion.p>

          <motion.div
            variants={scaleIn}
            className="rounded-[20px] overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              border: "1.5px solid rgba(37,99,235,0.08)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {/* 탭 바 */}
            <div className="flex border-b border-[rgba(0,0,0,0.04)] relative">
              {DASHBOARD_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-[12px] font-semibold relative transition-colors
                    ${activeTab === tab ? "text-blue-600" : "text-[var(--text-muted)]"}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="dashTab"
                      className="absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full bg-blue-500"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* 탭 콘텐츠 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease }}
              >
                {activeTab === "홈" && (
                  <div>
                    {/* 프로필 + 완성도 바 */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          강
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-[var(--text-primary)]">강사님</span>
                            <Shield className="w-3.5 h-3.5 text-blue-500" />
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[11px] font-bold text-[var(--text-primary)]">4.8</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${profileProgress}%` }}
                                transition={{ duration: 1, ease }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-blue-600">
                              <SlotNumber value={profileProgress} className="text-[10px]" duration={800} />%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 통계 */}
                    <div className="grid grid-cols-3 gap-px bg-gray-100/50">
                      {[
                        { label: "총 수업", value: demoLessons, suffix: "회", color: "#2563EB" },
                        { label: "이번 달", value: dashInView ? 5 : 0, suffix: "회", color: "#059669" },
                        { label: "수입", value: dashInView ? 180 : 0, suffix: "만", color: "#D97706" },
                      ].map((s) => (
                        <div key={s.label} className="bg-white p-3 text-center">
                          <div className="text-[16px] font-black" style={{ color: s.color }}>
                            <SlotNumber value={s.value} className="text-[16px]" duration={1200} />
                            <span className="text-[11px] ml-0.5">{s.suffix}</span>
                          </div>
                          <div className="text-[9px] text-[var(--text-muted)] mt-0.5 font-medium">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* 다가오는 수업 */}
                    <div className="p-4">
                      <div className="text-[11px] font-bold text-[var(--text-muted)] mb-2.5">다가오는 수업</div>
                      {[
                        { school: "서울초등학교", date: "4/10 (목)", topic: "환경교육", status: "확정" },
                        { school: "한강중학교", date: "4/12 (토)", topic: "진로체험", status: "대기" },
                      ].map((cls, i) => (
                        <motion.div
                          key={cls.school}
                          initial={{ opacity: 0, x: -10 }}
                          animate={dashInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ delay: 1.2 + i * 0.2, duration: 0.4, ease }}
                          className="flex items-center gap-2.5 py-2 text-xs"
                        >
                          <div className={`w-2 h-2 rounded-full ${cls.status === "확정" ? "bg-blue-500" : "bg-amber-400"}`} />
                          <span className="font-semibold text-[var(--text-primary)]">{cls.school}</span>
                          <span className="text-[var(--text-muted)]">{cls.date}</span>
                          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium
                            ${cls.status === "확정" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                            {cls.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "캘린더" && (
                  <div className="p-4">
                    <div className="text-center text-sm font-bold text-[var(--text-primary)] mb-3">2026년 4월</div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                      {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                        <div key={d} className="text-[var(--text-muted)] font-medium py-1">{d}</div>
                      ))}
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                        const hasClass = [3, 7, 10, 12, 15, 18, 22, 24].includes(day);
                        const isToday = day === 6;
                        return (
                          <motion.div
                            key={day}
                            whileTap={{ scale: 0.85 }}
                            className={`py-1.5 rounded-lg relative cursor-pointer transition-colors
                              ${isToday ? "bg-blue-500 text-white font-bold" : ""}
                              ${hasClass && !isToday ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                          >
                            {day}
                            {hasClass && (
                              <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full
                                ${isToday ? "bg-white" : "bg-blue-500"}`} />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-[11px] text-center text-[var(--text-muted)]">
                      <span className="font-bold text-blue-600">8</span>개 수업 · <span className="font-bold text-amber-600">0</span>개 충돌
                    </div>
                  </div>
                )}

                {activeTab === "서류함" && (
                  <div className="p-4 space-y-2.5">
                    {[
                      { name: "범죄경력조회서", status: "유효", exp: "2027.03", icon: "🔒" },
                      { name: "통장사본", status: "유효", exp: "영구", icon: "🏦" },
                      { name: "이력서", status: "유효", exp: "영구", icon: "📄" },
                      { name: "자격증", status: "미등록", exp: "-", icon: "📜" },
                      { name: "보험증서", status: "만료", exp: "2025.12", icon: "🛡️" },
                    ].map((doc) => (
                      <motion.div
                        key={doc.name}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl transition-colors active:bg-gray-50"
                      >
                        <span className="text-lg">{doc.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-[var(--text-primary)]">{doc.name}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">만료: {doc.exp}</div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold
                          ${doc.status === "유효" ? "bg-green-50 text-green-600"
                          : doc.status === "만료" ? "bg-red-50 text-red-500"
                          : "bg-gray-100 text-gray-400"}`}>
                          {doc.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 3. 강사 여정 타임라인 (인터랙티브) ═══ */}
      <section className="px-5 pb-12" style={{ background: "linear-gradient(180deg, transparent, rgba(37,99,235,0.03))" }}>
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeIn} className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold text-blue-500 tracking-widest uppercase mb-1">YOUR JOURNEY</p>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">강사 여정 시뮬레이션</h3>
            </div>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="p-2 rounded-xl bg-blue-50 text-blue-600 touch-target"
            >
              {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </motion.div>

          {/* 프로그레스 바 */}
          <motion.div variants={fadeIn} className="mb-6">
            <div className="flex gap-1.5 mb-3">
              {JOURNEY.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full flex-1"
                  animate={{
                    background: i <= journeyStep
                      ? `linear-gradient(90deg, ${JOURNEY[i].color}, ${JOURNEY[Math.min(i + 1, 3)].color})`
                      : "rgba(0,0,0,0.06)",
                  }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </div>
          </motion.div>

          {/* 현재 스텝 카드 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={journeyStep}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.4, ease }}
              className="p-5 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${JOURNEY[journeyStep].color}06, ${JOURNEY[journeyStep].color}12)`,
                border: `1.5px solid ${JOURNEY[journeyStep].color}15`,
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `${JOURNEY[journeyStep].color}15` }}>
                  {(() => {
                    const Icon = JOURNEY[journeyStep].icon;
                    return <Icon className="w-6 h-6" style={{ color: JOURNEY[journeyStep].color }} />;
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-md"
                      style={{ color: JOURNEY[journeyStep].color, background: `${JOURNEY[journeyStep].color}10` }}>
                      STEP {JOURNEY[journeyStep].step}
                    </span>
                    <h4 className="font-bold text-[15px] text-[var(--text-primary)]">{JOURNEY[journeyStep].title}</h4>
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{JOURNEY[journeyStep].desc}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 스텝 네비게이션 */}
          <div className="flex justify-center gap-2 mt-4">
            {JOURNEY.map((j, i) => (
              <button
                key={i}
                onClick={() => { setJourneyStep(i); setAutoPlay(false); }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold
                  transition-all duration-300 touch-target
                  ${i === journeyStep
                    ? "text-white shadow-lg scale-110"
                    : "text-[var(--text-muted)] bg-gray-100"}`}
                style={i === journeyStep ? { background: j.color, boxShadow: `0 4px 12px ${j.color}40` } : {}}
              >
                {j.step}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ 4. 커뮤니티 프리뷰 ═══ */}
      <section className="px-5 pb-12">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeIn}>
            <Link href="/community" className="block">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="p-5 rounded-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(8,145,178,0.06), rgba(5,150,105,0.06))",
                  border: "1px solid rgba(8,145,178,0.1)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[14px] text-[var(--text-primary)]">강사 라운지</h3>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {instructorCount > 0 ? `${instructorCount}명의 강사님이 활동 중` : "강사들의 커뮤니티"}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-cyan-600" />
                  </div>
                </div>

                {/* 미니 포스트 미리보기 */}
                <div className="space-y-2">
                  {[
                    { author: "김강사", text: "초등학교 단가 요즘 시세가 어떤가요?", likes: 24, tag: "단가" },
                    { author: "박코칭", text: "수업 끝나고 활동보고서 양식 공유합니다 📋", likes: 47, tag: "노하우" },
                  ].map((post) => (
                    <div key={post.text} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/60">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shrink-0 flex items-center justify-center text-[8px] font-bold text-gray-500">
                        {post.author.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-[var(--text-primary)]">{post.author}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-600 font-medium">{post.tag}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">{post.text}</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-[10px] text-[var(--text-muted)] shrink-0">
                        <Heart className="w-3 h-3" /> {post.likes}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 5. 하단 CTA ═══ */}
      <section className="px-5 pb-24">
        <motion.div
          className="text-center"
          initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeIn} className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold
                            px-3 py-1.5 rounded-full bg-emerald-50 mb-4">
              <Clock className="w-3 h-3" /> 가입 소요 시간: 30초
            </div>
            <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
              지금 시작하면<br />
              <strong className="text-[var(--text-primary)]">교사들의 수업 의뢰</strong>를 바로 받을 수 있어요
            </p>
          </motion.div>

          <motion.div variants={scaleIn}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => signIn("kakao")}
              className="w-full py-4 rounded-2xl text-white font-bold text-[15px]
                         flex items-center justify-center gap-2 touch-target relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #3B6CF6, #7C3AED)",
                boxShadow: "0 8px 32px rgba(59,108,246,0.35), 0 2px 8px rgba(59,108,246,0.2)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              강사로 시작하기
              {/* 쉬머 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ animation: "skeletonShimmer 2s infinite" }} />
            </motion.button>
          </motion.div>

          <motion.p variants={fadeIn} className="text-[11px] text-[var(--text-muted)] mt-3">
            카카오 또는 구글로 3초 만에 가입 · 별도 비용 없음
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ 플로팅 CTA (스크롤 시) ═══ */}
      <AnimatePresence>
        {showFab && (
          <motion.div
            ref={fabRef}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-5 right-5 z-50"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => signIn("kakao")}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-[14px]
                         flex items-center justify-center gap-2 touch-target"
              style={{
                background: "linear-gradient(135deg, #3B6CF6, #7C3AED)",
                boxShadow: "0 8px 32px rgba(59,108,246,0.4), 0 2px 4px rgba(0,0,0,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              강사로 시작하기
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
