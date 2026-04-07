"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, School, CheckCircle2 } from "lucide-react";

interface SchoolResult {
  id: string;
  name: string;
  level: string;
  address: string;
  sido: string;
}

interface SchoolSearchProps {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  /** 학교급 필터 (초등학교, 중학교, 고등학교) */
  schoolType?: string;
  /** 선택 색상 */
  accentColor?: string;
}

export function SchoolSearch({
  value,
  onChange,
  placeholder = "학교명을 검색하세요",
  schoolType,
  accentColor = "#059669",
}: SchoolSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SchoolResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 디바운스 검색
  useEffect(() => {
    if (!query || query.length < 1 || selected) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query, limit: "8" });
        if (schoolType) params.set("type", schoolType);
        const res = await fetch(`/api/schools/search?${params}`);
        const json = await res.json();
        setResults(json.data || []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, schoolType, selected]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (school: SchoolResult) => {
    setQuery(school.name);
    onChange(school.name);
    setSelected(true);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setSelected(false);
    onChange(v);
  };

  // 학교급 라벨 축약
  const typeLabel = (t: string) => {
    if (t === "초등학교") return "초";
    if (t === "중학교") return "중";
    if (t === "고등학교") return "고";
    if (t === "특수학교") return "특";
    return t?.charAt(0) || "";
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 인풋 */}
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          className="w-full text-[15px] font-medium outline-none bg-transparent placeholder:text-[var(--text-muted)]"
          style={{ color: "var(--text-primary)" }}
        />
        {selected && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute right-0 top-1/2 -translate-y-1/2">
            <CheckCircle2 className="w-4 h-4" style={{ color: accentColor }} />
          </motion.div>
        )}
        {loading && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[var(--ios-separator)] border-t-[var(--text-muted)] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 드롭다운 결과 */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl overflow-hidden max-h-[240px] overflow-y-auto"
            style={{
              background: "var(--bg-surface)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
            }}
          >
            {results.map((school, i) => (
              <button
                key={school.id}
                onClick={() => handleSelect(school)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-muted)] transition-colors active:bg-[var(--bg-elevated)]"
                style={i < results.length - 1 ? { borderBottom: "1px solid var(--ios-separator)" } : {}}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold"
                  style={{ background: `${accentColor}12`, color: accentColor }}>
                  {typeLabel(school.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[var(--text-primary)] truncate">{school.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    {school.address || school.sido}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
