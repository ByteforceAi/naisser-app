"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Eye, Share2, Phone, Heart, TrendingUp, TrendingDown,
  Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface InsightItem {
  count: number;
  diff: number;
  percent: number | null;
  isNew: boolean;
}

interface InsightData {
  month: string;
  insights: Record<string, InsightItem>;
  summary: {
    totalViews: number;
    totalCTA: number;
    totalShares: number;
    totalFavorites: number;
  };
}

const SUMMARY_CARDS = [
  { key: "totalViews", label: "프로필 조회", icon: Eye, color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
  { key: "totalCTA", label: "문의 클릭", icon: Phone, color: "#059669", bg: "rgba(5,150,105,0.08)" },
  { key: "totalShares", label: "프로필 공유", icon: Share2, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  { key: "totalFavorites", label: "즐겨찾기", icon: Heart, color: "#EC4899", bg: "rgba(236,72,153,0.08)" },
] as const;

const DETAIL_ROWS = [
  { key: "view", label: "프로필 조회", icon: Eye },
  { key: "phone_click", label: "전화 클릭", icon: Phone },
  { key: "sns_click", label: "SNS 클릭", icon: Share2 },
  { key: "kakao_share", label: "카카오 공유", icon: Share2 },
  { key: "share", label: "링크 공유", icon: Share2 },
  { key: "favorite", label: "즐겨찾기", icon: Heart },
] as const;

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function InsightsPage() {
  const router = useRouter();
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    setLoading(true);
    fetch(`/api/instructor/insights?month=${month}`)
      .then((r) => r.json())
      .then((json) => setData(json.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [month]);

  const changeMonth = (dir: -1 | 1) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const [y, m] = month.split("-").map(Number);
  const monthLabel = `${y}년 ${m}월`;

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots">
      {/* 헤더 */}
      <header className="page-header-premium">
        <button onClick={() => router.back()} className="ds-back-btn touch-target">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold">프로필 인사이트</h1>
      </header>

      <div className="relative z-10 px-5 pt-4 pb-24">
        {/* 월 네비 */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full flex items-center justify-center
                     bg-[var(--bg-surface)] border border-[var(--glass-border)] touch-target">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-[var(--text-primary)]">{monthLabel}</span>
          <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full flex items-center justify-center
                     bg-[var(--bg-surface)] border border-[var(--glass-border)] touch-target">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
          </div>
        ) : data ? (
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
            {/* 요약 카드 4개 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {SUMMARY_CARDS.map((card) => {
                const value = data.summary[card.key as keyof typeof data.summary];
                const insightKey = card.key === "totalViews" ? "view"
                  : card.key === "totalCTA" ? "phone_click"
                  : card.key === "totalShares" ? "share"
                  : "favorite";
                const insight = data.insights[insightKey];

                return (
                  <motion.div key={card.key} variants={fadeIn}
                    className="stat-card-premium"
                    style={{ "--stat-accent": card.color } as React.CSSProperties}>
                    <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
                      style={{ background: card.bg }}>
                      <card.icon className="w-4 h-4" style={{ color: card.color }} />
                    </div>
                    <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{card.label}</p>
                    {/* 변화율 */}
                    {insight && (
                      <div className="mt-1.5">
                        {insight.isNew ? (
                          <span className="text-[10px] text-[var(--accent-primary)] font-medium">NEW</span>
                        ) : insight.percent !== null && insight.percent !== 0 ? (
                          <span className={`text-[10px] font-medium flex items-center justify-center gap-0.5 ${
                            insight.percent > 0 ? "text-[var(--accent-success)]" : "text-[var(--accent-danger)]"
                          }`}>
                            {insight.percent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {insight.percent > 0 ? "+" : ""}{insight.percent}%
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--text-muted)]">-</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* 상세 현황 */}
            <motion.div variants={fadeIn}>
              <h3 className="text-[12px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
                상세 현황
              </h3>
              <div className="ds-card overflow-hidden divide-y divide-[var(--glass-border)]">
                {DETAIL_ROWS.map((row) => {
                  const insight = data.insights[row.key];
                  if (!insight) return null;
                  return (
                    <div key={row.key} className="flex items-center gap-3 px-4 py-3">
                      <row.icon className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="flex-1 text-[13px] text-[var(--text-primary)]">{row.label}</span>
                      <span className="text-[14px] font-bold text-[var(--text-primary)] tabular-nums">{insight.count}</span>
                      {insight.percent !== null && insight.percent !== 0 && (
                        <span className={`text-[11px] font-medium ${
                          insight.percent > 0 ? "text-[var(--accent-success)]" : "text-[var(--accent-danger)]"
                        }`}>
                          {insight.percent > 0 ? "+" : ""}{insight.percent}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-sm text-[var(--text-muted)]">데이터를 불러올 수 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
