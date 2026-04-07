"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, Users, BookOpen, School,
  MessageSquare, Send, Loader2, CheckCircle2, ChevronRight,
  Sparkles, Mic, GraduationCap, Sun, Compass, ShieldCheck, Briefcase,
  type LucideIcon,
} from "lucide-react";
import { SchoolSearch } from "@/components/shared/SchoolSearch";
import { Info } from "lucide-react";

/** 수업 유형별 안내 정보 — 해강초 2026 운영계획서 기준 */
const LESSON_TYPE_INFO: Record<string, { items: string[]; note?: string }> = {
  afterschool: {
    items: [
      "운영 기간: 2개월 단위 (연 6기)",
      "운영 시간: 주중 13:00~17:30",
      "정원: 학급당 20명 내외, 25명 초과 불가",
      "수강료: 월 28,000~56,000원 (교재·재료비 별도)",
    ],
    note: "수익자 부담이며, 무상교육 대상 학생은 학교 지원",
  },
  careclass: {
    items: [
      "운영 시간: 방과후~17:00 (늘봄학교)",
      "대상: 초등 1~2학년 중심 (희망 시 전학년)",
      "비용: 무상 운영 (교육청 예산)",
    ],
    note: "돌봄 프로그램은 학교별 운영시간이 다를 수 있습니다",
  },
  mandatory: {
    items: [
      "대상: 학교폭력예방, 성교육, 안전교육 등 법정 필수",
      "보통 학기 중 1~2회, 전교생 대상",
      "예산: 학교 운영비 집행 (강사비 차시당 4만원 기준)",
    ],
  },
  special: {
    items: [
      "1~2회 단발 초청 수업",
      "강사비: 차시당 약 40,000원 (교육청 기준)",
      "학교 예산 또는 학부모회 지원 가능",
    ],
  },
};

const LESSON_TYPES: { id: string; label: string; desc: string; icon: LucideIcon; color: string }[] = [
  { id: "special", label: "외부특강", desc: "1~2회 단발 수업", icon: Mic, color: "var(--accent-primary)" },
  { id: "afterschool", label: "방과후학교", desc: "정기 학기 단위", icon: GraduationCap, color: "#7C3AED" },
  { id: "careclass", label: "늘봄/돌봄", desc: "오후 돌봄 프로그램", icon: Sun, color: "#059669" },
  { id: "freeterm", label: "자유학기제", desc: "중학교 주제선택", icon: Compass, color: "#D97706" },
  { id: "mandatory", label: "법정 의무교육", desc: "학교폭력/안전/성교육", icon: ShieldCheck, color: "#DC2626" },
  { id: "career", label: "진로체험", desc: "직업인 특강/체험", icon: Briefcase, color: "#0891B2" },
];

const CATEGORIES = [
  { id: "환경", color: "#16A34A" },
  { id: "생명존중", color: "#DC2626" },
  { id: "AI", color: "#0891B2" },
  { id: "코딩", color: "#7C3AED" },
  { id: "미술", color: "#EC4899" },
  { id: "공예", color: "#D97706" },
  { id: "체육", color: "#059669" },
  { id: "음악", color: "#8B5CF6" },
  { id: "진로", color: "#2563EB" },
  { id: "독서", color: "#78716C" },
  { id: "심리상담", color: "#6366F1" },
  { id: "기타", color: "#6B7280" },
];

const GRADES = [
  { id: "초등 1~2학년", short: "초1~2" },
  { id: "초등 3~4학년", short: "초3~4" },
  { id: "초등 5~6학년", short: "초5~6" },
  { id: "중등 1학년", short: "중1" },
  { id: "중등 2학년", short: "중2" },
  { id: "중등 3학년", short: "중3" },
  { id: "고등 1학년", short: "고1" },
  { id: "고등 2학년", short: "고2" },
  { id: "고등 3학년", short: "고3" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function RequestForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const instructorId = searchParams.get("instructorId");

  const [instructorName, setInstructorName] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    instructorId: instructorId || "",
    lessonType: "",
    schoolName: "",
    date: "",
    startTime: "",
    endTime: "",
    hours: "2",
    category: "",
    targetGrade: "",
    studentCount: "",
    budget: "",
    memo: "",
  });

  useEffect(() => {
    if (instructorId) {
      fetch(`/api/instructors/${instructorId}`)
        .then((r) => r.json())
        .then((json) => {
          const data = json.data || json;
          if (data?.instructorName) setInstructorName(data.instructorName);
        })
        .catch(() => {});
    }
  }, [instructorId]);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const canProceed1 = form.lessonType && form.schoolName && form.date && form.category && form.targetGrade;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          studentCount: form.studentCount ? parseInt(form.studentCount) : null,
          budget: form.budget ? parseInt(form.budget) : null,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "의뢰 등록에 실패했습니다.");
        return;
      }
      setSuccess(true);
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // ═══ 성공 화면 ═══
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--bg-grouped)" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: "linear-gradient(135deg, rgba(5,150,105,0.1), rgba(52,211,153,0.15))" }}
        >
          <CheckCircle2 className="w-12 h-12" style={{ color: "#059669" }} />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-xl font-bold text-[var(--text-primary)] mb-2">
          의뢰가 전송되었습니다!
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-[14px] text-[var(--text-secondary)] text-center mb-8" style={{ lineHeight: 1.7 }}>
          {instructorName ? `${instructorName} 강사님에게` : "강사님에게"} 알림이 전송되었습니다.<br />
          수락 여부를 알림으로 알려드릴게요.
        </motion.p>
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/teacher/home")}
          className="px-8 py-3.5 rounded-xl text-[15px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #059669, #34D399)", boxShadow: "0 4px 16px rgba(5,150,105,0.3)" }}>
          홈으로 돌아가기
        </motion.button>
      </div>
    );
  }

  const selectedCat = CATEGORIES.find((c) => c.id === form.category);
  const completedFields = [form.lessonType, form.schoolName, form.date, form.category, form.targetGrade].filter(Boolean).length;
  const selectedType = LESSON_TYPES.find((t) => t.id === form.lessonType);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      {/* 배경 메시 */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 20% 30%, rgba(5,150,105,0.06), transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(52,211,153,0.04), transparent 60%)",
      }} />

      {/* ═══ 헤더 ═══ */}
      <div className="sticky top-0 z-50 px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(248,250,255,0.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <button onClick={() => step === 1 ? router.back() : setStep(1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-surface)]/60 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        </button>
        <div className="flex-1">
          <h1 className="text-[15px] font-bold text-[var(--text-primary)]">수업 의뢰</h1>
          {instructorName && (
            <p className="text-[12px] font-medium" style={{ color: "#059669" }}>{instructorName} 강사님에게</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i <= completedFields ? "linear-gradient(135deg, #059669, #34D399)" : "var(--ios-separator)",
                transform: i <= completedFields ? "scale(1.1)" : "scale(1)",
              }} />
          ))}
        </div>
      </div>

      <div className="relative z-10 px-5 pt-2 pb-32">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

              {/* 안내 */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
                <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-1">어떤 수업이 필요하세요?</h2>
                <p className="text-[13px]" style={{ color: "var(--ios-gray)" }}>수업 유형을 먼저 선택해주세요</p>
              </motion.div>

              {/* 0. 수업 유형 — 2열 카드 그리드 */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.03 }}
                className="rounded-xl p-4 mb-3" style={{ background: "var(--bg-grouped-secondary)", border: form.lessonType ? `1.5px solid ${selectedType?.color || "var(--ios-separator)"}` : "1.5px solid var(--ios-separator)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)" }}>
                    <Sparkles className="w-4 h-4" style={{ color: "#2563EB" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)]">수업 유형</span>
                  {selectedType && <span className="text-[12px] font-bold ml-auto" style={{ color: selectedType.color }}>{selectedType.label}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {LESSON_TYPES.map((type) => (
                    <motion.button key={type.id} whileTap={{ scale: 0.93 }}
                      onClick={() => update("lessonType", type.id)}
                      className="p-3 rounded-xl text-left transition-all"
                      style={form.lessonType === type.id ? {
                        background: type.color,
                        border: `1.5px solid ${type.color}`,
                        boxShadow: `0 4px 16px ${type.color}40`,
                      } : {
                        background: "var(--bg-grouped)",
                        border: "1.5px solid transparent",
                      }}>
                      <type.icon className="w-5 h-5 mb-1.5" style={{ color: form.lessonType === type.id ? "white" : type.color, opacity: form.lessonType === type.id ? 1 : 0.7 }} />
                      <span className="text-[13px] font-bold block" style={{ color: form.lessonType === type.id ? "white" : "var(--text-primary)" }}>{type.label}</span>
                      <span className="text-[11px] block mt-0.5" style={{ color: form.lessonType === type.id ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>{type.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* 수업 유형 안내 카드 */}
              <AnimatePresence>
                {form.lessonType && LESSON_TYPE_INFO[form.lessonType] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl px-3.5 py-3"
                      style={{
                        background: `${selectedType?.color || "#2563EB"}08`,
                        border: `1px solid ${selectedType?.color || "#2563EB"}15`,
                      }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Info className="w-3.5 h-3.5" style={{ color: selectedType?.color || "#2563EB" }} />
                        <span className="text-[11px] font-bold" style={{ color: selectedType?.color || "#2563EB" }}>
                          {selectedType?.label} 참고사항
                        </span>
                      </div>
                      <div className="space-y-1">
                        {LESSON_TYPE_INFO[form.lessonType].items.map((item, i) => (
                          <p key={i} className="text-[11px] flex items-start gap-1.5" style={{ color: "var(--text-secondary)" }}>
                            <span className="shrink-0 mt-0.5 w-1 h-1 rounded-full" style={{ background: selectedType?.color || "#2563EB" }} />
                            {item}
                          </p>
                        ))}
                      </div>
                      {LESSON_TYPE_INFO[form.lessonType].note && (
                        <p className="text-[11px] mt-2" style={{ color: "var(--ios-gray)" }}>
                          {LESSON_TYPE_INFO[form.lessonType].note}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 1. 학교명 — 카드형 */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}
                className="rounded-xl p-4 mb-3" style={{ background: "var(--bg-grouped-secondary)", border: form.schoolName ? "1.5px solid #059669" : "1.5px solid var(--ios-separator)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(5,150,105,0.08)" }}>
                    <School className="w-4 h-4" style={{ color: "#059669" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)]">학교명</span>
                  {form.schoolName && <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: "#059669" }} />}
                </div>
                <SchoolSearch
                  value={form.schoolName}
                  onChange={(name) => update("schoolName", name)}
                  placeholder="학교명을 검색하세요"
                  accentColor="#059669"
                />
              </motion.div>

              {/* 2. 날짜 — 카드형 */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
                className="rounded-xl p-4 mb-3" style={{ background: "var(--bg-grouped-secondary)", border: form.date ? "1.5px solid #2563EB" : "1.5px solid var(--ios-separator)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)" }}>
                    <Calendar className="w-4 h-4" style={{ color: "#2563EB" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)]">수업 희망일</span>
                  {form.date && <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: "#2563EB" }} />}
                </div>
                <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full text-[15px] font-medium text-[var(--text-primary)] outline-none bg-transparent"
                  style={{ color: form.date ? "var(--text-primary)" : "var(--ios-gray3)" }}
                />
              </motion.div>

              {/* 3. 수업 분야 — 컬러 그리드 */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}
                className="rounded-xl p-4 mb-3" style={{ background: "var(--bg-grouped-secondary)", border: form.category ? `1.5px solid ${selectedCat?.color || "var(--ios-separator)"}` : "1.5px solid var(--ios-separator)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.08)" }}>
                    <BookOpen className="w-4 h-4" style={{ color: "#7C3AED" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)]">수업 분야</span>
                  {form.category && <span className="text-[12px] font-bold ml-auto" style={{ color: selectedCat?.color }}>{form.category}</span>}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <motion.button key={cat.id} whileTap={{ scale: 0.9 }}
                      onClick={() => update("category", cat.id)}
                      className="py-2.5 rounded-xl text-[12px] font-semibold transition-all text-center"
                      style={form.category === cat.id ? {
                        background: cat.color,
                        color: "white",
                        boxShadow: `0 4px 12px ${cat.color}40`,
                      } : {
                        background: "var(--bg-grouped)",
                        color: "var(--text-secondary)",
                      }}>
                      {cat.id}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* 4. 대상 학년 — 컴팩트 그리드 */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
                className="rounded-xl p-4 mb-3" style={{ background: "var(--bg-grouped-secondary)", border: form.targetGrade ? "1.5px solid #059669" : "1.5px solid var(--ios-separator)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(5,150,105,0.08)" }}>
                    <Users className="w-4 h-4" style={{ color: "#059669" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)]">대상 학년</span>
                  {form.targetGrade && <span className="text-[12px] font-bold ml-auto" style={{ color: "#059669" }}>{form.targetGrade}</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {GRADES.map((g) => (
                    <motion.button key={g.id} whileTap={{ scale: 0.9 }}
                      onClick={() => update("targetGrade", g.id)}
                      className="py-2.5 rounded-xl text-[12px] font-semibold transition-all text-center"
                      style={form.targetGrade === g.id ? {
                        background: "linear-gradient(135deg, #059669, #34D399)",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(5,150,105,0.25)",
                      } : {
                        background: "var(--bg-grouped)",
                        color: "var(--text-secondary)",
                      }}>
                      {g.short}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
                <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-1">추가 정보가 있으면 알려주세요</h2>
                <p className="text-[13px]" style={{ color: "var(--ios-gray)" }}>선택사항이에요. 입력하면 매칭이 빨라져요</p>
              </motion.div>

              {/* 요약 카드 */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}
                className="rounded-xl p-4 mb-4 flex items-center gap-3"
                style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)", boxShadow: "0 4px 16px rgba(15,23,42,0.15)" }}>
                <Sparkles className="w-5 h-5 shrink-0" style={{ color: "#34D399" }} />
                <div>
                  <p className="text-[13px] font-bold text-white">{selectedType?.label} · {form.schoolName} · {form.category}</p>
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{form.date}</p>
                </div>
              </motion.div>

              {/* 시간 */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
                className="rounded-xl p-4 mb-3" style={{ background: "var(--bg-grouped-secondary)", border: "1.5px solid var(--ios-separator)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(37,99,235,0.08)" }}>
                    <Clock className="w-4 h-4" style={{ color: "#2563EB" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)]">수업 시간</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--ios-gray)" }}>시작</label>
                    <input type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl text-[14px] font-medium outline-none"
                      style={{ background: "var(--bg-grouped)", border: form.startTime ? "1px solid #2563EB" : "1px solid transparent" }} />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium block mb-1" style={{ color: "var(--ios-gray)" }}>종료</label>
                    <input type="time" value={form.endTime} onChange={(e) => update("endTime", e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl text-[14px] font-medium outline-none"
                      style={{ background: "var(--bg-grouped)", border: form.endTime ? "1px solid #2563EB" : "1px solid transparent" }} />
                  </div>
                </div>
              </motion.div>

              {/* 인원 + 예산 */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}
                className="rounded-xl p-4 mb-3" style={{ background: "var(--bg-grouped-secondary)", border: "1.5px solid var(--ios-separator)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5" style={{ color: "#059669" }} />
                      <span className="text-[12px] font-semibold text-[var(--text-secondary)]">학생 수</span>
                    </div>
                    <input value={form.studentCount} onChange={(e) => update("studentCount", e.target.value)}
                      placeholder="30" type="number"
                      className="w-full py-2.5 px-3 rounded-xl text-[14px] font-medium outline-none"
                      style={{ background: "var(--bg-grouped)" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[12px]">💰</span>
                      <span className="text-[12px] font-semibold text-[var(--text-secondary)]">예산 (원)</span>
                    </div>
                    <input value={form.budget} onChange={(e) => update("budget", e.target.value)}
                      placeholder="200,000" type="number"
                      className="w-full py-2.5 px-3 rounded-xl text-[14px] font-medium outline-none"
                      style={{ background: "var(--bg-grouped)" }} />
                  </div>
                </div>
              </motion.div>

              {/* 메모 */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
                className="rounded-xl p-4" style={{ background: "var(--bg-grouped-secondary)", border: "1.5px solid var(--ios-separator)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.08)" }}>
                    <MessageSquare className="w-4 h-4" style={{ color: "#7C3AED" }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)]">요청사항</span>
                </div>
                <textarea value={form.memo} onChange={(e) => update("memo", e.target.value)}
                  rows={3} placeholder="수업 관련 참고사항이 있으면 적어주세요"
                  className="w-full text-[14px] outline-none bg-transparent resize-none placeholder:text-[var(--text-muted)]"
                  style={{ lineHeight: 1.7 }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ 하단 CTA ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3"
        style={{
          background: "rgba(248,250,255,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "0.5px solid rgba(0,0,0,0.05)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}>
        <div className="max-w-[480px] mx-auto flex gap-2">
          {step === 2 && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
              className="px-5 py-3.5 rounded-xl text-[14px] font-bold"
              style={{ background: "var(--bg-grouped-secondary)", border: "1.5px solid var(--ios-separator)", color: "var(--text-secondary)" }}>
              이전
            </motion.button>
          )}
          {step === 1 ? (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
              disabled={!canProceed1}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-bold text-white transition-all disabled:opacity-30"
              style={{
                background: canProceed1 ? "linear-gradient(135deg, #059669, #34D399)" : "#d1d5db",
                boxShadow: canProceed1 ? "0 4px 16px rgba(5,150,105,0.3)" : "none",
              }}>
              다음 <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-bold text-white disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
              }}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              의뢰 보내기
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "#059669" }} /></div>}>
      <RequestForm />
    </Suspense>
  );
}
