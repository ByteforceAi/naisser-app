"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X, RotateCcw, Loader2 } from "lucide-react";
import { SUBJECT_CATEGORIES } from "@/lib/constants/categories";

// iOS 26 Sheet detent heights (vh) — real spec: 25%, 50%, 100%
const DETENTS = { small: 25, medium: 50, large: 92 };

const CATEGORIES = SUBJECT_CATEGORIES.map((c) => c.label);

const CLASS_FORMATS = [
  { id: "lecture", label: "강의형" },
  { id: "hands_on", label: "체험형" },
  { id: "performance", label: "공연형" },
  { id: "counseling", label: "상담형" },
  { id: "online", label: "온라인" },
];

const MATERIAL_COSTS = [
  { id: "all", label: "전체" },
  { id: "none", label: "없음" },
  { id: "5000", label: "5천원 이하" },
  { id: "10000", label: "1만원 이하" },
  { id: "negotiable", label: "협의" },
];

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  topics: string[];
  classFormats: string[];
  materialCost: string;
  englishAvailable: boolean;
  documentsComplete: boolean;
}

const defaultFilters: FilterState = {
  topics: [],
  classFormats: [],
  materialCost: "all",
  englishAvailable: false,
  documentsComplete: false,
};

export function FilterSheet({ isOpen, onClose, onApply, initialFilters }: FilterSheetProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters || defaultFilters);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);
  const [detent, setDetent] = useState<"small" | "medium" | "large">("medium");
  const sheetRef = useRef<HTMLDivElement>(null);

  const currentHeight = DETENTS[detent];

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const vy = info.velocity.y;
    const dy = info.offset.y;

    // Fast swipe down → close or shrink
    if (vy > 500 || dy > 200) {
      if (detent === "small") { onClose(); return; }
      setDetent(detent === "large" ? "medium" : "small");
      return;
    }
    // Fast swipe up → expand
    if (vy < -300 || dy < -100) {
      setDetent(detent === "small" ? "medium" : "large");
      return;
    }
    // Slow drag — snap to nearest detent (0.35s spring per iOS 26)
    if (dy > 80) {
      if (detent === "large") setDetent("medium");
      else if (detent === "medium") setDetent("small");
      else onClose();
    } else if (dy < -50) {
      if (detent === "small") setDetent("medium");
      else setDetent("large");
    }
  };

  // Reset detent when reopened
  useEffect(() => {
    if (isOpen) setDetent("medium");
  }, [isOpen]);

  // 실시간 카운트 (debounce 200ms)
  useEffect(() => {
    if (!isOpen) return;
    setCounting(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (filters.topics.length) params.set("topic", filters.topics[0]);
        if (filters.documentsComplete) params.set("documentsComplete", "true");
        const res = await fetch(`/api/instructors?limit=1&${params}`);
        const json = await res.json();
        setResultCount(json.pagination?.total ?? 0);
      } catch {
        setResultCount(null);
      } finally {
        setCounting(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [filters, isOpen]);

  const toggleTopic = (t: string) => {
    setFilters((f) => ({
      ...f,
      topics: f.topics.includes(t) ? f.topics.filter((x) => x !== t) : [...f.topics, t],
    }));
  };

  const toggleFormat = (id: string) => {
    setFilters((f) => ({
      ...f,
      classFormats: f.classFormats.includes(id) ? f.classFormats.filter((x) => x !== id) : [...f.classFormats, id],
    }));
  };

  const reset = () => setFilters(defaultFilters);

  const activeCount = filters.topics.length + filters.classFormats.length +
    (filters.materialCost !== "all" ? 1 : 0) + (filters.englishAvailable ? 1 : 0) + (filters.documentsComplete ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80]"
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={onClose}
          />

          {/* 바텀시트 — iOS 26 Liquid Glass + Detent */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0, height: `${currentHeight}vh` }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 28, duration: 0.5 }} /* iOS 26 spring.gentle */
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-[80] overflow-y-auto"
            style={{
              borderRadius: "var(--liquid-radius-sheet) var(--liquid-radius-sheet) 0 0",
              background: "color-mix(in srgb, var(--bg-surface) 72%, transparent)",
              backdropFilter: "blur(20px) saturate(1.8)",
              WebkitBackdropFilter: "blur(20px) saturate(1.8)",
              border: "1px solid var(--ios-separator)",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
              paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
              touchAction: "none",
            }}
          >
            {/* Grabber — drag handle */}
            <div className="pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing">
              <div style={{ width: 36, height: 5, borderRadius: 9999, background: "var(--ios-separator)" }} />
            </div>

            <div className="px-5 pb-6">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[17px] font-bold" style={{ color: "var(--text-primary)" }}>필터</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--bg-muted)" }}>
                  <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>

              {/* 섹션 1: 주제 */}
              <div className="mb-6">
                <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--ios-gray)" }}>주제</p>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const selected = filters.topics.includes(cat);
                    return (
                      <motion.button key={cat} whileTap={{ scale: 0.93 }}
                        onClick={() => toggleTopic(cat)}
                        className="py-2.5 rounded-xl text-[12px] font-medium text-center transition-all"
                        style={selected ? {
                          background: "var(--accent-success)", color: "white",
                          boxShadow: "0 2px 8px rgba(5,150,105,0.25)",
                        } : {
                          background: "transparent", color: "var(--text-secondary)",
                          border: "1px solid var(--ios-separator)",
                        }}>
                        {cat}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 섹션 2: 수업 형태 */}
              <div className="mb-6">
                <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--ios-gray)" }}>수업 형태</p>
                <div className="flex flex-wrap gap-2">
                  {CLASS_FORMATS.map((f) => {
                    const selected = filters.classFormats.includes(f.id);
                    return (
                      <motion.button key={f.id} whileTap={{ scale: 0.93 }}
                        onClick={() => toggleFormat(f.id)}
                        className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                        style={selected ? {
                          background: "var(--accent-primary)", color: "white",
                        } : {
                          background: "transparent", color: "var(--text-secondary)",
                          border: "1px solid var(--ios-separator)",
                        }}>
                        {f.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 섹션 3: 재료비 */}
              <div className="mb-6">
                <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--ios-gray)" }}>재료비</p>
                <div className="flex flex-wrap gap-2">
                  {MATERIAL_COSTS.map((m) => {
                    const selected = filters.materialCost === m.id;
                    return (
                      <motion.button key={m.id} whileTap={{ scale: 0.93 }}
                        onClick={() => setFilters((f) => ({ ...f, materialCost: m.id }))}
                        className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                        style={selected ? {
                          background: "var(--accent-primary)", color: "white",
                        } : {
                          background: "transparent", color: "var(--text-secondary)",
                          border: "1px solid var(--ios-separator)",
                        }}>
                        {m.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 섹션 4: 추가 옵션 */}
              <div className="mb-8">
                <p className="text-[12px] font-semibold mb-3" style={{ color: "var(--ios-gray)" }}>추가 옵션</p>
                <div className="space-y-3">
                  {/* 영어 수업 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[15px]" style={{ color: "var(--text-primary)" }}>영어 수업 가능</span>
                    <button onClick={() => setFilters((f) => ({ ...f, englishAvailable: !f.englishAvailable }))}
                      className="rounded-full transition-colors duration-300"
                      style={{ width: 51, height: 31, background: filters.englishAvailable ? "var(--accent-success)" : "var(--ios-separator)" }}>
                      <motion.div animate={{ x: filters.englishAvailable ? 23 : 3 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="rounded-full bg-[var(--bg-surface)]"
                        style={{ width: 27, height: 27, marginTop: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
                    </button>
                  </div>
                  {/* 서류 완비 */}
                  <div className="flex items-center justify-between">
                    <span className="text-[15px]" style={{ color: "var(--text-primary)" }}>서류 완비 (성범죄+결핵)</span>
                    <button onClick={() => setFilters((f) => ({ ...f, documentsComplete: !f.documentsComplete }))}
                      className="rounded-full transition-colors duration-300"
                      style={{ width: 51, height: 31, background: filters.documentsComplete ? "var(--accent-success)" : "var(--ios-separator)" }}>
                      <motion.div animate={{ x: filters.documentsComplete ? 23 : 3 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="rounded-full bg-[var(--bg-surface)]"
                        style={{ width: 27, height: 27, marginTop: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 고정 — 초기화 + CTA */}
            <div className="sticky bottom-0 px-5 py-3 flex items-center gap-3"
              style={{
                background: "color-mix(in srgb, var(--bg-surface) 90%, transparent)",
                backdropFilter: "blur(20px)",
                borderTop: "0.5px solid var(--ios-separator)",
                paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
              }}>
              <button onClick={reset}
                className="px-4 py-3 rounded-xl text-[14px] font-medium"
                style={{ color: "var(--text-muted)" }}>
                초기화
              </button>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { onApply(filters); onClose(); }}
                className="flex-1 py-3.5 rounded-xl text-[15px] font-bold text-white text-center"
                style={{
                  background: "linear-gradient(135deg, var(--accent-success), #34D399)",
                  boxShadow: "0 4px 16px rgba(5,150,105,0.3)",
                }}>
                {counting ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  `강사 ${resultCount ?? "—"}명 보기`
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
