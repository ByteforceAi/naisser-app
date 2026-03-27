"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Star, MapPin, Eye, ChevronRight, Loader2 } from "lucide-react";
import { SUBJECT_CATEGORIES, getCategoryLabel } from "@/lib/constants/categories";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { InstructorDetailSheet } from "@/components/teacher/InstructorDetailSheet";

// ─── 타입 ───
interface Instructor {
  id: string;
  instructorName: string;
  profileImage: string | null;
  topics: string[];
  methods: string[];
  regions: string[];
  bio: string | null;
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
    <div className="pt-4">
      {/* 헤더 */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">강사 찾기</h1>
          {!isLoggedIn && (
            <Link
              href="/auth/select-role"
              className="text-xs text-[var(--accent-primary)] font-medium hover:underline"
            >
              로그인 →
            </Link>
          )}
        </div>

        {/* 검색바 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="강사명, 주제로 검색"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--glass-border)]
                         bg-[var(--bg-surface)] text-sm
                         focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30
                         focus:border-[var(--accent-primary)]"
            />
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl
                             border border-[var(--glass-border)] bg-[var(--bg-surface)] touch-target">
            <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* 카테고리 가로 스크롤 */}
      <div className="px-4 mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1">
          <button
            onClick={() => setSelectedTopic(null)}
            className={`bubble-chip whitespace-nowrap ${!selectedTopic ? "selected" : ""}`}
          >
            전체
          </button>
          {SUBJECT_CATEGORIES.slice(0, -1).map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedTopic(cat.id === selectedTopic ? null : cat.id)
              }
              className={`bubble-chip whitespace-nowrap ${
                selectedTopic === cat.id ? "selected" : ""
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 강사 목록 */}
      <div className="px-4 pb-4">
        <p className="text-xs text-[var(--text-muted)] mb-3">
          {loading ? "검색 중..." : `${total}명의 강사`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
          </div>
        ) : instructors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[var(--text-muted)]">
              {selectedTopic || searchQuery
                ? "검색 조건에 맞는 강사가 없습니다."
                : "아직 등록된 강사가 없습니다."}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div className="space-y-3" layout>
              {instructors.map((inst, i) => {
                const topicLabels = inst.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
                const methodLabels = inst.methods?.map((m) => getCategoryLabel(m, "method")) || [];
                const regionLabel = inst.regions?.[0] ? getCategoryLabel(inst.regions[0], "region") : "";
                const rating = parseFloat(inst.averageRating) || 0;

                return (
                  <motion.div
                    key={inst.id}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ delay: i * 0.05 }}
                    layout
                    className="glass-card p-4 cursor-pointer"
                    onClick={() => setSelectedInstructor(inst)}
                  >
                    {/* 상단: 프로필 + 이름 */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center
                                      text-base font-semibold text-[var(--text-secondary)] shrink-0 overflow-hidden">
                        {inst.profileImage ? (
                          <img src={inst.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          inst.instructorName.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{inst.instructorName}</h3>
                          {inst.isEarlyBird && (
                            <span className="text-xs" title="얼리버드">🐣</span>
                          )}
                        </div>
                        {regionLabel && (
                          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {regionLabel}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm shrink-0">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{rating.toFixed(1)}</span>
                        <span className="text-xs text-[var(--text-muted)]">
                          ({inst.reviewCount || 0})
                        </span>
                      </div>
                    </div>

                    {/* 카테고리 태그 */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {topicLabels.map((label) => (
                        <span
                          key={label}
                          className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-[var(--accent-primary)]"
                        >
                          {label}
                        </span>
                      ))}
                      {methodLabels.slice(0, 3).map((label) => (
                        <span
                          key={label}
                          className="px-2 py-0.5 text-xs rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* 소개 */}
                    {inst.bio && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-2">
                        {inst.bio}
                      </p>
                    )}

                    {/* 하단 */}
                    <div className="flex items-center justify-between">
                      {isLoggedIn ? (
                        <button className="flex items-center gap-1 text-xs font-medium text-[var(--accent-primary)]
                                           hover:underline">
                          상세보기 <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
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
    </div>
  );
}
