"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Search, Star, ThumbsUp, Plus, Building2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface SchoolReview {
  id: string;
  schoolName: string;
  region: string | null;
  facilityRating: number;
  cooperationRating: number;
  accessibilityRating: number;
  overallRating: string;
  content: string;
  visitDate: string | null;
  wouldReturn: boolean;
  tips: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

interface SchoolStats {
  avgFacility: string;
  avgCooperation: string;
  avgAccessibility: string;
  avgOverall: string;
  wouldReturnPct: string;
}

// ─── 별점 바 ───
function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #3B6CF6, #5B8AFF)" }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

// ─── 리뷰 카드 ───
function ReviewCard({ review }: { review: SchoolReview }) {
  const overall = parseFloat(review.overallRating);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: "1.5px solid rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className="w-3.5 h-3.5"
                fill={s <= Math.round(overall) ? "#FBBF24" : "none"}
                stroke={s <= Math.round(overall) ? "#FBBF24" : "#D1D5DB"}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-700">{overall.toFixed(1)}</span>
        </div>
        <span className="text-[10px] text-gray-400">
          {review.visitDate ? `${review.visitDate} 방문` : ""}
        </span>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-2">{review.content}</p>

      {review.tips && (
        <div className="px-3 py-2 rounded-xl bg-blue-50/60 text-xs text-blue-700 mb-2">
          💡 {review.tips}
        </div>
      )}

      <div className="flex items-center gap-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          시설 {review.facilityRating}
        </span>
        <span className="flex items-center gap-1">
          협조 {review.cooperationRating}
        </span>
        <span className="flex items-center gap-1">
          접근 {review.accessibilityRating}
        </span>
        {review.wouldReturn && (
          <span className="flex items-center gap-1 text-green-600">
            <ThumbsUp className="w-3 h-3" /> 재방문
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── 메인 ───
export default function SchoolReviewsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<SchoolReview[]>([]);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  // ─── 전체/학교별 리뷰 로드 ───
  const loadReviews = useCallback(async (school?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (school) params.set("school", school);
      params.set("limit", "50");
      const res = await fetch(`/api/schools/reviews?${params}`);
      const json = await res.json();
      setReviews(json.data || []);
      setStats(json.stats || null);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews(selectedSchool || undefined);
  }, [selectedSchool, loadReviews]);

  // 학교 목록 추출 (리뷰에서 unique)
  const schoolNames = Array.from(new Set(reviews.map((r) => r.schoolName)));

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FC" }}>
      {/* 헤더 */}
      <header className="px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(248,249,252,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.04)" }}
      >
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 touch-target">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-base font-bold text-gray-900">🏫 학교 리뷰</h1>
      </header>

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="학교명으로 검색"
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)" }}
          />
        </div>

        {/* 선택된 학교 통계 */}
        <AnimatePresence>
          {selectedSchool && stats && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl space-y-3"
              style={{
                background: "linear-gradient(135deg, rgba(59,108,246,0.05), rgba(91,138,255,0.03))",
                border: "1.5px solid rgba(59,108,246,0.1)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-bold text-gray-800">{selectedSchool}</span>
                </div>
                <button onClick={() => setSelectedSchool(null)} className="text-xs text-gray-400 hover:text-gray-600">
                  전체 보기
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">{stats.avgOverall}</span>
                <div className="flex-1 space-y-1.5">
                  <RatingBar label="시설" value={parseFloat(stats.avgFacility)} />
                  <RatingBar label="협조" value={parseFloat(stats.avgCooperation)} />
                  <RatingBar label="접근성" value={parseFloat(stats.avgAccessibility)} />
                </div>
              </div>

              <div className="text-xs text-gray-500">
                재방문 의향 <span className="font-semibold text-green-600">{stats.wouldReturnPct}%</span>
                {" · "}리뷰 {reviews.length}개
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 학교 목록 (선택 안 했을 때) */}
        {!selectedSchool && !loading && schoolNames.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-medium">리뷰가 있는 학교</p>
            {schoolNames
              .filter((n) => !search || n.includes(search))
              .map((name) => {
                const count = reviews.filter((r) => r.schoolName === name).length;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedSchool(name)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:scale-[1.01] transition-transform"
                    style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800">{name}</span>
                      <span className="text-xs text-gray-400 ml-2">리뷰 {count}개</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </button>
                );
              })}
          </div>
        )}

        {/* 리뷰 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400 mb-1">
              아직 학교 리뷰가 없어요
            </p>
            <p className="text-xs text-gray-300">
              수업 다녀온 학교의 첫 리뷰를 남겨보세요
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(selectedSchool ? reviews : reviews.slice(0, 10)).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>

      {/* FAB — 리뷰 작성 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/community/schools/write")}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center
                   text-white shadow-lg z-50"
        style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)" }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
