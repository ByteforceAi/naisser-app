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
        <h2 className="text-xl font-bold text-gray-900 mb-2">리뷰가 등록되었습니다!</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          {instructorName} 강사님에게 소중한 피드백이 전달됩니다.
        </p>
        <button onClick={() => router.back()}
          className="px-8 py-3 rounded-2xl text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)" }}>
          돌아가기
        </button>
      </div>
    );
  }

  const StarRow = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => onChange(s)} className="p-0.5">
            <Star className={`w-4 h-4 ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* 헤더 */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(248,249,252,0.85)", backdropFilter: "blur(12px)" }}>
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-base font-bold text-gray-900">리뷰 작성</h1>
      </div>

      <div className="px-5 pt-4 pb-32">
        {/* 강사 이름 */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">{instructorName} 강사님의</p>
          <p className="text-lg font-bold text-gray-900">수업은 어떠셨나요?</p>
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
                  : "text-gray-200"
              }`} />
            </motion.button>
          ))}
        </div>

        {rating > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center text-sm font-medium text-gray-500 mb-6">
            {rating === 5 ? "최고예요! 👏" : rating === 4 ? "좋았어요!" : rating === 3 ? "보통이에요" : rating === 2 ? "아쉬워요" : "별로예요"}
          </motion.p>
        )}

        {/* 항목별 평가 */}
        <div className="p-4 rounded-2xl mb-4 space-y-3"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <h3 className="text-xs font-bold text-gray-900 mb-2">항목별 평가</h3>
          <StarRow label="수업 내용" value={categoryRatings.content} onChange={(v) => updateCategoryRating("content", v)} />
          <StarRow label="시간 준수" value={categoryRatings.punctuality} onChange={(v) => updateCategoryRating("punctuality", v)} />
          <StarRow label="학생 반응" value={categoryRatings.engagement} onChange={(v) => updateCategoryRating("engagement", v)} />
        </div>

        {/* 재초빙 의사 */}
        <div className="p-4 rounded-2xl mb-4"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <h3 className="text-xs font-bold text-gray-900 mb-2">다시 초빙하고 싶으신가요?</h3>
          <div className="flex gap-2">
            {[
              { label: "네, 꼭이요!", value: true, emoji: "😊" },
              { label: "글쎄요", value: false, emoji: "🤔" },
            ].map((opt) => (
              <motion.button
                key={String(opt.value)}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWouldRebook(opt.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  wouldRebook === opt.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {opt.emoji} {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 리뷰 텍스트 */}
        <div className="p-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-gray-900">한줄평</h3>
            <span className="text-[10px] text-gray-400">{content.length}/100</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 100))}
            className="w-full bg-transparent text-sm text-gray-700 resize-none focus:outline-none placeholder:text-gray-300"
            rows={3}
            placeholder="수업에 대한 솔직한 후기를 남겨주세요"
          />
        </div>
      </div>

      {/* 하단 전송 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-5 py-3"
        style={{
          background: "rgba(248,249,252,0.9)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={submitting || rating === 0 || !content.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)", boxShadow: "0 4px 16px rgba(59,108,246,0.3)" }}
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>}>
      <ReviewForm />
    </Suspense>
  );
}
