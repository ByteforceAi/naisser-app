"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, FileText, Heart, Bell, User,
  Search, Star, MapPin, ChevronRight, ArrowLeft,
  Sparkles, Check, X, Calendar, Clock, Users,
  BookOpen, School, Send, MessageSquare,
  CheckCircle2, Mic, GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { SlotNumber } from "@/components/shared/SlotNumber";

const ease = [0.22, 1, 0.36, 1] as const;

type Screen = "splash" | "register" | "home" | "detail" | "request" | "success" | "favorites" | "notifications";

// ═══ Apple 연락처 팔레트 ═══
const COLORS = ["#FF3B30","#FF9500","#34C759","#007AFF","#5856D6","#AF52DE","#FF2D55","#30B0C7"];
function avatarColor(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

// ═══ 데모 데이터 ═══
const DEMO_INSTRUCTORS = [
  { id: "1", name: "김진로", topics: ["진로&직업", "AI디지털"], region: "수도권", rating: 4.9, reviews: 23, bio: "10년차 진로교육 전문강사. 학생 맞춤형 직업 탐색 프로그램 운영." },
  { id: "2", name: "박체육", topics: ["체육&신체활동"], region: "부산경남", rating: 4.7, reviews: 15, bio: "뉴스포츠 전문. 학교 체육 프로그램 200회+ 진행." },
  { id: "3", name: "이예술", topics: ["미술&공예", "환경&생태"], region: "대전충남", rating: 4.8, reviews: 31, bio: "업사이클링 아트 전문. 환경교육과 미술을 결합한 수업." },
  { id: "4", name: "최코딩", topics: ["AI디지털", "코딩"], region: "수도권", rating: 4.6, reviews: 8, bio: "초등 코딩교육 전문. 스크래치/파이썬 수업." },
  { id: "5", name: "정음악", topics: ["음악", "실습체험"], region: "광주전남", rating: 5.0, reviews: 42, bio: "우쿨렐레·난타 수업. 전 학년 가능." },
];

const DEMO_NOTIFICATIONS = [
  { icon: "✅", title: "의뢰가 수락되었어요!", desc: "김진로 강사님이 진로체험 수업을 수락했습니다", time: "방금", unread: true },
  { icon: "⭐", title: "리뷰 작성을 잊지 마세요", desc: "박체육 강사님의 수업이 완료되었습니다", time: "1시간 전", unread: true },
  { icon: "🔔", title: "새로운 강사가 등록됐어요", desc: "AI디지털 분야 강사 3명이 새로 가입했습니다", time: "어제", unread: false },
];

export default function TeacherSimulation() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [selectedInstructor, setSelectedInstructor] = useState(DEMO_INSTRUCTORS[0]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["2", "5"]));
  const [requestStep, setRequestStep] = useState(1);
  const [requestType, setRequestType] = useState("");
  const [requestCategory, setRequestCategory] = useState("");
  const [requestGrade, setRequestGrade] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // 스플래시 → 등록
  useEffect(() => {
    if (screen === "splash") {
      const t = setTimeout(() => setScreen("register"), 2000);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const filteredInstructors = DEMO_INSTRUCTORS.filter((inst) => {
    if (searchQuery && !inst.name.includes(searchQuery) && !inst.topics.some(t => t.includes(searchQuery))) return false;
    if (selectedTopic && !inst.topics.some(t => t.includes(selectedTopic))) return false;
    return true;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      {/* ═══ 시뮬레이션 헤더 ═══ */}
      <header className="sticky top-0 z-[60] px-5 py-3 flex items-center gap-3"
        style={{
          background: "var(--bg-grouped)",
          opacity: 0.95,
          backdropFilter: "blur(20px) saturate(1.3)",
          borderBottom: "1px solid var(--ios-separator)",
        }}
      >
        <Link href="/" className="p-2 -ml-2 rounded-xl active:bg-[var(--bg-muted)] transition-colors touch-target">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        </Link>
        <h1 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>교사 체험 시뮬레이션</h1>
        <div className="flex-1" />
        <span className="text-[11px] font-semibold px-2 py-1 rounded-full"
          style={{ color: "var(--accent-success)", background: "rgba(52,199,89,0.1)" }}>
          DEMO
        </span>
      </header>

      <AnimatePresence mode="wait">
        {/* ─── 스플래시 ─── */}
        {screen === "splash" && (
          <motion.div key="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center px-5 py-20">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-20 h-20 rounded-[20px] mb-6 flex items-center justify-center"
              style={{ background: "var(--glass-bg)", backdropFilter: "blur(14px)", boxShadow: "0 12px 40px rgba(5,150,105,0.12)", border: "0.5px solid var(--glass-border)" }}
            >
              <div className="w-14 h-14 rounded-full overflow-hidden relative">
                <div className="absolute inset-0" style={{ background: "conic-gradient(from 0deg, #059669, #34D399, #10B981, #059669)", animation: "orbSpin 5s linear infinite" }} />
                <div className="absolute inset-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
              <p className="text-[20px] font-bold tracking-[0.15em]" style={{ color: "var(--accent-success)" }}>NAISSER</p>
              <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>교사 체험을 시작합니다...</p>
            </motion.div>
          </motion.div>
        )}

        {/* ─── 교사 등록 ─── */}
        {screen === "register" && (
          <motion.div key="register" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease }} className="px-5 py-8">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(5,150,105,0.1)" }}>
                <School className="w-6 h-6" style={{ color: "var(--accent-success)" }} />
              </div>
              <h2 className="text-[22px] font-extrabold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>학교 정보 입력</h2>
              <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>학교와 학년 정보만 있으면 시작할 수 있어요</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[13px] font-semibold block mb-2" style={{ color: "var(--text-primary)" }}>학교명 *</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-[10px]" style={{ background: "var(--ios-fill)" }}>
                  <School className="w-4 h-4" style={{ color: "var(--ios-gray)" }} />
                  <span className="text-[15px]" style={{ color: "var(--text-primary)" }}>서울대학초등학교</span>
                  <Check className="w-4 h-4 ml-auto" style={{ color: "var(--accent-success)" }} />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold block mb-2" style={{ color: "var(--text-primary)" }}>담당 학년</label>
                <div className="flex flex-wrap gap-2">
                  {["초1~2", "초3~4", "초5~6"].map((g, i) => (
                    <div key={g} className="px-3 py-2 rounded-[10px] text-[13px] font-medium flex items-center gap-1"
                      style={i === 2 ? { background: "var(--accent-success)", color: "#fff" } : { background: "var(--ios-fill)", color: "var(--text-secondary)" }}>
                      {i === 2 && <Check className="w-3.5 h-3.5" />} {g}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setScreen("home")}
              className="w-full mt-8 py-4 rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 touch-target"
              style={{ background: "linear-gradient(135deg, #059669, #34D399)", boxShadow: "0 4px 16px rgba(5,150,105,0.3)" }}>
              강사 찾기 시작
            </motion.button>
          </motion.div>
        )}

        {/* ─── 강사 검색 (홈) ─── */}
        {screen === "home" && (
          <motion.div key="home" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease }} className="pb-24">
            {/* 헤더 */}
            <div className="px-5 pt-4 pb-3" style={{ background: "var(--bg-grouped)" }}>
              <h2 className="text-[28px] font-bold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>강사 찾기</h2>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--ios-gray)" }} />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="이름, 주제 검색" className="w-full pl-9 pr-4 py-[9px] rounded-[10px] text-[15px] outline-none"
                    style={{ background: "var(--ios-fill)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div className="flex gap-1 p-[2px] rounded-[9px]" style={{ background: "var(--ios-fill)" }}>
                {[null, "진로", "체육", "AI"].map((t) => (
                  <button key={t || "all"} onClick={() => setSelectedTopic(t)}
                    className="px-3 py-[6px] rounded-[7px] text-[13px] font-semibold transition-all flex-1 whitespace-nowrap"
                    style={{
                      background: selectedTopic === t ? "var(--bg-surface)" : "transparent",
                      color: selectedTopic === t ? "var(--text-primary)" : "var(--ios-gray)",
                      boxShadow: selectedTopic === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}>
                    {t || "전체"}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 py-2">
              <p className="text-[13px] font-medium uppercase tracking-wide" style={{ color: "var(--ios-gray)" }}>
                {filteredInstructors.length}명의 강사
              </p>
            </div>

            {/* 리스트 */}
            <div className="px-5">
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-grouped-secondary)" }}>
                {filteredInstructors.map((inst, i) => (
                  <motion.button key={inst.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    onClick={() => { setSelectedInstructor(inst); setScreen("detail"); }}
                    className="w-full flex items-center gap-3 px-4 py-[11px] text-left active:bg-[rgba(0,0,0,0.04)] transition-colors">
                    <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0"
                      style={{ background: avatarColor(inst.name) }}>
                      <span className="text-[17px] font-semibold text-white">{inst.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center gap-2 py-[2px]"
                      style={{ borderBottom: i < filteredInstructors.length - 1 ? "0.5px solid var(--ios-separator)" : "none",
                               paddingBottom: i < filteredInstructors.length - 1 ? "13px" : "2px" }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[17px] truncate" style={{ color: "var(--text-primary)" }}>{inst.name}</span>
                          <span className="flex items-center gap-0.5 text-[13px]" style={{ color: "var(--ios-gray)" }}>
                            <Star className="w-3 h-3 fill-[#FF9500] text-[#FF9500]" />{inst.rating}
                          </span>
                        </div>
                        <p className="text-[15px] truncate" style={{ color: "var(--ios-gray)" }}>
                          {inst.topics.join(", ")} · {inst.region}
                        </p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(inst.id); }} className="p-1 touch-target">
                        <Heart className="w-5 h-5" style={{ color: favorites.has(inst.id) ? "#FF2D55" : "var(--ios-gray3)" }}
                          fill={favorites.has(inst.id) ? "#FF2D55" : "none"} />
                      </button>
                      <ChevronRight className="w-[14px] h-[14px] shrink-0" style={{ color: "var(--ios-gray3)" }} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── 강사 상세 ─── */}
        {screen === "detail" && (
          <motion.div key="detail" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease }} className="pb-24">
            <div className="px-5 pt-2 pb-4">
              <button onClick={() => setScreen("home")} className="flex items-center gap-1 mb-4 text-[15px] font-medium"
                style={{ color: "var(--accent-primary)" }}>
                <ArrowLeft className="w-4 h-4" /> 목록으로
              </button>

              {/* 프로필 카드 */}
              <div className="text-center mb-6">
                <div className="w-[80px] h-[80px] rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: avatarColor(selectedInstructor.name) }}>
                  <span className="text-[32px] font-bold text-white">{selectedInstructor.name.charAt(0)}</span>
                </div>
                <h2 className="text-[22px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>{selectedInstructor.name}</h2>
                <div className="flex items-center justify-center gap-2 text-[15px]" style={{ color: "var(--ios-gray)" }}>
                  <Star className="w-4 h-4 fill-[#FF9500] text-[#FF9500]" />
                  {selectedInstructor.rating} ({selectedInstructor.reviews}개 리뷰)
                  <span>·</span>
                  <MapPin className="w-3.5 h-3.5" /> {selectedInstructor.region}
                </div>
              </div>

              {/* 정보 카드 */}
              <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--bg-grouped-secondary)" }}>
                <div className="px-4 py-3" style={{ borderBottom: "0.5px solid var(--ios-separator)" }}>
                  <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>소개</p>
                  <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-primary)" }}>{selectedInstructor.bio}</p>
                </div>
                <div className="px-4 py-3" style={{ borderBottom: "0.5px solid var(--ios-separator)" }}>
                  <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>수업 분야</p>
                  <div className="flex gap-2">
                    {selectedInstructor.topics.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-lg text-[13px] font-medium"
                        style={{ background: "rgba(0,122,255,0.08)", color: "var(--accent-primary)" }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>활동 지역</p>
                  <p className="text-[15px]" style={{ color: "var(--text-primary)" }}>{selectedInstructor.region}</p>
                </div>
              </div>

              {/* CTA */}
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { setRequestStep(1); setRequestType(""); setRequestCategory(""); setRequestGrade(""); setScreen("request"); }}
                className="w-full py-4 rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 touch-target"
                style={{ background: "linear-gradient(135deg, #059669, #34D399)", boxShadow: "0 4px 16px rgba(5,150,105,0.3)" }}>
                <Send className="w-4 h-4" /> 수업 의뢰하기
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── 수업 의뢰 ─── */}
        {screen === "request" && (
          <motion.div key="request" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease }} className="px-5 pt-4 pb-24">
            <div className="flex items-center gap-2 mb-5">
              <button onClick={() => setScreen("detail")} className="p-1.5 rounded-lg active:bg-[var(--bg-muted)]">
                <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
              </button>
              <h2 className="text-[17px] font-bold" style={{ color: "var(--text-primary)" }}>수업 의뢰</h2>
              <span className="text-[13px] ml-auto" style={{ color: "var(--accent-success)" }}>{selectedInstructor.name} 강사님</span>
            </div>

            {/* 프로그레스 */}
            <div className="flex gap-2 mb-6">
              {[1, 2].map(s => (
                <div key={s} className="flex-1 h-1 rounded-full" style={{ background: s <= requestStep ? "var(--accent-success)" : "var(--ios-fill)" }} />
              ))}
            </div>

            {requestStep === 1 ? (
              <div className="space-y-5">
                <div>
                  <p className="text-[13px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>수업 유형 *</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "special", label: "외부특강", icon: Mic, color: "#007AFF" },
                      { id: "afterschool", label: "방과후학교", icon: GraduationCap, color: "#5856D6" },
                    ].map(t => (
                      <motion.button key={t.id} whileTap={{ scale: 0.95 }} onClick={() => setRequestType(t.id)}
                        className="p-3 rounded-xl text-left flex items-center gap-2"
                        style={{
                          background: requestType === t.id ? `${t.color}15` : "var(--bg-grouped-secondary)",
                          border: requestType === t.id ? `1.5px solid ${t.color}40` : "1px solid var(--ios-separator)",
                        }}>
                        <t.icon className="w-5 h-5" style={{ color: t.color }} />
                        <span className="text-[14px] font-medium" style={{ color: requestType === t.id ? t.color : "var(--text-primary)" }}>{t.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>수업 분야 *</p>
                  <div className="flex flex-wrap gap-2">
                    {["진로&직업", "AI디지털", "환경&생태", "체육"].map(c => (
                      <button key={c} onClick={() => setRequestCategory(c)}
                        className="px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all"
                        style={{
                          background: requestCategory === c ? "var(--accent-success)" : "var(--bg-grouped-secondary)",
                          color: requestCategory === c ? "#fff" : "var(--text-secondary)",
                          border: requestCategory === c ? "none" : "1px solid var(--ios-separator)",
                        }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>대상 학년 *</p>
                  <div className="flex flex-wrap gap-2">
                    {["초1~2", "초3~4", "초5~6", "중1", "중2~3"].map(g => (
                      <button key={g} onClick={() => setRequestGrade(g)}
                        className="px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all"
                        style={{
                          background: requestGrade === g ? "var(--accent-success)" : "var(--bg-grouped-secondary)",
                          color: requestGrade === g ? "#fff" : "var(--text-secondary)",
                          border: requestGrade === g ? "none" : "1px solid var(--ios-separator)",
                        }}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }}
                  disabled={!requestType || !requestCategory || !requestGrade}
                  onClick={() => setRequestStep(2)}
                  className="w-full py-3.5 rounded-xl text-white font-bold text-[15px] touch-target disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #059669, #34D399)" }}>
                  다음 →
                </motion.button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 요약 */}
                <div className="p-4 rounded-xl" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4" style={{ color: "#34D399" }} />
                    <span className="text-[14px] font-bold text-white">{requestType === "special" ? "외부특강" : "방과후학교"} · {requestCategory}</span>
                  </div>
                  <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>{requestGrade} · 서울대학초등학교</p>
                </div>

                <div>
                  <p className="text-[13px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>희망 날짜</p>
                  <div className="px-4 py-3 rounded-[10px] flex items-center gap-2" style={{ background: "var(--ios-fill)" }}>
                    <Calendar className="w-4 h-4" style={{ color: "var(--ios-gray)" }} />
                    <span className="text-[15px]" style={{ color: "var(--text-primary)" }}>2026-04-15</span>
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>요청사항 (선택)</p>
                  <div className="px-4 py-3 rounded-[10px]" style={{ background: "var(--ios-fill)" }}>
                    <p className="text-[15px]" style={{ color: "var(--text-muted)" }}>수업 관련 참고사항을 적어주세요</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setRequestStep(1)}
                    className="flex-1 py-3.5 rounded-xl text-[14px] font-semibold"
                    style={{ color: "var(--text-secondary)", border: "1px solid var(--ios-separator)" }}>
                    이전
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setScreen("success")}
                    className="flex-1 py-3.5 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-1.5"
                    style={{ background: "linear-gradient(135deg, #059669, #34D399)", boxShadow: "0 4px 12px rgba(5,150,105,0.3)" }}>
                    <Send className="w-4 h-4" /> 의뢰 보내기
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── 성공 ─── */}
        {screen === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease }} className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 rounded-full mb-6 flex items-center justify-center"
              style={{ background: "rgba(5,150,105,0.1)" }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: "var(--accent-success)" }} />
            </motion.div>
            <h2 className="text-[22px] font-bold mb-2" style={{ color: "var(--text-primary)" }}>의뢰가 전송되었습니다!</h2>
            <p className="text-[15px] mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {selectedInstructor.name} 강사님에게 알림이 전송되었습니다.<br/>수락 여부를 알림으로 알려드릴게요.
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setScreen("home")}
                className="flex-1 py-3.5 rounded-xl text-[14px] font-semibold"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--ios-separator)" }}>
                강사 더 찾기
              </button>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => signIn("kakao")}
                className="flex-1 py-3.5 rounded-xl text-white font-bold text-[14px] touch-target"
                style={{ background: "linear-gradient(135deg, #059669, #34D399)" }}>
                실제로 시작하기
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── 즐겨찾기 ─── */}
        {screen === "favorites" && (
          <motion.div key="favorites" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease }} className="px-5 pt-4 pb-24">
            <h2 className="text-[28px] font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>즐겨찾기</h2>
            <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-grouped-secondary)" }}>
              {DEMO_INSTRUCTORS.filter(i => favorites.has(i.id)).map((inst, i, arr) => (
                <div key={inst.id} className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < arr.length - 1 ? "0.5px solid var(--ios-separator)" : "none" }}>
                  <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0"
                    style={{ background: avatarColor(inst.name) }}>
                    <span className="text-[17px] font-semibold text-white">{inst.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[17px]" style={{ color: "var(--text-primary)" }}>{inst.name}</span>
                    <p className="text-[15px]" style={{ color: "var(--ios-gray)" }}>{inst.topics[0]} · {inst.region}</p>
                  </div>
                  <button onClick={() => toggleFavorite(inst.id)} className="p-1 touch-target">
                    <Heart className="w-5 h-5 fill-[#FF2D55] text-[#FF2D55]" />
                  </button>
                </div>
              ))}
              {favorites.size === 0 && (
                <div className="py-12 text-center">
                  <Heart className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--ios-gray3)" }} />
                  <p className="text-[15px]" style={{ color: "var(--ios-gray)" }}>즐겨찾기한 강사가 없어요</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── 알림 ─── */}
        {screen === "notifications" && (
          <motion.div key="notifications" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease }} className="px-5 pt-4 pb-24">
            <h2 className="text-[28px] font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>알림</h2>
            <div className="space-y-2">
              {DEMO_NOTIFICATIONS.map((n, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-xl flex items-start gap-3 ${n.unread ? "" : "opacity-60"}`}
                  style={{
                    background: n.unread ? "rgba(5,150,105,0.04)" : "var(--bg-grouped-secondary)",
                    border: n.unread ? "1px solid rgba(5,150,105,0.08)" : "1px solid var(--ios-separator)",
                  }}>
                  <span className="text-xl">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[13px]" style={{ color: "var(--text-primary)" }}>{n.title}</div>
                    <div className="text-[12px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{n.desc}</div>
                  </div>
                  <span className="text-[11px] shrink-0" style={{ color: "var(--text-muted)" }}>{n.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ 바텀 네비 ═══ */}
      {!["splash", "register", "success"].includes(screen) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-2"
          style={{
            background: "var(--bg-grouped)",
            opacity: 0.95,
            backdropFilter: "blur(20px) saturate(1.4)",
            borderTop: "0.5px solid var(--ios-separator)",
            paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
          }}>
          {[
            { icon: Home, label: "홈", go: "home" as Screen },
            { icon: Heart, label: "즐겨찾기", go: "favorites" as Screen, badge: favorites.size },
            { icon: Search, label: "검색", go: "home" as Screen },
            { icon: Bell, label: "알림", go: "notifications" as Screen, badge: 2 },
            { icon: User, label: "프로필", go: "home" as Screen },
          ].map((tab) => {
            const isActive = screen === tab.go;
            return (
              <motion.button key={tab.label} whileTap={{ scale: 0.85 }} onClick={() => setScreen(tab.go)}
                className="relative flex flex-col items-center py-1 px-3">
                {isActive && (
                  <motion.div layoutId="teacherNavIndicator"
                    className="absolute -top-1 w-12 h-8 rounded-full"
                    style={{ background: "rgba(5,150,105,0.08)", border: "0.5px solid rgba(5,150,105,0.12)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                )}
                <tab.icon className="w-6 h-6 relative z-10"
                  style={{ color: isActive ? "var(--accent-success)" : "var(--ios-gray)" }}
                  strokeWidth={isActive ? 2 : 1.5} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-0.5 right-0 min-w-[16px] h-[16px] rounded-full text-white text-[10px] font-bold flex items-center justify-center z-20"
                    style={{ background: "var(--accent-danger)" }}>{tab.badge}</span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ═══ 실제 CTA ═══ */}
      {["home", "favorites"].includes(screen) && (
        <div className="fixed bottom-[70px] left-5 right-5 z-40">
          <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2 }}
            whileTap={{ scale: 0.97 }} onClick={() => signIn("kakao")}
            className="w-full py-3.5 rounded-xl text-white font-bold text-[14px] flex items-center justify-center gap-2 touch-target"
            style={{ background: "linear-gradient(135deg, #059669, #34D399)", boxShadow: "0 8px 24px rgba(5,150,105,0.35)" }}>
            <Sparkles className="w-4 h-4" /> 실제로 교사로 시작하기
          </motion.button>
        </div>
      )}
    </div>
  );
}
