"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Flag, Eye, EyeOff, Trash2, Pin, Filter } from "lucide-react";

/**
 * /admin/community — 커뮤니티 콘텐츠 관리
 *
 * 기능:
 * - 게시글 검색/필터
 * - 숨기기/삭제/고정
 * - 신고 목록 관리
 * - 유저 정지
 */

const TABS = [
  { id: "posts", label: "게시글" },
  { id: "reports", label: "신고" },
  { id: "users", label: "유저" },
];

export default function AdminCommunityPage() {
  const [tab, setTab] = useState("posts");
  const [search, setSearch] = useState("");

  return (
    <div className="p-4 lg:p-8" style={{ background: "var(--bg-grouped)" }}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6 lg:ml-0 ml-12">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">커뮤니티 관리</h1>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">게시글, 신고, 유저 관리</p>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 mb-4 lg:ml-0 ml-12">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all
                ${tab === t.id
                  ? "bg-[var(--accent-secondary)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--subtle-hover)]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <div className="flex gap-2 mb-4 lg:ml-0 ml-12">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="게시글, 작성자 검색..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] bg-[var(--subtle-bg)]
                         border border-[var(--subtle-border)] outline-none
                         text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
          </div>
          <button className="px-3 py-2.5 rounded-xl border border-[var(--subtle-border)]
                             text-[var(--text-muted)] hover:bg-[var(--subtle-hover)] transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* 콘텐츠 영역 */}
        {tab === "posts" && (
          <div className="space-y-2 lg:ml-0 ml-12">
            <p className="text-[12px] text-[var(--text-muted)]">
              최근 게시글이 표시됩니다. 검색하거나 필터로 찾으세요.
            </p>
            {/* TODO: 실제 게시글 목록 API 연동 */}
            <div className="p-8 text-center text-[var(--text-muted)] text-[13px] rounded-xl border border-[var(--subtle-border)]">
              게시글 데이터를 불러오는 중...
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-2 lg:ml-0 ml-12">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-4 h-4 text-red-500" />
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">미처리 신고</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-bold">0건</span>
            </div>
            <div className="p-8 text-center text-[var(--text-muted)] text-[13px] rounded-xl border border-[var(--subtle-border)]">
              처리할 신고가 없습니다
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-2 lg:ml-0 ml-12">
            <p className="text-[12px] text-[var(--text-muted)]">
              유저 검색 및 정지/등급 관리
            </p>
            <div className="p-8 text-center text-[var(--text-muted)] text-[13px] rounded-xl border border-[var(--subtle-border)]">
              유저 데이터를 불러오는 중...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
