"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Flame, Loader2 } from "lucide-react";
import { GradeBadge } from "@/components/community/GradeBadge";
import type { GradeKey } from "@/components/community/GradeBadge";

interface ActivityData {
  monthlyStats: {
    lessonCount: number;
    schoolCount: number;
    studentCount: number;
  };
  streak: number;
  monthActivity: {
    activeDays: number;
    totalDays: number;
    daysPassed: number;
    rate: number;
  };
  grade: {
    key: GradeKey;
    emoji: string;
    label: string;
    color: string;
    score: number;
    nextGrade: {
      key: string;
      emoji: string;
      label: string;
      minScore: number;
    } | null;
    remaining: number;
    progress: number;
  };
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/**
 * 활동 트래커 — 스트라바 스타일
 * 강사 마이페이지에 표시되는 이번 달 활동 통계
 */
export function ActivityTracker() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/me/activity");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch {
        // 실패해도 메인 페이지에 영향 없음
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-5 flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  if (!data) return null;

  const monthName = new Date().toLocaleDateString("ko-KR", { month: "long" });

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card p-5"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--accent-primary)]" />
          <h3 className="text-sm font-bold">이번 달 내 활동</h3>
        </div>
        <GradeBadge grade={data.grade.key} size="md" />
      </div>

      {/* 수업 통계 3열 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard
          value={data.monthlyStats.lessonCount}
          label="수업"
          delay={0}
        />
        <StatCard
          value={data.monthlyStats.schoolCount}
          label="학교"
          delay={0.05}
        />
        <StatCard
          value={data.monthlyStats.studentCount}
          label="학생"
          delay={0.1}
        />
      </div>

      {/* 연속 활동 스트릭 */}
      {data.streak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl
                     bg-gradient-to-r from-[rgba(255,149,0,0.08)] to-[rgba(255,149,0,0.06)]
                     border border-[rgba(255,149,0,0.15)]"
        >
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-semibold text-[#FF9500]">
            {data.streak}일 연속 활동 중!
          </span>
        </motion.div>
      )}

      {/* 이번 달 활동 히트맵 바 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            {monthName} 활동
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {data.monthActivity.activeDays}일 / {data.monthActivity.daysPassed}일
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.monthActivity.rate}%` }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-emerald-400"
          />
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-[var(--accent-primary)]">
            {data.monthActivity.rate}%
          </span>
        </div>
      </div>

      {/* 등급 진행도 */}
      {data.grade.nextGrade && (
        <div className="mt-4 pt-3 border-t border-[var(--glass-border)] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">
              {data.grade.emoji} {data.grade.label} &rarr;{" "}
              {data.grade.nextGrade.emoji} {data.grade.nextGrade.label}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {data.grade.remaining}점 남음
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.grade.progress}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: data.grade.color }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── 통계 카드 ──

function StatCard({
  value,
  label,
  delay,
}: {
  value: number;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 + delay }}
      className="flex flex-col items-center gap-1 py-3 rounded-xl
                 bg-[var(--bg-elevated)] border border-[var(--glass-border)]"
    >
      <span className="text-xl font-bold tabular-nums text-[var(--text-primary)]">
        {value.toLocaleString("ko-KR")}
      </span>
      <span className="text-[11px] text-[var(--text-muted)] font-medium">
        {label}
      </span>
    </motion.div>
  );
}
