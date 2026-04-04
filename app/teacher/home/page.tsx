"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Star, MapPin, Eye, ChevronRight, Sparkles, SlidersHorizontal } from "lucide-react";
import { InstructorCardSkeleton } from "@/components/shared/Skeleton";
import { SUBJECT_CATEGORIES, getCategoryLabel } from "@/lib/constants/categories";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { InstructorDetailSheet } from "@/components/teacher/InstructorDetailSheet";
import { FilterSheet, type FilterState } from "@/components/teacher/FilterSheet";
import { WaveText } from "@/components/shared/WaveText";

// ─── 타입 ───
interface Instructor {
  id: string;
  instructorName: string;
  profileImage: string | null;
  topics: string[];
  methods: string[];
  regions: string[];
  bio: string | null;
  lectureContent: string | null;
  career: string | null;
  averageRating: string;
  reviewCount: number;
  isEarlyBird: boolean;
  phone: string;
  snsAccounts: string[] | null;
}

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function TeacherHomePage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  // ─── API 호출 ───
  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTopic) params.set("topic", selectedTopic);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      params.set("limit", "50");

      const res = await fetch(`/api/instructors?${params}`);
      const json = await res.json();
      setInstructors(json.data || []);
      setTotal(json.pagination?.total || 0);
    } catch {
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTopic, searchQuery]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  // 검색 디바운스
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  useEffect(() => {
    if (debouncedQuery !== undefined) fetchInstructors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-green page-bg-dots pt-4 pb-24">
      {/* 헤더 */}
      <div className="relative z-10 px-5 mb-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-3"
        >
          <h1 className="text-[28px] font-bold tracking-tight" style={{ color: "#111" }}>강사 찾기</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/teacher/recommend"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "0.5px solid rgba(99,102,241,0.2)",
                color: "#6366F1",
                boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
              }}
            >
              <Sparkles className="w-3 h-3" style={{ color: "#6366F1" }} />
              AI 추천
            </Link>
            {!isLoggedIn && (
              <Link
                href="/auth/select-role"
                className="text-xs text-[var(--accent-primary)] font-medium hover:underline"
              >
                로그인 →
              </Link>
            )}
          </div>
        </motion.div>

        {/* 검색바 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="강사명, 주제로 검색"
              className="ds-input pl-9"
            />
          </div>
          <button onClick={() => setShowFilter(true)}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl touch-target"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "0.5px solid rgba(255,255,255,0.5)",
            }}>
            <SlidersHorizontal className="w-4 h-4" style={{ color: "#999" }} />
            {activeFilters && (activeFilters.topics.length > 0 || activeFilters.documentsComplete) && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#0088ff" }} />
            )}
          </button>
        </motion.div>
      </div>

      {/* 카테고리 pill — 인기 4개 + 필터 (C27: 글자 팝콘) */}
      <div className="relative z-10 px-5 mb-6">
        <div className="flex gap-2">
          <motion.button
            onClick={() => setSelectedTopic(null)}
            className={`bubble-chip whitespace-nowrap ${!selectedTopic ? "selected" : ""}`}
            whileTap={{ scale: 0.92 }}
          >
            전체
          </motion.button>
          {[
            { id: "smokingPrevention", label: "흡연예방" },
            { id: "careerJob", label: "진로&직업" },
            { id: "sportsPhysical", label: "체육" },
            { id: "aiDigital", label: "AI디지털" },
          ].map((cat) => (
            <motion.button key={cat.id}
              onClick={() => setSelectedTopic(cat.id === selectedTopic ? null : cat.id)}
              className={`bubble-chip whitespace-nowrap ${selectedTopic === cat.id ? "selected" : ""}`}
              whileTap={{ scale: 0.92 }}
            >
              {selectedTopic === cat.id ? (
                // C27: 글자 팝콘 — 선택 시 글자가 하나씩 팝인
                <span className="inline-flex">
                  {cat.label.split("").map((ch, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.3, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        delay: i * 0.04,
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </span>
              ) : cat.label}
            </motion.button>
          ))}
          <motion.button onClick={() => setShowFilter(true)}
            className="bubble-chip whitespace-nowrap flex items-center gap-1 relative"
            whileTap={{ scale: 0.92 }}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            필터
            {activeFilters && (activeFilters.topics.length > 0 || activeFilters.documentsComplete) && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: "#0088ff" }} />
            )}
          </motion.button>
        </div>
      </div>

      {/* 강사 목록 */}
      <div className="relative z-10 px-5">
        <p className="text-xs text-[var(--text-muted)] mb-3">
          {loading ? "검색 중..." : `${total}명의 강사`}
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <InstructorCardSkeleton key={i} />
            ))}
          </div>
        ) : instructors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(5,150,105,0.08), rgba(52,211,153,0.08))",
                border: "1px solid rgba(5,150,105,0.10)",
              }}>
              <Search className="w-7 h-7 text-[var(--accent-success)]" style={{ opacity: 0.5 }} />
            </div>
            <p className="text-[15px] font-bold text-[var(--text-primary)] mb-1">
              {selectedTopic || searchQuery ? "검색 결과가 없어요" : "등록된 강사가 없어요"}
            </p>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-[240px] leading-relaxed mb-4">
              {selectedTopic || searchQuery
                ? "다른 조건으로 검색하거나 AI 추천을 이용해보세요"
                : <WaveText text="곧 새로운 강사님들이 등록될 예정이에요" />}
            </p>
            {(selectedTopic || searchQuery) && (
              <Link href="/teacher/recommend"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}>
                <Sparkles className="w-3.5 h-3.5" />
                AI가 추천해드릴까요?
              </Link>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div className="space-y-3" layout>
              {instructors.map((inst, i) => {
                const topicLabels = inst.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
                const methodLabels = inst.methods?.map((m) => getCategoryLabel(m, "method")) || [];
                const regionLabel = inst.regions?.[0] ? getCategoryLabel(inst.regions[0], "region") : "";
                const rating = parseFloat(inst.averageRating) || 0;

                // ─── 주제별 컬러 시스템 ───
                const TOPIC_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
                  smokingPrevention: { bg: "rgba(239,68,68,0.08)", text: "#DC2626", accent: "#FEE2E2" },
                  genderAwareness: { bg: "rgba(168,85,247,0.08)", text: "#7C3AED", accent: "#F3E8FF" },
                  careerJob: { bg: "rgba(79,70,229,0.08)", text: "#4F46E5", accent: "#E0E7FF" },
                  cookingBaking: { bg: "rgba(245,158,11,0.08)", text: "#D97706", accent: "#FEF3C7" },
                  sportsPhysical: { bg: "rgba(16,185,129,0.08)", text: "#059669", accent: "#D1FAE5" },
                  music: { bg: "rgba(236,72,153,0.08)", text: "#DB2777", accent: "#FCE7F3" },
                  environmentEcology: { bg: "rgba(34,197,94,0.08)", text: "#16A34A", accent: "#DCFCE7" },
                  characterBullying: { bg: "rgba(59,130,246,0.08)", text: "#2563EB", accent: "#DBEAFE" },
                  aiDigital: { bg: "rgba(6,182,212,0.08)", text: "#0891B2", accent: "#CFFAFE" },
                  science: { bg: "rgba(99,102,241,0.08)", text: "#4F46E5", accent: "#E0E7FF" },
                  readingWriting: { bg: "rgba(120,113,108,0.08)", text: "#57534E", accent: "#F5F5F4" },
                };
                const primaryTopic = inst.topics?.[0] || "";
                const topicColor = TOPIC_COLORS[primaryTopic] || { bg: "rgba(59,130,246,0.08)", text: "#3B82F6", accent: "#DBEAFE" };

                // ─── 자동 소개 문구 (bio 없을 때) ───
                const displayBio = inst.bio || (() => {
                  const t = topicLabels[0] || "교육";
                  const m = methodLabels[0] || "강의";
                  const r = regionLabel || "";
                  return `${t} 전문 · ${m} 방식${r ? ` · ${r} 활동` : ""}`;
                })();

                return (
                  <motion.div
                    key={inst.id}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ delay: i * 0.04 }}
                    layout
                    whileTap={{ scale: 0.98 }}
                    className="cursor-pointer p-4 relative rounded-2xl
                               active:bg-black/[0.02] transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.72)",
                      backdropFilter: "blur(14px) saturate(1.4)",
                      WebkitBackdropFilter: "blur(14px) saturate(1.4)",
                      border: "0.5px solid rgba(255,255,255,0.5)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.4)",
                    }}
                    onClick={() => setSelectedInstructor(inst)}
                  >
                    {/* ─── 주제 컬러 악센트 라인 ─── */}
                    <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-60"
                      style={{ background: topicColor.text }}
                    />

                    {/* 상단: 프로필 + 이름 */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center
                                   text-base font-bold shrink-0 overflow-hidden"
                        style={{
                          background: inst.profileImage
                            ? "transparent"
                            : `linear-gradient(135deg, ${topicColor.text}20, ${topicColor.text}40)`,
                          color: topicColor.text,
                        }}
                      >
                        {inst.profileImage ? (
                          <img src={inst.profileImage} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          inst.instructorName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-gray-900">{inst.instructorName}</h3>
                          {inst.isEarlyBird && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md"
                              style={{ background: "#FEF3C7", color: "#92400E" }}>
                              🐣 얼리버드
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {regionLabel && (
                            <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                              <MapPin className="w-3 h-3" /> {regionLabel}
                            </span>
                          )}
                          {rating > 0 && (
                            <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {rating.toFixed(1)}({inst.reviewCount || 0})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 소개 (항상 표시 — 없으면 자동 생성) */}
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
                      {displayBio}
                    </p>

                    {/* 카테고리 태그 — 주제별 컬러 */}
                    <div className="flex flex-wrap gap-1.5">
                      {inst.topics?.slice(0, 3).map((topicId) => {
                        const label = getCategoryLabel(topicId, "subject");
                        const tc = TOPIC_COLORS[topicId] || { bg: topicColor.bg, text: topicColor.text };
                        return (
                          <span key={topicId}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-lg"
                            style={{ background: tc.bg, color: tc.text }}
                          >
                            {label}
                          </span>
                        );
                      })}
                      {methodLabels.slice(0, 2).map((label) => (
                        <span key={label}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-lg
                                     bg-gray-50 text-gray-500"
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* 하단 */}
                    <div className="flex items-center justify-between mt-3 pt-2.5"
                      style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
                      {isLoggedIn ? (
                        <button className="flex items-center gap-1 text-xs font-semibold hover:underline"
                          style={{ color: topicColor.text }}>
                          상세보기 <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Eye className="w-3.5 h-3.5" />
                          로그인 후 연락처 확인
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* 강사 상세 바텀시트 */}
      <InstructorDetailSheet
        instructor={selectedInstructor}
        isOpen={!!selectedInstructor}
        onClose={() => setSelectedInstructor(null)}
        isLoggedIn={isLoggedIn}
      />

      {/* 필터 바텀시트 — Liquid Glass */}
      <FilterSheet
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={(f) => {
          setActiveFilters(f);
          if (f.topics.length > 0) setSelectedTopic(f.topics[0]);
          // TODO: classFormats, materialCost 등 API 필터 연동
        }}
        initialFilters={activeFilters || undefined}
      />
    </div>
  );
}
