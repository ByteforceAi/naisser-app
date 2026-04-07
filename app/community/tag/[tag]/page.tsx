"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Hash } from "lucide-react";

/**
 * /community/tag/[tag] — 특정 해시태그의 모든 게시글
 *
 * 커뮤니티 피드에서 해시태그 클릭 시 이동
 */
export default function TagPage() {
  const { tag } = useParams() as { tag: string };
  const router = useRouter();
  const decodedTag = decodeURIComponent(tag);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      {/* 헤더 */}
      <header className="sticky top-0 z-40"
        style={{ background: "var(--bg-grouped-secondary)", borderBottom: "0.5px solid var(--ios-separator)" }}>
        <div className="max-w-[520px] mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-[var(--bg-muted)] transition-colors touch-target">
            <ArrowLeft className="w-5 h-5 text-[var(--accent-primary)]" />
          </button>
          <div>
            <h1 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-1">
              <Hash className="w-4 h-4" />{decodedTag}
            </h1>
            <p className="text-[11px] text-[var(--text-muted)]">태그된 게시글</p>
          </div>
        </div>
      </header>

      {/* TODO: 해당 태그로 필터된 피드 렌더 */}
      <div className="max-w-[520px] mx-auto px-4 py-8 text-center">
        <p className="text-[13px] text-[var(--text-muted)]">
          #{decodedTag} 태그가 포함된 게시글을 불러오는 중...
        </p>
      </div>
    </div>
  );
}
