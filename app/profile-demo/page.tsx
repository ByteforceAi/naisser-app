"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MapPin, Phone, ExternalLink, Share2,
  Heart, ChevronDown, Check, MessageSquare,
  Camera, Play, Globe, ArrowLeft, Shield,
  Clock, Users, BookOpen, School, Calendar,
  Copy, Send, X,
} from "lucide-react";

/* ═══════════════════════════════════════
   NAISSER 강사 디지털 명함 — 슬라이스 킬러
   ═══════════════════════════════════════ */

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

export default function ProfileDemoPage() {
  const [copied, setCopied] = useState(false);
  const [fav, setFav] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg-grouped)" }}>
      {/* ═══ 배경 메시 그라디언트 ═══ */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 20% 30%, rgba(37,99,235,0.08), transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(124,58,237,0.06), transparent 60%)",
      }} />

      {/* ═══ 상단 네비 (글래스) ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{
          background: "color-mix(in srgb, var(--bg-surface) 80%, transparent)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        }}
      >
        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-surface)]/60 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        </button>
        <div className="flex items-center gap-1.5">
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => setFav(!fav)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-surface)]/60 transition-all">
            <Heart className={`w-5 h-5 transition-all duration-300 ${fav ? "fill-red-500 text-red-500" : ""}`} style={fav ? {} : { color: "var(--ios-gray)" }} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }} onClick={handleCopy}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-surface)]/60 transition-all">
            {copied ? <Check className="w-5 h-5" style={{ color: "var(--accent-success)" }} /> : <Share2 className="w-5 h-5" style={{ color: "var(--ios-gray)" }} />}
          </motion.button>
        </div>
      </motion.div>

      {/* ═══ 히어로: 아바타 + 네이비 카드 오버레이 ═══ */}
      <motion.section
        variants={stagger} initial="hidden" animate="visible"
        className="relative px-5 pt-6 pb-10"
      >
        {/* 아바타 — 슬라이스처럼 크게 */}
        <motion.div variants={fadeUp} className="flex justify-center mb-6">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="w-28 h-28 rounded-[28px] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1E3A5F, #2563EB)",
                boxShadow: "0 12px 40px rgba(37,99,235,0.25), 0 0 0 3px rgba(255,255,255,0.8)",
              }}
            >
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
                김
              </div>
            </motion.div>
            {/* 얼리버드 뱃지 */}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 15 }}
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg"
              style={{ background: "#FBBF24", boxShadow: "0 4px 12px rgba(251,191,36,0.4)" }}
            >
              🐣
            </motion.div>
          </div>
        </motion.div>

        {/* 이름 + 직함 — 네이비 카드 */}
        <motion.div variants={fadeUp}
          className="mx-auto max-w-[320px] rounded-xl p-5 text-center"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            boxShadow: "0 8px 32px rgba(15,23,42,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <h1 className="text-[22px] font-bold text-white tracking-tight mb-1">김예술</h1>
          <p className="text-[14px] mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
            환경생태 · 공예 전문강사
          </p>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-[13px] font-bold text-white">4.8</span>
              <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>(23)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" style={{ color: "rgba(255,255,255,0.4)" }} />
              <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>수도권, 부산경남</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {["환경생태", "공예", "체험실습"].map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* ═══ 연락처 카드 ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="px-5 mb-6"
      >
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-grouped-secondary)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)" }}>
          {[
            { icon: <Phone className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />, label: "휴대전화", value: "010-1234-5678", action: "전화하기" },
            { icon: <Camera className="w-4 h-4" style={{ color: "#E4405F" }} />, label: "Instagram", value: "@kimyesul_eco", action: null, link: true },
            { icon: <Play className="w-4 h-4" style={{ color: "#FF0000" }} />, label: "YouTube", value: "@kimyesul", action: null, link: true },
            { icon: <Globe className="w-4 h-4" style={{ color: "#03C75A" }} />, label: "Blog", value: "blog.naver.com/kimyesul", action: null, link: true },
          ].map((item, i, arr) => (
            <button key={item.label}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--bg-muted)]/80 transition-colors active:bg-[var(--bg-muted)]"
              style={i < arr.length - 1 ? { borderBottom: "1px solid var(--ios-separator)" } : {}}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bg-grouped)" }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium" style={{ color: "var(--ios-gray)" }}>{item.label}</p>
                <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">{item.value}</p>
              </div>
              {item.action && <span className="text-[12px] font-semibold" style={{ color: "var(--accent-primary)" }}>{item.action}</span>}
              {item.link && <ExternalLink className="w-3.5 h-3.5" style={{ color: "var(--ios-separator)" }} />}
            </button>
          ))}
        </div>
      </motion.section>

      {/* ═══ 비용 안내 ═══ */}
      <Section title="비용 안내" delay={0.3}>
        <Card>
          {[
            { emoji: "💰", label: "강사비", value: "학교 기준에 따름" },
            { emoji: "📦", label: "재료비", value: "인당 5,000원 (재료 포함)" },
            { emoji: "🎒", label: "준비물", value: "강사 지참" },
            { emoji: "🚗", label: "교통비", value: "별도 협의" },
            { emoji: "👥", label: "인원", value: "15~30명" },
            { emoji: "⏰", label: "수업시간", value: "2교시 (블록수업)" },
          ].map((item, i, arr) => (
            <div key={item.label}
              className="flex items-center gap-3 px-4 py-3"
              style={i < arr.length - 1 ? { borderBottom: "1px solid var(--ios-separator)" } : {}}>
              <span className="text-[13px] w-6 text-center">{item.emoji}</span>
              <span className="text-[12px] w-14 shrink-0" style={{ color: "var(--ios-gray)" }}>{item.label}</span>
              <span className="text-[14px] text-[var(--text-primary)] flex-1">{item.value}</span>
            </div>
          ))}
        </Card>
      </Section>

      {/* ═══ 소개 ═══ */}
      <Section title="소개" delay={0.35}>
        <p className={`text-[14px] text-[var(--text-secondary)] ${!showBio ? "line-clamp-4" : ""}`}
          style={{ lineHeight: 1.75, wordBreak: "keep-all" }}>
          10년차 환경교육 전문강사입니다. 폐원단을 활용한 업사이클링, 자연물 공예, 텃밭 교육 등 다양한 체험형 환경 수업을 진행합니다. 아이들이 직접 만지고 느끼며 환경의 소중함을 배울 수 있도록 수업을 구성합니다.
        </p>
        {!showBio && (
          <button onClick={() => setShowBio(true)} className="flex items-center gap-0.5 mt-2 text-[13px] font-semibold" style={{ color: "var(--accent-primary)" }}>
            더보기 <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </Section>

      {/* ═══ 수업 프로그램 ═══ */}
      <Section title="수업 프로그램" delay={0.4}>
        <div className="space-y-3">
          {[
            { title: "업사이클링 에코백 만들기", desc: "폐원단을 활용하여 나만의 에코백을 만들어보는 환경 체험 수업", grade: "초등 3~6학년", dur: "2시간", max: 30 },
            { title: "자연물 액자 만들기", desc: "주변의 자연물을 활용하여 나만의 액자를 만드는 수업", grade: "초등 1~4학년", dur: "1시간 30분", max: 25 },
          ].map((p) => (
            <Card key={p.title} className="p-4">
              <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-1.5">{p.title}</h3>
              <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mb-3" style={{ lineHeight: 1.6 }}>{p.desc}</p>
              <div className="flex flex-wrap gap-2.5 text-[11px]" style={{ color: "var(--ios-gray)" }}>
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{p.grade}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.dur}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />최대 {p.max}명</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ═══ 경력 ═══ */}
      <Section title="경력" delay={0.45}>
        <p className="text-[14px] text-[var(--text-secondary)] whitespace-pre-line" style={{ lineHeight: 1.75 }}>
          {"2016~현재 프리랜서 환경교육 강사\n2020 서울시교육청 환경교육 우수 강사 선정\n2022 부산광역시 환경교육센터 위촉 강사\n누적 출강 320회 / 47개교"}
        </p>
      </Section>

      {/* ═══ 자격/인증 — 슬라이스처럼 카드+포트폴리오 ═══ */}
      <Section title="공인 자격으로 증명된 전문성" delay={0.5}>
        <Card className="p-4 space-y-3 mb-3">
          {["환경교육사 2급 (환경부)", "공예지도사 1급 (한국공예협회)", "학교폭력예방 강사 인증"].map((c, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.06 }}
              className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(5,150,105,0.08)" }}>
                <Shield className="w-3.5 h-3.5" style={{ color: "var(--accent-success)" }} />
              </div>
              <span className="text-[14px] text-[var(--text-primary)]">{c}</span>
            </motion.div>
          ))}
        </Card>
      </Section>

      {/* ═══ 출강이력 ═══ */}
      <Section title="출강이력" delay={0.55}>
        <div className="flex gap-3 mb-4">
          {[{ v: "320", l: "총 출강" }, { v: "640h", l: "누적 시간" }, { v: "47", l: "활동 학교" }].map((s) => (
            <Card key={s.l} className="flex-1 py-3 text-center">
              <p className="text-[20px] font-bold text-[var(--text-primary)] tabular-nums">{s.v}</p>
              <p className="text-[11px]" style={{ color: "var(--ios-gray)" }}>{s.l}</p>
            </Card>
          ))}
        </div>
        {[
          { s: "해강초등학교", d: "2026.03", sub: "환경교육" },
          { s: "반송초등학교", d: "2026.02", sub: "공예체험" },
          { s: "해운대중학교", d: "2026.01", sub: "업사이클링" },
        ].map((r, i, arr) => (
          <div key={i} className="flex gap-3 pb-3.5 relative">
            {i < arr.length - 1 && <div className="absolute left-[11px] top-7 bottom-0 w-px" style={{ background: "var(--ios-separator)" }} />}
            <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5" style={{ background: "color-mix(in srgb, var(--accent-primary) 6%, transparent)" }}>
              <School className="w-3 h-3" style={{ color: "var(--accent-primary)" }} />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[var(--text-primary)]">{r.s}</p>
              <p className="text-[12px]" style={{ color: "var(--ios-gray)" }}>{r.d} · {r.sub}</p>
            </div>
          </div>
        ))}
      </Section>

      {/* ═══ 서류 현황 ═══ */}
      <Section title="서류 현황" delay={0.6}>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-3"
          style={{ background: "rgba(5,150,105,0.04)", border: "1px solid rgba(5,150,105,0.1)" }}>
          <Shield className="w-4 h-4" style={{ color: "var(--accent-success)" }} />
          <span className="text-[13px] font-semibold" style={{ color: "var(--accent-success)" }}>필수 서류 완비</span>
        </div>
        <Card>
          {["성범죄 조회 회보서", "결핵검진 확인서", "강사 보험", "사업자등록증"].map((d, i, arr) => (
            <div key={d} className="flex items-center gap-3 px-4 py-2.5"
              style={i < arr.length - 1 ? { borderBottom: "1px solid var(--ios-separator)" } : {}}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(5,150,105,0.06)" }}>
                <Shield className="w-3 h-3" style={{ color: "var(--accent-success)" }} />
              </div>
              <p className="text-[13px] text-[var(--text-primary)] flex-1">{d}</p>
              <span className="text-[11px] font-semibold" style={{ color: "var(--accent-success)" }}>유효</span>
            </div>
          ))}
        </Card>
      </Section>

      {/* ═══ 리뷰 ═══ */}
      <Section title="교사 리뷰 (23)" delay={0.65}>
        <div className="space-y-2.5">
          {[
            { r: 5, t: "아이들이 정말 좋아했어요! 재료도 다 준비해오셔서 편했습니다. 다음 학기에도 꼭 부탁드리고 싶어요.", d: "2026.03.15" },
            { r: 5, t: "환경 수업인데 아이들이 지루해하지 않고 집중했어요. 만들기 활동이 잘 구성되어 있습니다.", d: "2026.02.20" },
            { r: 4, t: "수업 내용이 알차고 시간 관리를 잘 해주셨어요. 재료비가 조금 아쉽지만 퀄리티는 만족합니다.", d: "2026.01.10" },
          ].map((rv, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= rv.r ? "fill-yellow-400 text-yellow-400" : "text-[var(--text-muted)]"}`} />)}
                <span className="text-[11px] ml-1.5" style={{ color: "var(--ios-gray)" }}>{rv.d}</span>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] line-clamp-3" style={{ lineHeight: 1.65 }}>{rv.t}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ═══ 공유 ═══ */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="px-5 mb-36"
      >
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold active:scale-[0.97] transition-transform"
            style={{ background: "#FEE500", color: "#191600" }}>
            <MessageSquare className="w-4 h-4" /> 카카오톡 공유
          </button>
          <button onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold active:scale-[0.97] transition-transform"
            style={{ background: "var(--bg-grouped)", color: "var(--text-secondary)" }}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "복사됨!" : "링크 복사"}
          </button>
        </div>
      </motion.div>

      {/* NAISSER 워터마크 */}
      <div className="text-center pb-6">
        <p className="text-[11px] font-medium tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>NAISSER</p>
      </div>

      {/* ═══ 하단 CTA — 슬라이스처럼 플로팅 ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3"
        style={{
          background: "color-mix(in srgb, var(--bg-surface) 92%, transparent)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          borderTop: "0.5px solid rgba(0,0,0,0.05)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}>
        <div className="max-w-[480px] mx-auto flex gap-2">
          <motion.button whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-[15px] font-bold transition-all"
            style={{ background: "var(--bg-grouped-secondary)", border: "1.5px solid var(--ios-separator)", color: "var(--text-primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <Phone className="w-4 h-4" /> 전화
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => setShowInquiry(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-bold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              boxShadow: "0 4px 20px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.1)",
            }}>
            <Send className="w-4 h-4" /> 수업 문의하기
          </motion.button>
        </div>
      </div>

      {/* ═══ 문의 바텀시트 ═══ */}
      <AnimatePresence>
        {showInquiry && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
              onClick={() => setShowInquiry(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl max-h-[85vh] overflow-y-auto"
              style={{ background: "var(--bg-grouped-secondary)", paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}
            >
              <div className="pt-3 pb-2 flex justify-center"><div className="w-10 h-1.5 rounded-full bg-[var(--ios-separator)]" /></div>
              <div className="px-5 pb-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[17px] font-bold text-[var(--text-primary)]">김예술 강사에게 문의</h2>
                  <button onClick={() => setShowInquiry(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--bg-muted)]">
                    <X className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] font-semibold text-[var(--text-muted)] mb-1.5 block">이름 *</label>
                    <input placeholder="홍길동" className="w-full px-4 py-3 rounded-xl border border-[var(--ios-separator)] text-[14px] outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[var(--text-muted)] mb-1.5 block">학교명</label>
                    <input placeholder="OO초등학교" className="w-full px-4 py-3 rounded-xl border border-[var(--ios-separator)] text-[14px] outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-[var(--text-muted)] mb-1.5 block">문의 내용 *</label>
                    <textarea placeholder="수업 주제, 희망 일정, 대상 학년 등을 알려주세요" rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--ios-separator)] text-[14px] outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none placeholder:text-[var(--text-muted)]"
                      style={{ lineHeight: 1.7 }} />
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-bold text-white mt-5"
                  style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>
                  <Send className="w-4 h-4" /> 문의 보내기
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ 헬퍼 컴포넌트 ═══ */
function Section({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="px-5 mb-7">
      <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: "var(--ios-gray)" }}>{title}</h2>
      {children}
    </motion.section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: "var(--bg-grouped-secondary)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)" }}>
      {children}
    </div>
  );
}
