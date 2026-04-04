"use client";

import { useState } from "react";
import { ArrowLeft, Star, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// ─── 별점 입력 ───
function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="p-0.5 touch-target"
          >
            <Star
              className="w-6 h-6 transition-colors"
              fill={s <= value ? "#FBBF24" : "none"}
              stroke={s <= value ? "#FBBF24" : "#D1D5DB"}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SchoolReviewWritePage() {
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [facilityRating, setFacilityRating] = useState(0);
  const [cooperationRating, setCooperationRating] = useState(0);
  const [accessibilityRating, setAccessibilityRating] = useState(0);
  const [content, setContent] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [wouldReturn, setWouldReturn] = useState(true);
  const [tips, setTips] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    schoolName.trim().length >= 2 &&
    facilityRating > 0 &&
    cooperationRating > 0 &&
    accessibilityRating > 0 &&
    content.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/schools/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: schoolName.trim(),
          facilityRating,
          cooperationRating,
          accessibilityRating,
          content: content.trim(),
          visitDate: visitDate || undefined,
          wouldReturn,
          tips: tips.trim() || undefined,
        }),
      });
      if (res.ok) {
        router.push("/community/schools");
      } else {
        const err = await res.json();
        // 인라인 에러 표시
        setContent((prev) => prev); // 페이지 유지
        const msg = err.error || "리뷰 등록에 실패했습니다.";
        // 토스트 대용: 상단 스크롤
        window.scrollTo({ top: 0, behavior: "smooth" });
        // 임시 알림 (추후 토스트 컴포넌트로 교체)
        if (typeof window !== "undefined") {
          const toast = document.createElement("div");
          toast.textContent = msg;
          toast.style.cssText = "position:fixed;bottom:24px;left:16px;right:16px;padding:12px 16px;border-radius:16px;background:rgba(239,68,68,0.9);color:white;font-size:14px;text-align:center;z-index:9999;backdrop-filter:blur(12px)";
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-warm page-bg-dots" >
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(248,249,252,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.04)" }}
      >
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 touch-target">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-base font-bold text-gray-900">학교 리뷰 작성</h1>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="px-5 py-2 rounded-full text-sm font-bold transition-all"
          style={{
            background: canSubmit ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)" : "#E5E7EB",
            color: canSubmit ? "white" : "#9CA3AF",
          }}
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </header>

      <div className="max-w-[520px] mx-auto px-4 py-5 space-y-5">
        {/* 학교명 */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">학교명 *</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="OO초등학교"
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)" }}
            />
          </div>
        </div>

        {/* 별점 */}
        <div className="p-4 rounded-2xl space-y-3"
          style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)" }}
        >
          <p className="text-xs font-semibold text-gray-500 mb-2">평가 *</p>
          <StarInput label="🏫 시설" value={facilityRating} onChange={setFacilityRating} />
          <StarInput label="🤝 협조" value={cooperationRating} onChange={setCooperationRating} />
          <StarInput label="🚗 접근성" value={accessibilityRating} onChange={setAccessibilityRating} />
        </div>

        {/* 리뷰 내용 */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">리뷰 * (10자 이상)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="학교 분위기, 담당 선생님 협조, 시설 상태 등 다른 강사님들에게 도움이 될 정보를 남겨주세요."
            rows={5}
            maxLength={1000}
            className="w-full p-4 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)" }}
          />
          <p className="text-[11px] text-gray-400 text-right mt-1">{content.length}/1,000</p>
        </div>

        {/* 팁 */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">💡 팁 (선택)</label>
          <input
            value={tips}
            onChange={(e) => setTips(e.target.value)}
            placeholder="주차 가능, 급식 신청 필요, 정문 출입 등"
            maxLength={500}
            className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)" }}
          />
        </div>

        {/* 방문일 + 재방문 */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">방문 시기 (선택)</label>
            <input
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              placeholder="2024.11"
              className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)" }}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">재방문 의향</label>
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={() => setWouldReturn(true)}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all"
                style={
                  wouldReturn
                    ? { background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)", color: "white" }
                    : { background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)", color: "#6B7280" }
                }
              >
                👍 예
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setWouldReturn(false)}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all"
                style={
                  !wouldReturn
                    ? { background: "#EF4444", color: "white" }
                    : { background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)", color: "#6B7280" }
                }
              >
                👎 아니오
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
