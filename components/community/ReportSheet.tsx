"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X, CheckCircle2 } from "lucide-react";

const REPORT_REASONS = [
  "스팸 또는 광고",
  "욕설/비하 발언",
  "거짓 정보",
  "개인정보 노출",
  "기타",
];

interface ReportSheetProps {
  show: boolean;
  onClose: () => void;
  postId: string;
}

export function ReportSheet({ show, onClose, postId }: ReportSheetProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await fetch("/api/community/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, reason: selected, detail }),
      });
      setSubmitted(true);
      setTimeout(onClose, 1500);
    } catch { /* */ }
    finally { setSubmitting(false); }
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        exit={{ y: 200 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] mx-4 mb-6 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-xl"
      >
        {submitted ? (
          <div className="flex flex-col items-center py-8 px-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}>
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
            </motion.div>
            <p className="text-[14px] font-bold text-[var(--text-primary)]">신고가 접수되었습니다</p>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">검토 후 처리해드리겠습니다</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-500" />
                <span className="text-[15px] font-bold text-[var(--text-primary)]">신고하기</span>
              </div>
              <button onClick={onClose}>
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="px-4 pb-2 space-y-1.5">
              {REPORT_REASONS.map((reason) => (
                <motion.button
                  key={reason}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-medium transition-all
                    ${selected === reason
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "text-[var(--text-secondary)] hover:bg-black/[0.02]"
                    }`}
                >
                  {reason}
                </motion.button>
              ))}
            </div>

            {selected === "기타" && (
              <div className="px-4 pb-2">
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="상세 사유를 입력해주세요"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] bg-black/[0.02] border border-black/[0.04]
                             outline-none resize-none focus:border-red-200"
                />
              </div>
            )}

            <div className="px-4 pb-4 pt-1">
              <motion.button
                whileTap={selected ? { scale: 0.97 } : {}}
                onClick={handleSubmit}
                disabled={!selected || submitting}
                className="w-full py-3 rounded-xl text-[14px] font-bold transition-all"
                style={{
                  background: selected ? "#EF4444" : "rgba(0,0,0,0.06)",
                  color: selected ? "white" : "var(--text-muted)",
                }}
              >
                {submitting ? "접수 중..." : "신고 접수"}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
