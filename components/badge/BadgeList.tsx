"use client";

import { BadgeIcon } from "./BadgeIcon";

interface Badge {
  badgeType: string;
  grantedAt: string;
  expiresAt?: string | null;
}

interface BadgeListProps {
  badges: Badge[];
}

/** 뱃지 리스트 — 프로필 카드, 커뮤니티 게시글에서 사용 */
export function BadgeList({ badges }: BadgeListProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <BadgeIcon key={badge.badgeType} type={badge.badgeType} />
      ))}
    </div>
  );
}
