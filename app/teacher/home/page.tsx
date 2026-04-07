"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Star, MapPin, ChevronRight, Sparkles, SlidersHorizontal } from "lucide-react";
import { InstructorCardSkeleton } from "@/components/shared/Skeleton";
import { SUBJECT_CATEGORIES, getCategoryLabel } from "@/lib/constants/categories";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { InstructorDetailSheet } from "@/components/teacher/InstructorDetailSheet";
import { FilterSheet, type FilterState } from "@/components/teacher/FilterSheet";

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

// ═══ iOS 아바타 컬러 (Apple 연락처 팔레트) ═══
const AVATAR_COLORS = [
  "#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#00C7BE",
  "#30B0C7", "#32ADE6", "#007AFF", "#5856D6", "#AF52DE",
  "#FF2D55", "#A2845E",
];
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

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

  useEffect(() => { fetchInstructors(); }, [fetchInstructors]);

  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  useEffect(() => {
    if (debouncedQuery !== undefined) fetchInstructors();
  }, [debouncedQuery, fetchInstructors]);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F2F2F7" }}>

      {/* ═══ iOS Large Title Header ═══ */}
      <div className="sticky top-0 z-30"
        style={{
          background: "rgba(242,242,247,0.8)",
          backdropFilter: "blur(20px) saturate(1.8)",
          WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        }}
      >
        <div className="px-5 pt-4 pb-2">
          {/* 타이틀 행 */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[28px] font-bold text-[#000000] tracking-tight">강사 찾기</h1>
            <div className="flex items-center gap-2">
              <Link href="/teacher/recommend"
                className="px-3 py-1.5 rounded-full text-[13px] font-semibold"
                style={{ background: "#007AFF", color: "#FFFFFF" }}
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                AI 추천
              </Link>
              {!isLoggedIn && (
                <Link href="/auth/select-role"
                  className="text-[15px] font-medium" style={{ color: "#007AFF" }}>
                  로그인
                </Link>
              )}
            </div>
          </div>

          {/* 검색바 — iOS 스타일 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8E8E93" }} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름, 주제, 지역 검색"
                className="w-full pl-9 pr-4 py-[9px] rounded-[10px] text-[15px] outline-none"
                style={{
                  background: "rgba(118,118,128,0.12)",
                  color: "#000000",
                }}
              />
            </div>
            <button onClick={() => setShowFilter(true)}
              className="w-[38px] h-[38px] flex items-center justify-center rounded-full relative touch-target"
              style={{ background: "rgba(118,118,128,0.12)" }}
            >
              <SlidersHorizontal className="w-4 h-4" style={{ color: "#8E8E93" }} />
              {activeFilters && (activeFilters.topics.length > 0 || activeFilters.documentsComplete) && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#007AFF" }} />
              )}
            </button>
          </div>
        </div>

        {/* 카테고리 Segmented Control */}
        <div className="px-5 pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 p-[2px] rounded-[9px]" style={{ background: "rgba(118,118,128,0.12)" }}>
            <button
              onClick={() => setSelectedTopic(null)}
              className="px-4 py-[6px] rounded-[7px] text-[13px] font-semibold transition-all whitespace-nowrap"
              style={{
                background: !selectedTopic ? "#FFFFFF" : "transparent",
                color: !selectedTopic ? "#000000" : "#8E8E93",
                boxShadow: !selectedTopic ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" : "none",
              }}
            >
              전체
            </button>
            {[
              { id: "smokingPrevention", label: "흡연예방" },
              { id: "careerJob", label: "진로&직업" },
              { id: "sportsPhysical", label: "체육" },
              { id: "aiDigital", label: "AI디지털" },
            ].map((cat) => (
              <button key={cat.id}
                onClick={() => setSelectedTopic(cat.id === selectedTopic ? null : cat.id)}
                className="px-4 py-[6px] rounded-[7px] text-[13px] font-semibold transition-all whitespace-nowrap"
                style={{
                  background: selectedTopic === cat.id ? "#FFFFFF" : "transparent",
                  color: selectedTopic === cat.id ? "#000000" : "#8E8E93",
                  boxShadow: selectedTopic === cat.id ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" : "none",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 결과 카운트 ═══ */}
      <div className="px-5 pt-3 pb-2">
        <p className="text-[13px] font-medium uppercase tracking-wide" style={{ color: "#6C6C70" }}>
          {loading ? "검색 중..." : `${total}명의 강사`}
        </p>
      </div>

      {/* ═══ 강사 리스트 — Apple 연락처 스타일 ═══ */}
      <div className="px-5">
        {loading ? (
          <div className="space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <InstructorCardSkeleton key={i} />
            ))}
          </div>
        ) : instructors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-12 h-12 mb-4" style={{ color: "#C7C7CC" }} />
            <p className="text-[17px] font-semibold text-[#000000] mb-1">
              {selectedTopic || searchQuery ? "검색 결과 없음" : "등록된 강사 없음"}
            </p>
            <p className="text-[15px] mb-6" style={{ color: "#8E8E93" }}>
              {selectedTopic || searchQuery
                ? "다른 조건으로 검색해보세요"
                : "곧 새로운 강사님들이 등록될 예정이에요"}
            </p>
            {(selectedTopic || searchQuery) && (
              <Link href="/teacher/recommend"
                className="px-5 py-2.5 rounded-full text-[15px] font-semibold text-white"
                style={{ background: "#007AFF" }}>
                AI 추천 받기
              </Link>
            )}
          </div>
        ) : (
          /* ═══ Grouped List (iOS 스타일) ═══ */
          <div className="rounded-[12px] overflow-hidden" style={{ background: "#FFFFFF" }}>
            {instructors.map((inst, i) => {
              const topicLabels = inst.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
              const regionLabel = inst.regions?.[0] ? getCategoryLabel(inst.regions[0], "region") : "";
              const rating = parseFloat(inst.averageRating) || 0;
              const avatarColor = getAvatarColor(inst.instructorName);

              return (
                <motion.button
                  key={inst.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.15) }}
                  onClick={() => setSelectedInstructor(inst)}
                  className="w-full flex items-center gap-3 px-4 py-[11px] text-left
                             active:bg-[rgba(0,0,0,0.04)] transition-colors"
                >
                  {/* 원형 아바타 */}
                  <div
                    className="w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0 overflow-hidden relative"
                    style={{ background: inst.profileImage ? "#E5E5EA" : avatarColor }}
                  >
                    {inst.profileImage ? (
                      <Image src={inst.profileImage} alt={inst.instructorName} fill className="object-cover" sizes="44px" />
                    ) : (
                      <span className="text-[17px] font-semibold text-white">
                        {inst.instructorName.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* 텍스트 + 디바이더 */}
                  <div className="flex-1 min-w-0 flex items-center gap-2 py-[2px]"
                    style={{
                      borderBottom: i < instructors.length - 1 ? "0.5px solid rgba(198,198,200,0.5)" : "none",
                      paddingBottom: i < instructors.length - 1 ? "13px" : "2px",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[17px] text-[#000000] truncate">{inst.instructorName}</span>
                        {rating > 0 && (
                          <span className="flex items-center gap-0.5 text-[13px]" style={{ color: "#8E8E93" }}>
                            <Star className="w-3 h-3 fill-[#FF9500] text-[#FF9500]" />
                            {rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-[15px] truncate" style={{ color: "#8E8E93" }}>
                        {topicLabels.slice(0, 2).join(", ")}
                        {regionLabel ? ` · ${regionLabel}` : ""}
                      </p>
                    </div>

                    {/* 화살표 */}
                    <ChevronRight className="w-[14px] h-[14px] shrink-0" style={{ color: "#C7C7CC" }} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* 강사 상세 바텀시트 */}
      <InstructorDetailSheet
        instructor={selectedInstructor}
        isOpen={!!selectedInstructor}
        onClose={() => setSelectedInstructor(null)}
        isLoggedIn={isLoggedIn}
      />

      {/* 필터 바텀시트 */}
      <FilterSheet
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={(f) => {
          setActiveFilters(f);
          if (f.topics.length > 0) setSelectedTopic(f.topics[0]);
        }}
        initialFilters={activeFilters || undefined}
      />
    </div>
  );
}
