"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileCheck,
  History,
  Briefcase,
  CalendarDays,
  BarChart3,
  MessageCircle,
  ChevronRight,
  Users,
  Shield,
  Star,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const FEATURES = [
  { icon: FileCheck, title: "서류함", desc: "범죄경력·통장·보험 등 한 번 올리면 어디서든", color: "#2563EB" },
  { icon: History, title: "출강이력", desc: "수업할수록 자동으로 경력이 쌓이는 이력 관리", color: "#7C3AED" },
  { icon: Briefcase, title: "포트폴리오", desc: "수업 사진·영상을 한곳에 모아 프로필 강화", color: "#059669" },
  { icon: CalendarDays, title: "수업 캘린더", desc: "일정 관리 + 충돌 감지로 스케줄 실수 방지", color: "#D97706" },
  { icon: BarChart3, title: "인사이트", desc: "프로필 조회수·문의·공유 통계를 한눈에", color: "#DC2626" },
  { icon: MessageCircle, title: "강사 커뮤니티", desc: "단가 정보·노하우·구인 공유, 강사끼리만", color: "#0891B2" },
];

export default function InstructorPreviewPage() {
  const [instructorCount, setInstructorCount] = useState(0);

  useEffect(() => {
    fetch("/api/landing/stats")
      .then((r) => r.json())
      .then((d) => d.data && setInstructorCount(d.data.instructors))
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* ═══ 헤더 ═══ */}
      <header className="sticky top-0 z-50 px-5 py-3 flex items-center gap-3"
        style={{
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px) saturate(1.3)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <Link href="/" className="p-1.5 -ml-1.5">
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </Link>
        <h1 className="text-[15px] font-bold text-[var(--text-primary)]">강사 둘러보기</h1>
      </header>

      {/* ═══ 히어로 ═══ */}
      <section className="px-5 pt-10 pb-8">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeInUp} className="mb-2">
            <span className="text-xs font-semibold text-blue-500 tracking-widest uppercase">FOR INSTRUCTORS</span>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-[1.6rem] font-bold text-[var(--text-primary)] leading-tight mb-3">
            프리랜서 강사의<br />모든 업무를 한곳에서
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-sm text-[var(--text-secondary)] leading-relaxed">
            서류 관리, 경력 증명, 수업 일정까지.<br />
            나이써가 강사님의 업무 파트너가 됩니다.
          </motion.p>
        </motion.div>
      </section>

      {/* ═══ A. 기능 소개 카드 6개 ═══ */}
      <section className="px-5 pb-10">
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(0,0,0,0.04)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${f.color}10` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">{f.title}</h3>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ═══ B. 대시보드 미리보기 ═══ */}
      <section className="px-5 pb-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p variants={fadeInUp} className="text-xs font-semibold text-violet-500 tracking-widest uppercase mb-2">
            DASHBOARD PREVIEW
          </motion.p>
          <motion.h3 variants={fadeInUp} className="text-lg font-bold text-[var(--text-primary)] mb-5">
            가입하면 이런 대시보드가 생겨요
          </motion.h3>

          {/* 미니 대시보드 목업 */}
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(124,58,237,0.04))",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            {/* 프로필 카드 */}
            <div className="p-4 flex items-center gap-3 border-b border-[rgba(0,0,0,0.04)]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                강
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[var(--text-primary)]">강사님</span>
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">프로필 완성도 72%</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-[var(--text-primary)]">4.8</span>
              </div>
            </div>

            {/* 통계 미니 카드 */}
            <div className="grid grid-cols-3 gap-px bg-[rgba(0,0,0,0.04)]">
              {[
                { label: "총 수업", value: "24회", color: "#2563EB" },
                { label: "이번 달", value: "5회", color: "#059669" },
                { label: "수입", value: "180만", color: "#D97706" },
              ].map((s) => (
                <div key={s.label} className="bg-white p-3 text-center">
                  <div className="text-[15px] font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* 다가오는 수업 */}
            <div className="p-4">
              <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-2">다가오는 수업</div>
              <div className="space-y-2">
                {[
                  { school: "서울초등학교", date: "4/10 (목)", topic: "환경교육" },
                  { school: "한강중학교", date: "4/12 (토)", topic: "진로체험" },
                ].map((cls) => (
                  <div key={cls.school} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="font-medium text-[var(--text-primary)]">{cls.school}</span>
                    <span className="text-[var(--text-muted)]">{cls.date}</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">{cls.topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ C. 커뮤니티 링크 ═══ */}
      <section className="px-5 pb-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <Link
              href="/community"
              className="block p-5 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(8,145,178,0.06), rgba(5,150,105,0.06))",
                border: "1px solid rgba(8,145,178,0.1)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-[var(--text-primary)]">강사 라운지 둘러보기</h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {instructorCount > 0 ? `현재 ${instructorCount}명의 강사님이 활동 중` : "강사들의 커뮤니티"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <div className="flex gap-2 mt-3">
                {["단가 정보", "수업 노하우", "구인·구직"].map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-white/80 text-cyan-700 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ D. CTA ═══ */}
      <section className="px-5 pb-20">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.p variants={fadeInUp} className="text-sm text-[var(--text-secondary)] mb-5">
            30초 만에 프로필을 만들고<br />교사들의 수업 의뢰를 받아보세요
          </motion.p>
          <motion.div variants={fadeInUp}>
            <button
              onClick={() => signIn("kakao")}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-[15px]
                         flex items-center justify-center gap-2 touch-target"
              style={{
                background: "linear-gradient(135deg, #3B6CF6, #7C3AED)",
                boxShadow: "0 4px 20px rgba(59,108,246,0.3)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              강사로 시작하기
            </button>
          </motion.div>
          <motion.p variants={fadeInUp} className="text-[11px] text-[var(--text-muted)] mt-3">
            카카오 또는 구글로 3초 만에 가입
          </motion.p>
        </motion.div>
      </section>
    </main>
  );
}
