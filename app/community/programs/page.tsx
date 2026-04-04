"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Flame,
  Clock,
  ThumbsUp,
  // Star,
  Users,
  Check,
  Filter,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// ═══════════════════════════════════════════
// 타입
// ═══════════════════════════════════════════

interface ProgramData {
  id: string;
  authorId: string;
  title: string;
  description: string;
  topic?: string | null;
  targetGrade?: string | null;
  duration?: string | null;
  maxStudents?: number | null;
  materialsCost?: string | null;
  includes?: string[] | null;
  images?: string[] | null;
  price: number;
  priceType: string;
  upvoteCount: number;
  usedCount: number;
  createdAt: string;
}

const TOPIC_MAP: Record<string, string> = {
  smokingPrevention: "흡연예방",
  genderAwareness: "성인지",
  disabilityMulticultural: "장애인식",
  careerJob: "진로직업",
  multicultural: "다문화",
  cookingBaking: "요리",
  sportsPhysical: "체육",
  readingWriting: "독서",
  science: "과학",
  music: "음악",
  environmentEcology: "환경",
  characterBullying: "인성교육",
  aiDigital: "AI디지털",
  staffTraining: "교직원연수",
  etc: "기타",
};

const TOPIC_FILTERS = [
  { key: "", label: "전체" },
  { key: "smokingPrevention", label: "흡연예방" },
  { key: "careerJob", label: "진로직업" },
  { key: "environmentEcology", label: "환경생태" },
  { key: "characterBullying", label: "인성교육" },
  { key: "cookingBaking", label: "요리" },
  { key: "science", label: "과학" },
  { key: "aiDigital", label: "AI디지털" },
];

// ═══════════════════════════════════════════
// 프로그램 카드
// ═══════════════════════════════════════════

function ProgramCard({
  program,
  index,
  onUpvote,
}: {
  program: ProgramData;
  index: number;
  onUpvote: (id: string) => void;
}) {
  const hasImage = program.images && program.images.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/community/programs/${program.id}`}>
        <div
          className="rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          {/* 이미지 (있으면) */}
          {hasImage && (
            <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
              <img
                src={program.images![0]}
                alt={program.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* 가격 배지 */}
              <span
                className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-sm"
                style={{
                  background:
                    program.priceType === "free"
                      ? "rgba(34,197,94,0.9)"
                      : "rgba(59,108,246,0.9)",
                  color: "white",
                }}
              >
                {program.priceType === "free"
                  ? "무료"
                  : `${program.price.toLocaleString()}원`}
              </span>
            </div>
          )}

          <div className="p-4">
            {/* 가격 배지 (이미지 없을 때) */}
            {!hasImage && (
              <span
                className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mb-2"
                style={{
                  background:
                    program.priceType === "free"
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(59,108,246,0.1)",
                  color:
                    program.priceType === "free" ? "#16A34A" : "#3B6CF6",
                }}
              >
                {program.priceType === "free"
                  ? "무료 공유"
                  : `${program.price.toLocaleString()}원`}
              </span>
            )}

            {/* 제목 */}
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
              {program.title}
            </h3>

            {/* 포함 항목 체크리스트 */}
            {program.includes && program.includes.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {program.includes.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Check className="w-3 h-3 text-green-500 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
                {program.includes.length > 3 && (
                  <p className="text-[10px] text-gray-400 pl-5">
                    +{program.includes.length - 3}개 더
                  </p>
                )}
              </div>
            )}

            {/* 메타 정보 */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {program.targetGrade && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {program.targetGrade}
                </span>
              )}
              {program.duration && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {program.duration}
                </span>
              )}
              {program.topic && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                  {TOPIC_MAP[program.topic] || program.topic}
                </span>
              )}
            </div>

            {/* 재료비 */}
            {program.materialsCost && (
              <p className="text-xs text-gray-500 mt-2">
                재료비: {program.materialsCost}
              </p>
            )}

            {/* 하단 반응 바 */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onUpvote(program.id);
                  }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{program.upvoteCount}</span>
                </button>
                {program.usedCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{program.usedCount}명 사용</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 빈 상태
// ═══════════════════════════════════════════

function EmptyPrograms() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <ShoppingBag className="w-7 h-7 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">
        등록된 프로그램이 없어요
      </h3>
      <p className="text-sm text-gray-400">
        나만의 수업 프로그램을 공유해보세요
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════
// 메인 페이지
// ═══════════════════════════════════════════

export default function ProgramsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [sort, setSort] = useState<"popular" | "recent">("popular");
  const [topicFilter, setTopicFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState<"" | "free" | "paid">("");
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, limit: "20" });
      if (topicFilter) params.set("topic", topicFilter);
      if (priceFilter) params.set("priceType", priceFilter);

      const res = await fetch(`/api/community/programs?${params}`);
      const json = await res.json();
      setPrograms(json.data || []);
    } catch {
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [sort, topicFilter, priceFilter]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const handleUpvote = async (programId: string) => {
    if (!session?.user) return;
    try {
      const res = await fetch(`/api/community/programs/${programId}/upvote`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok) {
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  upvoteCount: json.data.upvoted
                    ? p.upvoteCount + 1
                    : Math.max(p.upvoteCount - 1, 0),
                }
              : p
          )
        );
      }
    } catch {
      // 조용히 실패
    }
  };

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-warm page-bg-dots pb-24" >
      {/* ─── 헤더 ─── */}
      <header
        className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{
          background: "rgba(248,249,252,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-[520px] mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              프로그램 장터
            </h1>
          </div>

          {/* 정렬 + 필터 */}
          <div className="flex items-center gap-2">
            {[
              { key: "popular" as const, label: "인기순", icon: Flame },
              { key: "recent" as const, label: "최신순", icon: Clock },
            ].map((tab) => {
              const isActive = sort === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSort(tab.key)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                          color: "white",
                          boxShadow: "0 2px 12px rgba(59,108,246,0.25)",
                        }
                      : {
                          background: "rgba(255,255,255,0.65)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(0,0,0,0.06)",
                          color: "#6B7280",
                        }
                  }
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}

            {/* 무료만 */}
            <button
              onClick={() => setPriceFilter((prev) => (prev === "free" ? "" : "free"))}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                priceFilter === "free"
                  ? {
                      background: "linear-gradient(135deg, #22C55E, #4ADE80)",
                      color: "white",
                      boxShadow: "0 2px 12px rgba(34,197,94,0.25)",
                    }
                  : {
                      background: "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      color: "#6B7280",
                    }
              }
            >
              무료만
            </button>

            {/* 카테고리 필터 토글 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-full transition-all duration-200"
              style={{
                background: topicFilter
                  ? "linear-gradient(135deg, #8B5CF6, #A78BFA)"
                  : "rgba(255,255,255,0.65)",
                color: topicFilter ? "white" : "#6B7280",
                border: topicFilter ? "none" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* 카테고리 필터 (펼침) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {TOPIC_FILTERS.map((tf) => {
                    const isActive = topicFilter === tf.key;
                    return (
                      <button
                        key={tf.key}
                        onClick={() => setTopicFilter(tf.key)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                        style={
                          isActive
                            ? {
                                background: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
                                color: "white",
                              }
                            : {
                                background: "rgba(255,255,255,0.65)",
                                border: "1px solid rgba(0,0,0,0.06)",
                                color: "#6B7280",
                              }
                        }
                      >
                        {tf.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ─── 프로그램 목록 ─── */}
      <div className="max-w-[520px] mx-auto px-4 mt-4 space-y-3">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl animate-pulse overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                >
                  <div className="p-4 space-y-3">
                    <div className="w-16 h-4 bg-gray-100 rounded-full" />
                    <div className="w-3/4 h-4 bg-gray-100 rounded" />
                    <div className="space-y-1">
                      <div className="w-full h-3 bg-gray-50 rounded" />
                      <div className="w-full h-3 bg-gray-50 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-16 h-5 bg-gray-100 rounded-full" />
                      <div className="w-16 h-5 bg-gray-100 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : programs.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {programs.map((program, i) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  index={i}
                  onUpvote={handleUpvote}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyPrograms />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── FAB: 프로그램 등록 ─── */}
      {session?.user && (
        <Link
          href="/community/programs/new"
          className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
          style={{
            background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
            boxShadow: "0 4px 20px rgba(59,108,246,0.35)",
          }}
        >
          <Plus className="w-5 h-5 text-white" />
        </Link>
      )}
    </div>
  );
}

