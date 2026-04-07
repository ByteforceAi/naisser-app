"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Star, MapPin, School,
  Loader2, ArrowLeft, ChevronRight, Award,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCategoryLabel } from "@/lib/constants/categories";
import { SchoolSearch } from "@/components/shared/SchoolSearch";
import { WaveText } from "@/components/shared/WaveText";

import { SUBJECT_CATEGORIES } from "@/lib/constants/categories";

const CATEGORY_COLORS: Record<string, string> = {
  "흡연예방": "#DC2626", "성인지": "#EC4899", "진로&직업": "#2563EB",
  "요리&베이킹": "#D97706", "체육&신체활동": "#059669", "음악": "#8B5CF6",
  "환경&생태": "#16A34A", "인성&학폭,자살예방": "#6366F1", "AI디지털": "#0891B2",
  "과학": "#7C3AED", "독서&글쓰기": "#78716C", "다문화": "#0088ff",
  "장애인식&다문화": "#D97706", "교직원연수": "#6B7280", "기타": "#6B7280",
};

const CATEGORIES = SUBJECT_CATEGORIES.map((c) => ({
  id: c.label,
  color: CATEGORY_COLORS[c.label] || "#6B7280",
}));

const MEDAL_STYLES = [
  { bg: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#92400E", label: "1위" },
  { bg: "linear-gradient(135deg, #C0C0C0, #A0A0A0)", color: "#44403C", label: "2위" },
  { bg: "linear-gradient(135deg, #CD7F32, #B8860B)", color: "#451A03", label: "3위" },
];

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

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function RecommendPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendedInstructor[] | null>(null);
  const [message, setMessage] = useState("");

  const selectedCat = CATEGORIES.find((c) => c.id === category);

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
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      {/* 배경 */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 30% 30%, rgba(99,102,241,0.08), transparent 55%), radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.06), transparent 55%)",
      }} />

      {/* 헤더 */}
      <div className="sticky top-0 z-50 px-4 py-3 flex items-center gap-3"
        style={{ background: "rgba(248,250,255,0.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <button onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-surface)]/60 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))" }}>
            <Sparkles className="w-4 h-4" style={{ color: "#6366F1" }} />
          </div>
          <h1 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>AI 강사 추천</h1>
        </div>
      </div>

      <div className="relative z-10 px-5 pt-4 pb-32">
        {/* 안내 */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
          <h2 className="text-[20px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>딱 맞는 강사를 찾아드릴게요</h2>
          <p className="text-[13px]" style={{ color: "var(--ios-gray)" }}>수업 분야를 선택하면 AI가 최적의 강사를 추천해요</p>
        </motion.div>

        {/* 수업 분야 — 카드형 */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}
          className="rounded-xl p-4 mb-3" style={{
            background: "var(--bg-grouped-secondary)",
            border: category ? `1.5px solid ${selectedCat?.color || "var(--ios-separator)"}` : "1.5px solid var(--ios-separator)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.08)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#6366F1" }} />
            </div>
            <span className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>수업 분야</span>
            {selectedCat && <span className="text-[12px] font-bold ml-auto" style={{ color: selectedCat.color }}>{selectedCat.id}</span>}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <motion.button key={cat.id} whileTap={{ scale: 0.9 }}
                onClick={() => setCategory(cat.id)}
                className="py-2.5 rounded-xl text-[12px] font-semibold transition-all text-center"
                style={category === cat.id ? {
                  background: cat.color,
                  color: "white",
                  boxShadow: `0 4px 12px ${cat.color}40`,
                } : {
                  background: "var(--bg-grouped)",
                  color: "var(--text-secondary)",
                }}>
                {cat.id}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 학교명 — 카드형 */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
          className="rounded-xl p-4 mb-6" style={{
            background: "var(--bg-grouped-secondary)",
            border: schoolName ? "1.5px solid var(--accent-success)" : "1.5px solid var(--ios-separator)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "color-mix(in srgb, var(--accent-success) 8%, transparent)" }}>
              <School className="w-4 h-4" style={{ color: "var(--accent-success)" }} />
            </div>
            <span className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>학교명 (선택)</span>
          </div>
          <SchoolSearch
            value={schoolName}
            onChange={setSchoolName}
            placeholder="학교를 입력하면 단골 강사를 우선 추천해요"
            accentColor="#059669"
          />
        </motion.div>

        {/* 결과 */}
        <AnimatePresence>
          {results !== null && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {message && <p className="text-[12px] text-center mb-4" style={{ color: "var(--ios-gray)" }}>{message}</p>}

              {results.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-16 text-center">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))" }}>
                    <Sparkles className="w-7 h-7" style={{ color: "#6366F1", opacity: 0.5 }} />
                  </div>
                  <p className="text-[15px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>조건에 맞는 강사가 없어요</p>
                  <p className="text-[13px]" style={{ color: "var(--ios-gray)" }}>
                    <WaveText text="다른 분야를 선택해보세요" />
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {results.map((inst, idx) => {
                    const topicLabels = inst.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
                    const regionLabels = inst.regions?.map((r) => getCategoryLabel(r, "region")) || [];
                    const color = selectedCat?.color || "#6366F1";
                    const rating = parseFloat(inst.averageRating) || 0;
                    const medal = MEDAL_STYLES[idx];

                    return (
                      <motion.div key={inst.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}>
                        <Link href={`/instructor/${inst.id}`}>
                          <div className="p-4 rounded-xl relative overflow-hidden"
                            style={{
                              background: "var(--bg-grouped-secondary)",
                              border: idx === 0 ? `1.5px solid ${color}30` : "1.5px solid var(--ios-separator)",
                              boxShadow: idx === 0 ? `0 4px 20px ${color}10` : "0 2px 8px rgba(0,0,0,0.03)",
                            }}>
                            {/* 순위 뱃지 */}
                            {medal && (
                              <div className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                                style={{ background: medal.bg, color: "white", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                                {medal.label}
                              </div>
                            )}

                            <div className="flex gap-3">
                              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative"
                                style={{ background: `linear-gradient(135deg, ${color}15, ${color}30)` }}>
                                {inst.profileImage ? (
                                  <Image src={inst.profileImage} alt="강사 프로필" fill className="object-cover" sizes="56px" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ color }}>
                                    {inst.instructorName.charAt(0)}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h3 className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>{inst.instructorName}</h3>
                                  {inst.isEarlyBird && (
                                    <span className="text-[11px] px-1.5 py-0.5 rounded-md font-bold"
                                      style={{ background: "#FEF3C7", color: "#92400E" }}>얼리버드</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {rating > 0 && (
                                    <div className="flex items-center gap-0.5">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                  {regionLabels[0] && (
                                    <span className="text-[11px] flex items-center gap-0.5" style={{ color: "var(--ios-gray)" }}>
                                      <MapPin className="w-2.5 h-2.5" />{regionLabels[0]}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {inst.reasons.map((r, i) => (
                                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                                      style={{ background: `${color}08`, color, border: `1px solid ${color}15` }}>
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <ChevronRight className="w-4 h-4 self-center shrink-0" style={{ color: "var(--ios-gray3)" }} />
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

      {/* 하단 CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3"
        style={{
          background: "rgba(248,250,255,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "0.5px solid rgba(0,0,0,0.05)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}>
        <div className="max-w-[480px] mx-auto">
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={handleRecommend}
            disabled={!category || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-bold text-white transition-all disabled:opacity-30"
            style={{
              background: category ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "var(--ios-separator)",
              boxShadow: category ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
            }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "AI가 분석하는 중..." : "AI 추천 받기"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
