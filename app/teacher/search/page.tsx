"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, Sparkles, Clock, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRouter } from "next/navigation";

const POPULAR_KEYWORDS = ["흡연예방", "진로직업", "성인지", "요리/제과", "AI·디지털", "체육·스포츠"];
const RECENT_KEYWORDS = ["진로교육", "서울 강사"];

export default function TeacherSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3" style={{
        background: "var(--bg-grouped)",
        opacity: 0.95,
        backdropFilter: "blur(20px) saturate(1.8)",
      }}>
        <button onClick={() => router.back()} className="touch-target">
          <ArrowLeft className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="강사명, 주제, 지역으로 검색"
            className="ds-input pl-9 pr-4 !rounded-xl !py-2.5 text-sm"
            autoFocus
          />
        </div>
      </header>

      <div className="relative z-10 px-5 pt-6 pb-24">
        <AnimatePresence mode="wait">
          {!query ? (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {/* 최근 검색어 */}
              {RECENT_KEYWORDS.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">최근 검색어</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RECENT_KEYWORDS.map((kw) => (
                      <motion.button
                        key={kw}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setQuery(kw)}
                        className="px-3.5 py-2 rounded-xl text-xs font-medium
                                   bg-[var(--bg-surface)] border border-[var(--glass-border)]
                                   hover:border-[var(--accent-success)]/40 transition-all duration-200"
                      >
                        {kw}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* 인기 검색어 */}
              <div className="mb-8">
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-success)]" />
                  <span className="text-xs font-semibold text-[var(--accent-success)]">인기 검색어</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_KEYWORDS.map((kw, i) => (
                    <motion.button
                      key={kw}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setQuery(kw)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold
                                 transition-all duration-200"
                      style={{
                        background: "rgba(5,150,105,0.06)",
                        border: "1px solid rgba(5,150,105,0.12)",
                        color: "#059669",
                      }}
                    >
                      {kw}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* AI 추천 배너 */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/teacher/recommend")}
                className="w-full p-4 flex items-center gap-3.5 text-left rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(14px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(14px) saturate(1.4)",
                  border: "0.5px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))" }}>
                  <Sparkles className="w-5 h-5" style={{ color: "#6366F1" }} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold" style={{ color: "#111" }}>AI 추천 강사</p>
                  <p className="text-[12px]" style={{ color: "#9ca3af" }}>
                    카테고리와 학교를 입력하면 AI가 최적의 강사를 추천해드려요
                  </p>
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <EmptyState
                icon={Search}
                title="검색 결과가 없어요"
                description="다른 키워드로 검색해보세요"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
