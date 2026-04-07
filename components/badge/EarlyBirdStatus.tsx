"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface EarlyBirdStatusProps {
  isEarlyBird: boolean;
  freeRequestQuota: number;
  freeRequestUsed: number;
  expiresAt: string | null;
}

/** 얼리버드 잔여 현황 카드 */
export function EarlyBirdStatus({
  isEarlyBird,
  freeRequestQuota,
  freeRequestUsed,
  expiresAt,
}: EarlyBirdStatusProps) {
  if (!isEarlyBird) return null;

  const remaining = Math.max(0, freeRequestQuota - freeRequestUsed);
  const percentage = freeRequestQuota > 0 ? (remaining / freeRequestQuota) * 100 : 0;
  const expiresIn = expiresAt
    ? formatDistanceToNow(new Date(expiresAt), { addSuffix: true, locale: ko })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4"
      style={{ background: "var(--bg-grouped-secondary)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐣</span>
          <h3 className="text-sm font-semibold">얼리버드 현황</h3>
        </div>
        {expiresIn && (
          <span className="text-xs text-[var(--text-muted)]">
            만료 {expiresIn}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">무료 의뢰 알림</span>
          <span className="font-semibold">
            {remaining} / {freeRequestQuota}회 남음
          </span>
        </div>

        <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
            className="h-full bg-[var(--accent-primary)] rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
