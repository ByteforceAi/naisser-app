"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, School, Clock, DollarSign, Download, Plus,
  CheckCircle2, AlertCircle, Loader2, FileDown, X,
  MapPin, Users, BookOpen,
} from "lucide-react";

interface TeachingRecord {
  id: string;
  schoolName: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  hours: string | null;
  subject: string;
  targetGrade: string | null;
  studentCount: number | null;
  fee: number | null;
  status: string;
  confirmedAt: string | null;
  documentNumber: string | null;
  memo: string | null;
}

interface Stats {
  totalRecords: number;
  confirmedRecords: number;
  totalHours: number;
  totalFee: number;
}

const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const CARD = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function CareerPage() {
  const [records, setRecords] = useState<TeachingRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  // downloading 상태는 HTML 새 탭 방식에서 불필요하지만 UI에서 참조하므로 유지
  const downloading: string | null = null;

  // 새 출강 등록 폼
  const [form, setForm] = useState({
    schoolName: "",
    date: "",
    startTime: "",
    endTime: "",
    hours: "",
    subject: "",
    targetGrade: "",
    studentCount: "",
    fee: "",
    memo: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/teaching-records");
      const json = await res.json();
      setRecords(json.data || []);
      setStats(json.stats || null);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ─── 출강 등록 ───
  const handleSubmit = async () => {
    if (!form.schoolName || !form.date || !form.subject) {
      alert("학교명, 날짜, 과목은 필수입니다.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/teaching-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hours: form.hours || null,
          studentCount: form.studentCount ? parseInt(form.studentCount) : null,
          fee: form.fee ? parseInt(form.fee) : null,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "등록에 실패했습니다.");
        return;
      }
      setShowAddForm(false);
      setForm({ schoolName: "", date: "", startTime: "", endTime: "", hours: "", subject: "", targetGrade: "", studentCount: "", fee: "", memo: "" });
      await fetchRecords();
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── 출강확인서 열기 (새 탭 → 인쇄/PDF 저장) ───
  const openCertificate = (recordId: string) => {
    window.open(`/api/teaching-records/${recordId}/pdf`, "_blank");
  };

  // ─── 이력서 열기 (새 탭 → 인쇄/PDF 저장) ───
  const openCareerSheet = () => {
    window.open("/api/teaching-records/export", "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0088ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots px-5 pt-4 pb-24">
      {/* ─── 헤더 ─── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">출강이력</h1>
          <p className="text-sm text-gray-700 leading-relaxed">수업 기록이 자동으로 쌓입니다</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddForm(true)}
          className="ds-btn-primary flex items-center gap-1.5 px-3.5 py-2 !rounded-xl text-xs"
        >
          <Plus className="w-3.5 h-3.5" /> 출강 등록
        </motion.button>
      </motion.div>

      {/* ─── 통계 카드 ─── */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { label: "확인된 출강", value: `${stats.confirmedRecords}회`, icon: CheckCircle2, color: "#059669" },
            { label: "누적 시간", value: `${stats.totalHours.toFixed(0)}h`, icon: Clock, color: "#2563EB" },
            { label: "총 수입", value: stats.totalFee > 0 ? `${(stats.totalFee / 10000).toFixed(0)}만원` : "-", icon: DollarSign, color: "#D97706" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ds-card p-3 text-center"
            >
              <s.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: s.color }} />
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── 이력서 다운로드 ─── */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={openCareerSheet}
        disabled={downloading === "career"}
        className="w-full flex items-center justify-center gap-2 py-3 mb-6 rounded-2xl text-sm font-bold
                   border border-blue-200 text-blue-600 bg-blue-50/50"
      >
        {downloading === "career" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        출강이력서 PDF 다운로드
      </motion.button>

      {/* ─── 출강 기록 목록 ─── */}
      {records.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">아직 출강 기록이 없습니다</p>
          <p className="text-xs text-gray-300 mt-1">출강을 등록하면 이력이 자동으로 쌓입니다</p>
        </div>
      ) : (
        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {records.map((r) => (
            <motion.div
              key={r.id}
              variants={CARD}
              className="ds-card p-4 relative"
              style={{
                border: `1.5px solid ${r.status === "confirmed" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"}`,
              }}
            >
              {/* 상태 뱃지 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-bold"
                    style={{ color: r.status === "confirmed" ? "#059669" : "#D97706" }}
                  >
                    {r.status === "confirmed" ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> 확인됨</>
                    ) : (
                      <><AlertCircle className="w-3.5 h-3.5" /> 대기중</>
                    )}
                  </span>
                  {r.documentNumber && (
                    <span className="text-[10px] text-gray-400">{r.documentNumber}</span>
                  )}
                </div>
                {r.status === "confirmed" && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openCertificate(r.id)}
                    disabled={downloading === r.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold
                               text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    {downloading === r.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    확인서
                  </motion.button>
                )}
              </div>

              {/* 학교 + 날짜 */}
              <div className="flex items-center gap-2 mb-1.5">
                <School className="w-4 h-4 text-gray-400 shrink-0" />
                <h3 className="text-sm font-bold text-gray-900">{r.schoolName}</h3>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {r.date}
                </span>
                {r.startTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {r.startTime}~{r.endTime} ({r.hours}h)
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {r.subject}
                </span>
                {r.targetGrade && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {r.targetGrade}
                  </span>
                )}
                {r.studentCount && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {r.studentCount}명
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ─── 출강 등록 바텀시트 ─── */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ds-overlay"
              onClick={() => setShowAddForm(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
              className="ds-sheet overflow-y-auto max-h-[85vh]"
            >
              <div className="px-5 pt-4 pb-8" style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}>
                {/* 핸들 + 닫기 */}
                <div className="flex justify-center mb-2">
                  <div className="ds-sheet-handle" />
                </div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">출강 등록</h2>
                  <button onClick={() => setShowAddForm(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* 폼 필드 */}
                <div className="space-y-3">
                  <div>
                    <label className="ds-label mb-1 block">학교명 *</label>
                    <input value={form.schoolName} onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                      className="ds-input"
                      placeholder="해강초등학교" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="ds-label mb-1 block">날짜 *</label>
                      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="ds-input" />
                    </div>
                    <div>
                      <label className="ds-label mb-1 block">과목 *</label>
                      <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="ds-input"
                        placeholder="환경체험" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="ds-label mb-1 block">시작시간</label>
                      <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                        className="ds-input" />
                    </div>
                    <div>
                      <label className="ds-label mb-1 block">종료시간</label>
                      <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                        className="ds-input" />
                    </div>
                    <div>
                      <label className="ds-label mb-1 block">시간(h)</label>
                      <input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })}
                        className="ds-input"
                        placeholder="2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="ds-label mb-1 block">대상학년</label>
                      <input value={form.targetGrade} onChange={(e) => setForm({ ...form, targetGrade: e.target.value })}
                        className="ds-input"
                        placeholder="3학년" />
                    </div>
                    <div>
                      <label className="ds-label mb-1 block">학생수</label>
                      <input value={form.studentCount} onChange={(e) => setForm({ ...form, studentCount: e.target.value })}
                        className="ds-input"
                        placeholder="30" />
                    </div>
                    <div>
                      <label className="ds-label mb-1 block">강사료(원)</label>
                      <input value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })}
                        className="ds-input"
                        placeholder="200000" />
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="ds-btn-primary w-full py-3.5 mt-2 disabled:opacity-50"
                  >
                    {submitting ? "등록 중..." : "출강 등록하기"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
