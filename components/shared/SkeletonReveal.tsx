"use client";

import { useEffect, useState } from "react";

/**
 * A12: 스켈레톤 → 텍스트 변환
 * 로딩 중 shimmer 스켈레톤 → 데이터 도착 시 부드럽게 텍스트 전환
 */
interface SkeletonRevealProps {
  loading: boolean;
  children: React.ReactNode;
  width?: string;
  className?: string;
}

export function SkeletonReveal({ loading, children, width = "60%", className }: SkeletonRevealProps) {
  const [revealed, setRevealed] = useState(!loading);

  useEffect(() => {
    if (!loading) {
      // 약간의 딜레이 후 reveal하여 shimmer → 텍스트 전환 체감
      const t = setTimeout(() => setRevealed(true), 100);
      return () => clearTimeout(t);
    }
    setRevealed(false);
  }, [loading]);

  if (loading) {
    return (
      <span
        className={`skeleton-text inline-block ${className || ""}`}
        style={{ width, height: "1em" }}
      >
        &nbsp;
      </span>
    );
  }

  return (
    <span
      className={`${revealed ? "" : "skeleton-text"} inline-block transition-all duration-300 ${className || ""}`}
    >
      {children}
    </span>
  );
}
