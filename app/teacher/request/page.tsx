"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, Users, BookOpen, School,
  MessageSquare, Send, Loader2, CheckCircle2,
} from "lucide-react";

const CATEGORIES = [
  "환경", "생명존중", "AI", "코딩", "미술", "공예",
  "체육", "음악", "진로", "독서", "심리상담", "기타",
];

const GRADES = [
  "초등 1~2학년", "초등 3~4학년", "초등 5~6학년",
  "중등 1학년", "중등 2학년", "중등 3학년",
  "고등 1학년", "고등 2학년", "고등 3학년",
];

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

  // 강사 이름 조회
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

  const canProceed1 = form.schoolName && form.date && form.category && form.targetGrade;

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

  // 성공 화면
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-gray-900 mb-2"
        >
          의뢰가 전송되었습니다!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-500 text-center mb-8"
        >
          {instructorName ? `${instructorName} 강사님에게` : "강사님에게"} 알림이 전송되었습니다.<br />
          수락 여부를 알림으로 알려드릴게요.
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => router.push("/teacher/home")}
          className="ds-btn-primary px-8"
        >
          홈으로 돌아가기
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* 헤더 */}
      <div className="ds-header flex items-center gap-3">
        <button onClick={() => router.back()} className="ds-back-btn">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">수업 의뢰</h1>
          {instructorName && <p className="text-xs text-blue-500">{instructorName} 강사님에게</p>}
        </div>
      </div>

      {/* 프로그레스 */}
      <div className="px-5 py-3">
        <div className="flex gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-blue-500" />
          <div className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-blue-500" : "bg-gray-200"}`} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{step}/2 단계</p>
      </div>

      <div className="px-5 pb-24">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-1">수업 정보</h2>
              <p className="text-xs text-gray-400 mb-4">필수 정보를 입력해주세요</p>

              {/* 학교명 */}
              <div>
                <label className="ds-label mb-1.5 flex items-center gap-1">
                  <School className="w-3.5 h-3.5" /> 학교명 *
                </label>
                <input value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)}
                  className="ds-input"
                  placeholder="해강초등학교" />
              </div>

              {/* 날짜 */}
              <div>
                <label className="ds-label mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> 수업 희망일 *
                </label>
                <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)}
                  className="ds-input" />
              </div>

              {/* 카테고리 */}
              <div>
                <label className="ds-label mb-2 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> 수업 분야 *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => update("category", cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        form.category === cat
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-white border border-gray-200 text-gray-600"
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 대상 학년 */}
              <div>
                <label className="ds-label mb-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> 대상 학년 *
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map((g) => (
                    <motion.button
                      key={g}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => update("targetGrade", g)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        form.targetGrade === g
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-white border border-gray-200 text-gray-600"
                      }`}
                    >
                      {g}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-1">상세 정보</h2>
              <p className="text-xs text-gray-400 mb-4">선택 정보입니다 (입력하면 매칭이 빨라요)</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ds-label mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 시작 시간
                  </label>
                  <input type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)}
                    className="ds-input" />
                </div>
                <div>
                  <label className="ds-label mb-1.5 block">종료 시간</label>
                  <input type="time" value={form.endTime} onChange={(e) => update("endTime", e.target.value)}
                    className="ds-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ds-label mb-1.5 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> 학생 수
                  </label>
                  <input value={form.studentCount} onChange={(e) => update("studentCount", e.target.value)}
                    className="ds-input"
                    placeholder="30" />
                </div>
                <div>
                  <label className="ds-label mb-1.5 block">예산 (원)</label>
                  <input value={form.budget} onChange={(e) => update("budget", e.target.value)}
                    className="ds-input"
                    placeholder="200,000" />
                </div>
              </div>

              <div>
                <label className="ds-label mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> 요청사항
                </label>
                <textarea
                  value={form.memo}
                  onChange={(e) => update("memo", e.target.value)}
                  className="ds-input resize-none"
                  rows={4}
                  placeholder="수업 관련 참고사항이나 요청사항을 적어주세요"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 하단 버튼 */}
      <div className="ds-bottom-bar">
        <div className="flex gap-2">
          {step === 2 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-2xl text-sm font-bold border border-gray-200 text-gray-600 bg-white"
            >
              이전
            </motion.button>
          )}
          {step === 1 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(2)}
              disabled={!canProceed1}
              className="ds-btn-primary flex-1 disabled:opacity-40"
            >
              다음
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="ds-btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>}>
      <RequestForm />
    </Suspense>
  );
}
