"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Check, Loader2 } from "lucide-react";

interface InquiryFormProps {
  instructorId: string;
  instructorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InquiryForm({ instructorId, instructorName, isOpen, onClose }: InquiryFormProps) {
  const [form, setForm] = useState({
    senderName: "",
    senderPhone: "",
    schoolName: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!form.senderName.trim() || !form.message.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/instructors/${instructorId}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setForm({ senderName: "", senderPhone: "", schoolName: "", message: "" });
        }, 2000);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />

          {/* 바텀시트 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-y-auto max-h-[85vh]"
            style={{
              background: "var(--bg-surface)",
              paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* 핸들 */}
            <div className="pt-3 pb-2 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-[var(--bg-muted)]" />
            </div>

            <div className="px-5 pb-6">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[16px] font-bold text-[var(--text-primary)]">
                  {instructorName} 강사에게 문의
                </h2>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center
                             hover:bg-[var(--bg-elevated)] transition-colors touch-target">
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-10"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: "rgba(5,150,105,0.08)" }}>
                    <Check className="w-8 h-8 text-[var(--accent-success)]" />
                  </div>
                  <p className="text-[15px] font-bold text-[var(--text-primary)]">문의가 전달되었습니다</p>
                  <p className="text-[13px] text-[var(--text-muted)] mt-1">강사님이 확인 후 연락드릴 거예요</p>
                </motion.div>
              ) : (
                <>
                  {/* 폼 */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] font-semibold text-[var(--text-muted)] mb-1.5 block">
                        이름 *
                      </label>
                      <input
                        value={form.senderName}
                        onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                        placeholder="홍길동"
                        className="ds-input"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[var(--text-muted)] mb-1.5 block">
                        학교명
                      </label>
                      <input
                        value={form.schoolName}
                        onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                        placeholder="OO초등학교"
                        className="ds-input"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[var(--text-muted)] mb-1.5 block">
                        연락처
                      </label>
                      <input
                        value={form.senderPhone}
                        onChange={(e) => setForm({ ...form, senderPhone: e.target.value })}
                        placeholder="010-1234-5678"
                        className="ds-input"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[var(--text-muted)] mb-1.5 block">
                        문의 내용 *
                      </label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="수업 주제, 희망 일정, 대상 학년 등을 알려주세요"
                        rows={4}
                        maxLength={1000}
                        className="ds-input resize-none"
                        style={{ lineHeight: 1.7 }}
                      />
                      <p className="text-[11px] text-[var(--text-muted)] text-right mt-1">
                        {form.message.length}/1000
                      </p>
                    </div>
                  </div>

                  {/* 제출 */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={!form.senderName.trim() || !form.message.trim() || submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                               text-[15px] font-bold text-white mt-5 touch-target
                               disabled:opacity-40 transition-opacity"
                    style={{
                      background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                      boxShadow: "0 4px 16px rgba(59,108,246,0.3)",
                    }}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        문의 보내기
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
