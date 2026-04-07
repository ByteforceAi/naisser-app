"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Home, MessageSquare, Search, Bell, User,
  Edit, Eye, Calendar as CalendarIcon, Clock, DollarSign,
  Inbox, CalendarDays, TrendingUp, FolderLock,
  Briefcase, ImageIcon, Star, School, Settings,
  ChevronRight, Shield, FileCheck2, AlertTriangle,
  Sparkles, ArrowLeft, Check, X, Phone, Mail,
  Heart, MessageCircle, Send, Receipt, HelpCircle,
  Moon, LogOut, FileText, ShieldCheck,
  Mic, GraduationCap, Sun, Compass, BookOpen, Users,
  Play, Zap, Award,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { SlotNumber } from "@/components/shared/SlotNumber";

// ═══ 모션 ═══
const ease = [0.22, 1, 0.36, 1] as const;
const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.04 } } };

// ═══ 시뮬레이션 화면 타입 ═══
type Screen = "splash" | "onboarding" | "dashboard" | "requests" | "community" | "notifications" | "settings";

// ═══ 데모 데이터 ═══
const DEMO_PROFILE = {
  name: "강사님",
  topics: ["진로&직업", "AI디지털"],
  regions: ["수도권"],
  rating: 4.8,
  reviewCount: 12,
  completeness: 72,
  totalLessons: 24,
  monthlyLessons: 5,
  monthlyIncome: 180,
};

const DEMO_CLASSES = [
  { school: "서울초등학교", date: "4/10 (목)", topic: "환경교육", status: "확정" },
  { school: "한강중학교", date: "4/12 (토)", topic: "진로체험", status: "대기" },
];

const DEMO_REQUEST = {
  teacherName: "김선생",
  school: "서울대학초등학교",
  date: "2026-04-15",
  type: "외부특강",
  category: "진로&직업",
  grade: "초5~6",
  students: 30,
  budget: "200,000원",
  message: "학생들의 직업 탐색을 위한 진로 특강을 부탁드립니다.",
};

const DEMO_POSTS = [
  { author: "김코치", badge: "인증", tag: "단가", text: "초등학교 외부특강 단가 요즘 시세가 어떤가요? 30명 기준으로...", likes: 24, comments: 8 },
  { author: "박체육", badge: "얼리", tag: "노하우", text: "수업 끝나고 활동보고서 양식 공유합니다 📋 신규 강사님들 참고하세요", likes: 47, comments: 15 },
  { author: "이예술", badge: "", tag: "정보", text: "다음 달 ○○시 교육청 수요조사 공고 올라왔어요! 마감 4/20", likes: 31, comments: 5 },
];

const DEMO_NOTIFICATIONS = [
  { icon: "📩", title: "새 의뢰가 도착했어요", desc: "김선생님이 진로체험 수업을 의뢰했습니다", time: "방금", unread: true },
  { icon: "⭐", title: "새 리뷰가 등록됐어요", desc: "4.5점 리뷰가 달렸습니다", time: "2시간 전", unread: true },
  { icon: "📄", title: "서류 만료 알림", desc: "범죄경력조회서가 30일 후 만료됩니다", time: "어제", unread: false },
];

const DOCS = [
  { name: "범죄경력조회서", status: "유효", exp: "2027.03", icon: "🔒" },
  { name: "통장사본", status: "유효", exp: "영구", icon: "🏦" },
  { name: "이력서", status: "유효", exp: "영구", icon: "📄" },
  { name: "자격증", status: "미등록", exp: "-", icon: "📜" },
  { name: "보험증서", status: "만료", exp: "2025.12", icon: "🛡️" },
];

// ═══ 메인 컴포넌트 ═══
export default function InstructorSimulation() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [showRequestAlert, setShowRequestAlert] = useState(false);
  const [requestAccepted, setRequestAccepted] = useState<boolean | null>(null);
  const [completeness, setCompleteness] = useState(0);
  const [lessons, setLessons] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [profileName, setProfileName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // 스플래시 → 온보딩
  useEffect(() => {
    if (screen === "splash") {
      const t = setTimeout(() => setScreen("onboarding"), 2000);
      return () => clearTimeout(t);
    }
  }, [screen]);

  // 대시보드 진입 시 프로필 완성도 애니메이션 + 의뢰 알림
  useEffect(() => {
    if (screen === "dashboard") {
      const t1 = setTimeout(() => setCompleteness(35), 500);
      const t2 = setTimeout(() => setCompleteness(72), 1500);
      const t3 = setTimeout(() => setLessons(24), 800);
      const t4 = setTimeout(() => setShowRequestAlert(true), 4000);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [screen]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ═══ 시뮬레이션 프레임 ═══ */}
      <header className="sticky top-0 z-[60] px-5 py-3 flex items-center gap-3"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px) saturate(1.3)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <Link href="/" className="p-2 -ml-2 rounded-xl active:bg-black/5 transition-colors touch-target">
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <h1 className="text-[15px] font-bold text-[var(--text-primary)]">강사 체험 시뮬레이션</h1>
        <div className="flex-1" />
        <span className="text-[11px] font-semibold text-blue-600 px-2 py-1 rounded-full bg-blue-50">
          DEMO
        </span>
      </header>

      {/* ═══ 시뮬레이터 컨테이너 ═══ */}
      <div ref={containerRef} className="relative">
        <AnimatePresence mode="wait">
          {/* ─── 스플래시 ─── */}
          {screen === "splash" && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center px-5 py-20"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-20 h-20 rounded-[20px] mb-6 flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 12px 40px rgba(0,136,255,0.12)",
                  border: "0.5px solid rgba(255,255,255,0.5)",
                }}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0" style={{
                    background: "conic-gradient(from 0deg, #0088ff, #6155f5, #cb30e0, #0088ff)",
                    animation: "orbSpin 5s linear infinite",
                  }} />
                  <div className="absolute inset-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <p className="text-[20px] font-bold tracking-[0.15em] text-blue-500 mb-2">NAISSER</p>
                <p className="text-[12px] text-[var(--text-muted)]">강사 체험을 시작합니다...</p>
              </motion.div>
            </motion.div>
          )}

          {/* ─── 온보딩 (30초 가입 시뮬레이션) ─── */}
          {screen === "onboarding" && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease }}
              className="px-5 py-8"
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-[22px] font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
                  강사 프로필 만들기
                </h2>
                <p className="text-[14px] text-[var(--text-secondary)]">
                  3가지만 입력하면 바로 시작할 수 있어요
                </p>
              </div>

              <div className="space-y-5">
                {/* 이름 */}
                <div>
                  <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-2">이름 *</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="강사명 (실명 또는 활동명)"
                    maxLength={20}
                    className="w-full px-4 py-3 rounded-xl text-[15px] bg-[#f8f9fb] border border-gray-200
                               focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                {/* 주제 (미리 선택됨) */}
                <div>
                  <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-2">수업 주제 * (선택됨)</label>
                  <div className="flex flex-wrap gap-2">
                    {["진로&직업", "AI디지털"].map((t) => (
                      <div key={t} className="px-3 py-2 rounded-xl text-[13px] font-medium bg-blue-500 text-white flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {t}
                      </div>
                    ))}
                    {["환경&생태", "체육", "음악"].map((t) => (
                      <div key={t} className="px-3 py-2 rounded-xl text-[13px] font-medium bg-white text-[var(--text-secondary)] border border-gray-200">
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 지역 */}
                <div>
                  <label className="text-[13px] font-semibold text-[var(--text-primary)] block mb-2">활동 지역 * (선택됨)</label>
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-2 rounded-xl text-[13px] font-medium bg-blue-500 text-white flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> 수도권
                    </div>
                    {["대전충남", "부산경남", "대구경북"].map((r) => (
                      <div key={r} className="px-3 py-2 rounded-xl text-[13px] font-medium bg-white text-[var(--text-secondary)] border border-gray-200">
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setScreen("dashboard")}
                className="w-full mt-8 py-4 rounded-2xl text-white font-bold text-[15px]
                           flex items-center justify-center gap-2 touch-target"
                style={{
                  background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                  boxShadow: "0 4px 16px rgba(59,108,246,0.3)",
                }}
              >
                시작하기
              </motion.button>
              <p className="text-[11px] text-[var(--text-muted)] text-center mt-3">
                나머지 정보는 나중에 입력할 수 있어요
              </p>
            </motion.div>
          )}

          {/* ─── 대시보드 ─── */}
          {screen === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease }}
              className="px-5 pt-4 pb-24"
              style={{
                background: "radial-gradient(ellipse at 20% 50%, rgba(0,136,255,0.06), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(97,85,245,0.04), transparent 50%)",
              }}
            >
              {/* 프로필 카드 */}
              <motion.div
                initial="hidden" animate="visible" variants={stagger}
                className="p-5 rounded-2xl mb-5"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,0,0,0.04)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* 상단 악센트 라인 */}
                <div className="h-[2px] rounded-full mb-4 -mt-1" style={{
                  background: "linear-gradient(90deg, #0088ff, #6155f5, #0088ff)",
                  backgroundSize: "200% 100%",
                  animation: "meshFloat 4s ease infinite",
                }} />

                <div className="flex items-center gap-3">
                  {/* 프로필 이미지 (아바타 자리 — 나중에 사진 추가) */}
                  <div className="w-16 h-16 rounded-[18px] flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(14px) saturate(1.5)",
                      boxShadow: "0 4px 16px rgba(0,136,255,0.1)",
                      border: "0.5px solid rgba(255,255,255,0.6)",
                    }}
                  >
                    <User className="w-7 h-7 text-blue-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-bold text-[16px] text-[var(--text-primary)]">
                        {profileName || DEMO_PROFILE.name}
                      </span>
                      <Shield className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {DEMO_PROFILE.topics.map((t) => (
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-[var(--text-muted)]">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-[var(--text-primary)]">{DEMO_PROFILE.rating}</span>/5.0
                      <span>({DEMO_PROFILE.reviewCount}개 리뷰)</span>
                    </div>
                  </div>
                </div>

                {/* 프로필 완성도 바 */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #0088ff, #6155f5)" }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${completeness}%` }}
                      transition={{ duration: 1, ease }}
                    />
                  </div>
                  <span className="text-[12px] font-bold text-blue-600">
                    <SlotNumber value={completeness} className="text-[12px]" duration={800} />%
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  경력과 서류를 추가하면 인증마크를 받을 수 있어요 →
                </p>

                {/* 버튼 */}
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-1.5"
                    style={{ background: "linear-gradient(135deg, #0088ff, #6155f5)" }}>
                    <Edit className="w-3.5 h-3.5" /> 프로필 수정
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-[var(--text-secondary)] border border-gray-200 flex items-center justify-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> 미리보기
                  </button>
                </div>
              </motion.div>

              {/* 이번 달 활동 */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: "출강", value: lessons, suffix: "회", icon: CalendarIcon, color: "#059669", bg: "rgba(16,185,129,0.08)" },
                  { label: "누적 시간", value: lessons > 0 ? 48 : 0, suffix: "h", icon: Clock, color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
                  { label: "수입", value: lessons > 0 ? 180 : 0, suffix: "만", icon: DollarSign, color: "#D97706", bg: "rgba(217,119,6,0.08)" },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-2xl text-center"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.04)" }}>
                    <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: s.bg }}>
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    <div className="text-[16px] font-black" style={{ color: s.color }}>
                      <SlotNumber value={s.value} className="text-[16px]" duration={1000} />
                      <span className="text-[11px] ml-0.5">{s.suffix}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* 다가오는 수업 */}
              <div className="p-4 rounded-2xl mb-5" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.04)" }}>
                <div className="text-[13px] font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-blue-500" /> 다가오는 수업
                </div>
                <div className="space-y-2.5">
                  {DEMO_CLASSES.map((cls) => (
                    <div key={cls.school} className="flex items-center gap-2.5 text-[13px]">
                      <div className={`w-2 h-2 rounded-full ${cls.status === "확정" ? "bg-blue-500" : "bg-amber-400"}`} />
                      <span className="font-semibold text-[var(--text-primary)]">{cls.school}</span>
                      <span className="text-[var(--text-muted)]">{cls.date}</span>
                      <span className={`ml-auto text-[11px] px-2 py-0.5 rounded-full font-medium
                        ${cls.status === "확정" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                        {cls.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 퀵 액션 */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {[
                  { label: "의뢰함", icon: Inbox, color: "#0088ff", go: "requests" as Screen },
                  { label: "캘린더", icon: CalendarDays, color: "#059669", go: "dashboard" as Screen },
                  { label: "인사이트", icon: TrendingUp, color: "#7C3AED", go: "dashboard" as Screen },
                  { label: "서류함", icon: FolderLock, color: "#D97706", go: "dashboard" as Screen },
                ].map((a) => (
                  <motion.button
                    key={a.label}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setScreen(a.go)}
                    className="p-3 rounded-2xl text-center"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <div className="w-10 h-10 rounded-xl mx-auto mb-1.5 flex items-center justify-center"
                      style={{ background: `${a.color}10` }}>
                      <a.icon className="w-5 h-5" style={{ color: a.color }} />
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--text-primary)]">{a.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* 메뉴 리스트 */}
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.04)" }}>
                {[
                  { label: "프로필 수정", icon: Edit },
                  { label: "받은 문의", icon: Inbox },
                  { label: "수입/지출", icon: Receipt },
                  { label: "출강이력", icon: Briefcase },
                  { label: "포트폴리오", icon: ImageIcon },
                  { label: "내 리뷰", icon: Star },
                  { label: "알림", icon: Bell, badge: 3 },
                  { label: "설정", icon: Settings, go: "settings" as Screen },
                ].map((item, i, arr) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => item.go && setScreen(item.go)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #f5f5f5" : "none" }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,136,255,0.08)" }}>
                      <item.icon className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="flex-1 text-[14px] font-medium text-[var(--text-primary)]">{item.label}</span>
                    {item.badge && (
                      <span className="min-w-[20px] h-[20px] rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center px-1">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── 의뢰함 ─── */}
          {screen === "requests" && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease }}
              className="px-5 pt-4 pb-24"
            >
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => setScreen("dashboard")} className="p-1.5 rounded-lg active:bg-gray-100">
                  <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
                <h2 className="text-[17px] font-bold text-[var(--text-primary)]">의뢰함</h2>
              </div>

              {/* 탭 */}
              <div className="flex gap-1 p-1 rounded-xl bg-gray-100/60 mb-5">
                {["⏳ 대기중", "✅ 수락", "❌ 거절"].map((tab, i) => (
                  <button key={tab} className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all
                    ${i === 0 ? "bg-white text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)]"}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* 의뢰 카드 */}
              {requestAccepted === null ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(124,58,237,0.04))",
                    border: "1.5px solid rgba(37,99,235,0.1)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {DEMO_REQUEST.teacherName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-[14px] text-[var(--text-primary)]">{DEMO_REQUEST.teacherName}</div>
                      <div className="text-[12px] text-[var(--text-muted)]">{DEMO_REQUEST.school}</div>
                    </div>
                    <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">대기중</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {[
                      { label: "유형", value: DEMO_REQUEST.type },
                      { label: "분야", value: DEMO_REQUEST.category },
                      { label: "날짜", value: DEMO_REQUEST.date },
                      { label: "대상", value: `${DEMO_REQUEST.grade} (${DEMO_REQUEST.students}명)` },
                      { label: "예산", value: DEMO_REQUEST.budget },
                    ].map((d) => (
                      <div key={d.label} className="flex text-[13px]">
                        <span className="w-14 text-[var(--text-muted)] shrink-0">{d.label}</span>
                        <span className="text-[var(--text-primary)] font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[13px] text-[var(--text-secondary)] p-3 rounded-xl bg-white/60 mb-4 leading-relaxed">
                    &ldquo;{DEMO_REQUEST.message}&rdquo;
                  </p>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRequestAccepted(false)}
                      className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-[var(--text-secondary)] border border-gray-200 flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> 거절
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRequestAccepted(true)}
                      className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #059669, #34D399)", boxShadow: "0 4px 12px rgba(5,150,105,0.3)" }}
                    >
                      <Check className="w-4 h-4" /> 수락
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: requestAccepted ? "rgba(5,150,105,0.1)" : "rgba(239,68,68,0.1)" }}>
                    {requestAccepted ? <Check className="w-8 h-8 text-green-500" /> : <X className="w-8 h-8 text-red-500" />}
                  </div>
                  <h3 className="text-[17px] font-bold text-[var(--text-primary)] mb-2">
                    {requestAccepted ? "의뢰를 수락했습니다!" : "의뢰를 거절했습니다"}
                  </h3>
                  <p className="text-[13px] text-[var(--text-secondary)] mb-6">
                    {requestAccepted
                      ? "김선생님에게 수락 알림이 전송됩니다"
                      : "교사님에게 거절 알림이 전송됩니다"}
                  </p>
                  <button
                    onClick={() => { setScreen("dashboard"); setRequestAccepted(null); }}
                    className="text-[14px] font-semibold text-blue-500"
                  >
                    대시보드로 돌아가기
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── 커뮤니티 ─── */}
          {screen === "community" && (
            <motion.div
              key="community"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease }}
              className="pb-24"
            >
              {/* 탭 */}
              <div className="flex px-4 py-2 gap-1 border-b border-gray-100">
                {["HOT", "단가", "노하우", "정보", "수다"].map((tab, i) => (
                  <button key={tab} className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all
                    ${i === 0 ? "text-blue-600 bg-blue-50" : "text-[var(--text-muted)]"}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* 피드 */}
              <div className="px-5 pt-4 space-y-3">
                {DEMO_POSTS.map((post, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3, ease }}
                    className="p-4 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[11px] font-bold text-gray-500">
                        {post.author.charAt(0)}
                      </div>
                      <span className="font-bold text-[13px] text-[var(--text-primary)]">{post.author}</span>
                      {post.badge && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                          {post.badge === "인증" ? "🛡️ 인증" : "🐣 얼리"}
                        </span>
                      )}
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-600 font-medium ml-auto">
                        {post.tag}
                      </span>
                    </div>
                    <p className="text-[14px] text-[var(--text-primary)] leading-relaxed mb-3">{post.text}</p>
                    <div className="flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── 알림 ─── */}
          {screen === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease }}
              className="px-5 pt-4 pb-24"
            >
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => setScreen("dashboard")} className="p-1.5 rounded-lg active:bg-gray-100">
                  <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
                <h2 className="text-[17px] font-bold text-[var(--text-primary)]">알림</h2>
              </div>

              <div className="space-y-2">
                {DEMO_NOTIFICATIONS.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-2xl flex items-start gap-3 ${n.unread ? "" : "opacity-60"}`}
                    style={{
                      background: n.unread ? "rgba(37,99,235,0.04)" : "rgba(255,255,255,0.7)",
                      border: n.unread ? "1px solid rgba(37,99,235,0.08)" : "1px solid rgba(0,0,0,0.04)",
                    }}
                  >
                    <span className="text-xl">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13px] text-[var(--text-primary)]">{n.title}</div>
                      <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">{n.desc}</div>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] shrink-0">{n.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── 설정 ─── */}
          {screen === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease }}
              className="px-5 pt-4 pb-24"
              style={{ background: "#F2F2F7" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => setScreen("dashboard")} className="p-1.5 rounded-lg active:bg-gray-100">
                  <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
                <h2 className="text-[17px] font-bold text-[var(--text-primary)]">설정</h2>
              </div>

              {/* 설정 그룹 1 */}
              <div className="rounded-xl overflow-hidden bg-white mb-6">
                {[
                  { label: "알림 설정", desc: "푸시 알림, 이메일 알림", icon: Bell, color: "#FF3B30" },
                  { label: "화면 테마", desc: "라이트 / 다크 / 자동", icon: Moon, color: "#007AFF" },
                ].map((item, i, arr) => (
                  <div key={item.label} className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < arr.length - 1 ? "0.5px solid #e5e5ea" : "none" }}>
                    <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center" style={{ background: item.color }}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-medium text-[var(--text-primary)]">{item.label}</div>
                      <div className="text-[12px] text-[var(--text-muted)]">{item.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                ))}
              </div>

              {/* 설정 그룹 2 */}
              <div className="rounded-xl overflow-hidden bg-white mb-6">
                {[
                  { label: "개인정보 보호", icon: ShieldCheck, color: "#007AFF" },
                  { label: "이용약관", icon: FileText, color: "#8E8E93" },
                  { label: "도움말", icon: HelpCircle, color: "#34C759" },
                ].map((item, i, arr) => (
                  <div key={item.label} className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < arr.length - 1 ? "0.5px solid #e5e5ea" : "none" }}>
                    <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center" style={{ background: item.color }}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="flex-1 text-[15px] font-medium text-[var(--text-primary)]">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                ))}
              </div>

              {/* 로그아웃 */}
              <div className="rounded-xl overflow-hidden bg-white">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center bg-red-500">
                    <LogOut className="w-4 h-4 text-white" />
                  </div>
                  <span className="flex-1 text-[15px] font-medium text-red-500">로그아웃</span>
                </div>
              </div>

              <p className="text-[13px] text-[var(--text-muted)] text-center mt-6">NAISSER v1.0.0</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ 의뢰 도착 알림 팝업 ═══ */}
        <AnimatePresence>
          {showRequestAlert && screen === "dashboard" && requestAccepted === null && (
            <motion.div
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed top-20 left-4 right-4 z-[70] p-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(20px) saturate(1.3)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowRequestAlert(false); setScreen("requests"); }}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px] text-[var(--text-primary)]">📩 새 수업 의뢰가 도착했어요!</div>
                  <div className="text-[12px] text-[var(--text-secondary)]">김선생님이 진로체험 수업을 의뢰했습니다</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ 바텀 네비게이션 ═══ */}
        {screen !== "splash" && screen !== "onboarding" && (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-2"
            style={{
              background: "rgba(250,250,252,0.75)",
              backdropFilter: "blur(20px) saturate(1.4)",
              borderTop: "0.5px solid rgba(0,0,0,0.06)",
              paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
            }}
          >
            {[
              { icon: Home, label: "홈", go: "dashboard" as Screen },
              { icon: MessageSquare, label: "커뮤니티", go: "community" as Screen },
              { icon: Search, label: "검색", go: "dashboard" as Screen },
              { icon: Bell, label: "알림", go: "notifications" as Screen, badge: 2 },
              { icon: User, label: "프로필", go: "dashboard" as Screen },
            ].map((tab) => {
              const isActive = screen === tab.go || (tab.go === "dashboard" && screen === "dashboard");
              return (
                <motion.button
                  key={tab.label}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setScreen(tab.go)}
                  className="relative flex flex-col items-center py-1 px-3"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -top-1 w-12 h-8 rounded-full"
                      style={{
                        background: "rgba(0,136,255,0.08)",
                        backdropFilter: "blur(8px)",
                        border: "0.5px solid rgba(0,136,255,0.12)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <tab.icon
                    className="w-6 h-6 relative z-10"
                    style={{ color: isActive ? "#0088ff" : "#b0b8c8" }}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                  {tab.badge && (
                    <span className="absolute -top-0.5 right-0 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center z-20">
                      {tab.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ 하단 실제 CTA ═══ */}
      {(screen === "dashboard" || screen === "community" || screen === "settings") && (
        <div className="fixed bottom-[70px] left-5 right-5 z-40">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signIn("kakao")}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-[14px]
                       flex items-center justify-center gap-2 touch-target"
            style={{
              background: "linear-gradient(135deg, #3B6CF6, #7C3AED)",
              boxShadow: "0 8px 24px rgba(59,108,246,0.35)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            실제로 강사로 시작하기
          </motion.button>
        </div>
      )}
    </div>
  );
}
