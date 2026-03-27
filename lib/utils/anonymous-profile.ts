/**
 * 반익명 프로필 생성 — 블라인드 스타일
 *
 * "🔵 안전교육 · 수도권" 형식으로 표시
 * - 색상: userId 해시 기반 (같은 사람 = 같은 색)
 * - 주제: instructors.topics[0] 또는 "강사"
 * - 지역: instructors.regions[0] 또는 ""
 */

import { getCategoryLabel } from "@/lib/constants/categories";

/** 10가지 프로필 색상 */
const PROFILE_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#8B5CF6", // violet
  "#F59E0B", // amber
  "#EF4444", // red
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
  "#6366F1", // indigo
] as const;

/** userId → 고정 색상 (해시 기반) */
export function getProfileColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return PROFILE_COLORS[Math.abs(hash) % PROFILE_COLORS.length];
}

/** 반익명 프로필 생성 */
export function getAnonymousProfile(
  userId: string,
  topics?: string[] | null,
  regions?: string[] | null
): {
  color: string;
  label: string;
  topicLabel: string;
  regionLabel: string;
} {
  const color = getProfileColor(userId);
  const topicLabel = topics?.[0]
    ? getCategoryLabel(topics[0], "subject")
    : "강사";
  const regionLabel = regions?.[0]
    ? getCategoryLabel(regions[0], "region")
    : "";

  const label = regionLabel
    ? `${topicLabel} · ${regionLabel}`
    : topicLabel;

  return { color, label, topicLabel, regionLabel };
}
