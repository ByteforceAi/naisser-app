"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Send, Loader2, CheckCircle2 } from "lucide-react";

function ReviewForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const instructorId = searchParams.get("instructorId") || "";
  const instructorName = searchParams.get("name") || "강사";

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // 항목별 평가
  const [categoryRatings, setCategoryRatings] = useState({
    content: 0,     // 수업 내용
    punctuality: 0, // 시간 준수
    engagement: 0,  // 학생 반응
  });
  const [wouldRebook, setWouldRebook] = useState<boolean | null>(null);

  const updateCategoryRating = (key: string, value: number) =>
    setCategoryRatings((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (rating === 0) { alert("별점을 선택해주세요."); return; }
    if (!content.trim()) { alert("리뷰 내용을 입력해주세요."); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/instructors/${instructorId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          content: content.trim(),
          categoryRatings,
          wouldRebook,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "리뷰 등록에 실패했습니다.");
        return;
      }
      setSuccess(true);
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">리뷰가 등록되었습니다!</h2>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
          {instructorName} 강사님에게 소중한 피드백이 전달됩니다.
        </p>
        <button onClick={() => router.back()}
          className="ds-btn-primary px-8">
          돌아가기
        </button>
      </div>
    );
  }

  const StarRow = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => onChange(s)} className="p-0.5">
            <Star className={`w-4 h-4 ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-[var(--text-muted)]"}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-green page-bg-dots">
      {/* 헤더 */}
      <div className="page-header-premium flex items-center gap-3">
        <button onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "0.5px solid rgba(255,255,255,0.5)",
          }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#555" }} />
        </button>
        <h1 className="text-base font-bold text-[var(--text-primary)]">리뷰 작성</h1>
      </div>

      <div className="px-5 pt-4 pb-24">
        {/* 강사 이름 */}
        <div className="text-center mb-6">
          <p className="text-sm text-[var(--text-secondary)]">{instructorName} 강사님의</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">수업은 어떠셨나요?</p>
        </div>

        {/* 전체 별점 */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 1.2 }}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(s)}
            >
              <Star className={`w-10 h-10 transition-colors ${
                s <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-[var(--text-muted)]"
              }`} />
            </motion.button>
          ))}
        </div>

        {rating > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center text-sm font-medium text-[var(--text-secondary)] mb-6">
            {rating === 5 ? "최고예요! 👏" : rating === 4 ? "좋았어요!" : rating === 3 ? "보통이에요" : rating === 2 ? "아쉬워요" : "별로예요"}
          </motion.p>
        )}

        {/* 항목별 평가 */}
        <div className="ds-card p-4 mb-4 space-y-3">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-2">항목별 평가</h3>
          <StarRow label="수업 내용" value={categoryRatings.content} onChange={(v) => updateCategoryRating("content", v)} />
          <StarRow label="시간 준수" value={categoryRatings.punctuality} onChange={(v) => updateCategoryRating("punctuality", v)} />
          <StarRow label="학생 반응" value={categoryRatings.engagement} onChange={(v) => updateCategoryRating("engagement", v)} />
        </div>

        {/* 재초빙 의사 */}
        <div className="ds-card p-4 mb-4">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-2">다시 초빙하고 싶으신가요?</h3>
          <div className="flex gap-2">
            {[
              { label: "네, 꼭이요!", value: true, emoji: "😊" },
              { label: "글쎄요", value: false, emoji: "🤔" },
            ].map((opt) => (
              <motion.button
                key={String(opt.value)}
                whileTap={{ scale: 0.97 }}
                onClick={() => setWouldRebook(opt.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  wouldRebook === opt.value
                    ? "bg-blue-500 text-white"
                    : "bg-[var(--bg-muted)] text-[var(--text-secondary)]"
                }`}
              >
                {opt.emoji} {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 리뷰 텍스트 */}
        <div className="ds-card p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-[var(--text-primary)]">한줄평</h3>
            <span className="text-[11px] text-[var(--text-muted)]">{content.length}/100</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 100))}
            className="w-full bg-transparent text-sm text-[var(--text-secondary)] resize-none focus:outline-none placeholder:text-[var(--text-muted)]"
            rows={3}
            placeholder="수업에 대한 솔직한 후기를 남겨주세요"
          />
        </div>
      </div>

      {/* 하단 전송 버튼 */}
      <div className="ds-bottom-bar">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={submitting || rating === 0 || !content.trim()}
          className="ds-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          리뷰 등록
        </motion.button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" /></div>}>
      <ReviewForm />
    </Suspense>
  );
}
