"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Send } from "lucide-react";
import { SUBJECT_CATEGORIES } from "@/lib/constants/categories";

interface RequestFormProps {
  instructorId: string;
  instructorName: string;
  schoolName: string;
  isOpen: boolean;
  onClose: () => void;
}

const TARGET_GRADES = [
  "초1", "초2", "초3", "초4", "초5", "초6",
  "중1", "중2", "중3", "고1", "고2", "고3", "전학년",
];

/** 의뢰 폼 바텀시트 — docs/14-UX-FLOWS.md 섹션 6 */
export function RequestForm({
  instructorId,
  instructorName,
  schoolName,
  isOpen,
  onClose,
}: RequestFormProps) {
  const [formData, setFormData] = useState({
    preferredDates: [""],
    topic: "",
    method: "",
    studentCount: "",
    targetGrade: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.topic || !formData.studentCount || !formData.targetGrade) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId,
          preferredDates: formData.preferredDates.filter(Boolean),
          topic: formData.topic,
          method: formData.method || undefined,
          studentCount: Number(formData.studentCount),
          targetGrade: formData.targetGrade,
          message: formData.message || undefined,
        }),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-50"
            onClick={onClose}
          />

          {/* 바텀시트 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)] rounded-t-2xl
                       max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
          >
            {/* 핸들바 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-[var(--bg-muted)]" />
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-[var(--glass-border)]">
              <h2 className="text-lg font-bold">수업 요청</h2>
              <button onClick={onClose} className="touch-target">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-4 space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">{instructorName}</span> 강사님에게 수업을 요청합니다.
              </p>

              {/* 희망 날짜 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">희망 날짜 *</label>
                <input
                  type="date"
                  value={formData.preferredDates[0]}
                  onChange={(e) => setFormData({ ...formData, preferredDates: [e.target.value] })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-primary)] text-sm"
                />
              </div>

              {/* 강의 주제 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">강의 주제 *</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-primary)] text-sm"
                >
                  <option value="">선택해주세요</option>
                  {SUBJECT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* 예상 인원 + 대상 학년 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">예상 인원 *</label>
                  <input
                    type="number"
                    value={formData.studentCount}
                    onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                    placeholder="30"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-primary)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">대상 학년 *</label>
                  <select
                    value={formData.targetGrade}
                    onChange={(e) => setFormData({ ...formData, targetGrade: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-primary)] text-sm"
                  >
                    <option value="">선택</option>
                    {TARGET_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 학교명 (자동) */}
              <div>
                <label className="block text-sm font-medium mb-1.5">학교명</label>
                <input
                  value={schoolName}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-elevated)] text-sm text-[var(--text-secondary)]"
                />
              </div>

              {/* 요청 메시지 */}
              <div>
                <label className="block text-sm font-medium mb-1.5">요청 메시지</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="강사님에게 전달할 내용을 적어주세요..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-primary)] text-sm resize-none"
                />
                <div className="text-right text-xs text-[var(--text-muted)] mt-1">
                  {formData.message.length}/1,000
                </div>
              </div>

              {/* 주의사항 */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[rgba(255,204,0,0.06)] border border-[rgba(255,204,0,0.12)]">
                <AlertCircle className="w-4 h-4 text-[var(--accent-warning)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  본 어플에서 계약은 진행하지 않습니다. 의뢰는 &quot;관심 표현&quot;이며,
                  실제 계약은 직접 학교에서 대면으로 진행하시기 바랍니다.
                </p>
              </div>

              {/* 제출 */}
              <button
                onClick={handleSubmit}
                disabled={!formData.topic || !formData.studentCount || !formData.targetGrade || isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--accent-primary)] text-white rounded-xl
                           font-semibold shadow-btn-primary disabled:opacity-40 disabled:shadow-none
                           transition-all duration-200 touch-target"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "요청 중..." : "요청 보내기"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
