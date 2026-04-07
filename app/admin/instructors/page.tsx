"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  ChevronRight,
  Phone,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ─── 더미 데이터 ───
const MOCK_INSTRUCTORS = [
  { id: "1", name: "김예술", phone: "010-1234-5678", status: "active", topics: ["환경&생태"], regions: ["수도권"], createdAt: "2026-03-01" },
  { id: "2", name: "이코딩", phone: "010-2345-6789", status: "new", topics: ["AI디지털"], regions: ["대전충남"], createdAt: "2026-03-15" },
  { id: "3", name: "박체육", phone: "010-3456-7890", status: "contacted", topics: ["체육&신체활동"], regions: ["부산경남"], createdAt: "2026-03-20" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: "신규", color: "bg-blue-500/20 text-blue-400" },
  contacted: { label: "연락완료", color: "bg-yellow-500/20 text-yellow-400" },
  active: { label: "활동중", color: "bg-green-500/20 text-green-400" },
  inactive: { label: "비활성", color: "bg-[var(--bg-muted)]0/20 text-gray-400" },
};

/** CSV 내보내기 — UTF-8 BOM */
function exportCSV() {
  const BOM = "\uFEFF";
  const headers = ["이름", "전화번호", "상태", "주제", "지역", "등록일"];
  const rows = MOCK_INSTRUCTORS.map((i) => [
    i.name,
    i.phone,
    STATUS_MAP[i.status]?.label || i.status,
    i.topics.join(", "),
    i.regions.join(", "),
    i.createdAt,
  ]);

  const csv = BOM + [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `강사목록_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminInstructorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filtered = MOCK_INSTRUCTORS.filter((i) => {
    if (searchQuery && !i.name.includes(searchQuery) && !i.phone.includes(searchQuery))
      return false;
    if (statusFilter && i.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-4 lg:p-8" style={{ background: "var(--bg-grouped)" }}>
      <div className="relative z-10 flex items-center justify-between mb-6 lg:ml-0 ml-12">
        <h1 className="text-2xl font-bold">강사 관리</h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                     bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)] transition-colors touch-target"
        >
          <Download className="w-4 h-4" />
          CSV 내보내기
        </button>
      </div>

      {/* 검색 + 필터 */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 전화번호로 검색"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--glass-border)]
                       bg-[var(--bg-elevated)] text-sm
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent-secondary)]/30"
          />
        </div>
      </div>

      {/* 상태 필터 칩 */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setStatusFilter(null)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
            !statusFilter
              ? "bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]"
              : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
          )}
        >
          전체
        </button>
        {Object.entries(STATUS_MAP).map(([id, config]) => (
          <button
            key={id}
            onClick={() => setStatusFilter(id === statusFilter ? null : id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
              statusFilter === id
                ? config.color
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
            )}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* 테이블 — 모바일: 고정열(이름,상태) + 가로 스크롤 */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-grouped-secondary)" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[var(--glass-border)]">
                <th className="sticky left-0 bg-[var(--bg-surface)] z-10 px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">
                  이름
                </th>
                <th className="sticky left-[120px] bg-[var(--bg-surface)] z-10 px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">
                  상태
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">
                  연락처
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">
                  주제
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">
                  지역
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase">
                  등록일
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((inst, i) => (
                <motion.tr
                  key={inst.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[var(--glass-border)] hover:bg-[var(--bg-elevated)]/50 transition-colors cursor-pointer"
                >
                  <td className="sticky left-0 bg-[var(--bg-surface)] z-10 px-4 py-3">
                    <span className="text-sm font-semibold">{inst.name}</span>
                  </td>
                  <td className="sticky left-[120px] bg-[var(--bg-surface)] z-10 px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        STATUS_MAP[inst.status]?.color
                      )}
                    >
                      {STATUS_MAP[inst.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                      <Phone className="w-3.5 h-3.5" />
                      {inst.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {inst.topics.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-[var(--bg-elevated)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <MapPin className="w-3 h-3" />
                      {inst.regions.join(", ")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                    {inst.createdAt}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
