"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Star, MapPin, Shield, Calendar, School,
  Users, Loader2, ArrowLeft, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCategoryLabel } from "@/lib/constants/categories";

const CATEGORIES = [
  "환경", "생명존중", "AI", "코딩", "미술", "공예",
  "체육", "음악", "진로", "독서", "심리상담", "기타",
];

const TOPIC_COLORS: Record<string, string> = {
  환경: "#059669", 생명존중: "#10B981", AI: "#6366F1", 코딩: "#3B82F6",
  미술: "#EC4899", 공예: "#F59E0B", 체육: "#EF4444", 음악: "#8B5CF6",
  진로: "#0891B2", 독서: "#78716C", 기타: "#6B7280",
};

interface RecommendedInstructor {
  id: string;
  instructorName: string;
  profileImage: string | null;
  topics: string[];
  regions: string[];
  averageRating: string;
  reviewCount: number;
  isEarlyBird: boolean;
  score: number;
  reasons: string[];
}

export default function RecommendPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendedInstructor[] | null>(null);
  const [message, setMessage] = useState("");

  const handleRecommend = async () => {
    if (!category) return;
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch("/api/instructors/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, schoolName: schoolName || undefined }),
      });
      const json = await res.json();
      setResults(json.data || []);
      setMessage(json.message || "");
    } catch {
      setMessage("추천 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* 헤더 */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(248,249,252,0.85)", backdropFilter: "blur(12px)" }}>
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h1 className="text-base font-bold text-gray-900">AI 강사 추천</h1>
        </div>
      </div>

      <div className="px-5 pt-4 pb-24">
        {/* 카테고리 선택 */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 mb-2 block">어떤 수업이 필요하세요? *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const color = TOPIC_COLORS[cat] || "#3B82F6";
              return (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCategory(cat)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: category === cat ? color : "white",
                    color: category === cat ? "white" : "#4B5563",
                    border: `1.5px solid ${category === cat ? color : "#E5E7EB"}`,
                    boxShadow: category === cat ? `0 4px 12px ${color}30` : "none",
                  }}
                >
                  {cat}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* 학교명 (선택) */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1">
            <School className="w-3.5 h-3.5" /> 학교명 (선택 — 단골 강사 우선)
          </label>
          <input
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            placeholder="해강초등학교"
          />
        </div>

        {/* 추천 버튼 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleRecommend}
          disabled={!category || loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white mb-6 disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "분석 중..." : "AI 추천 받기"}
        </motion.button>

        {/* 결과 */}
        <AnimatePresence>
          {results !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message && (
                <p className="text-xs text-gray-500 mb-4 text-center">{message}</p>
              )}

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">조건에 맞는 강사가 없습니다</p>
                  <p className="text-xs text-gray-300 mt-1">다른 분야를 선택해보세요</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((inst, idx) => {
                    const topicLabels = inst.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
                    const regionLabels = inst.regions?.map((r) => getCategoryLabel(r, "region")) || [];
                    const firstTopic = topicLabels[0] || "교육";
                    const color = TOPIC_COLORS[firstTopic] || "#3B82F6";
                    const rating = parseFloat(inst.averageRating) || 0;
                    const medals = ["🥇", "🥈", "🥉"];

                    return (
                      <motion.div
                        key={inst.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Link href={`/instructor/${inst.id}`}>
                          <div className="p-4 rounded-2xl relative overflow-hidden"
                            style={{
                              background: "rgba(255,255,255,0.8)",
                              backdropFilter: "blur(12px)",
                              border: idx === 0 ? `2px solid ${color}30` : "1px solid rgba(0,0,0,0.04)",
                              boxShadow: idx === 0 ? `0 4px 20px ${color}15` : "none",
                            }}>
                            {/* 순위 */}
                            <div className="absolute top-3 right-3 text-lg">{medals[idx]}</div>

                            <div className="flex gap-3">
                              {/* 아바타 */}
                              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"
                                style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)` }}>
                                {inst.profileImage ? (
                                  <img src={inst.profileImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ color }}>
                                    {inst.instructorName.charAt(0)}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h3 className="text-sm font-bold text-gray-900">{inst.instructorName}</h3>
                                  {inst.isEarlyBird && <span className="text-[10px]">🐣</span>}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex items-center gap-0.5">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
                                  </div>
                                  {regionLabels[0] && (
                                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                      <MapPin className="w-2.5 h-2.5" />{regionLabels[0]}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-purple-400 font-medium">
                                    점수 {inst.score}
                                  </span>
                                </div>

                                {/* 추천 이유 */}
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {inst.reasons.map((r, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                      style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <ChevronRight className="w-4 h-4 text-gray-300 self-center shrink-0" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
