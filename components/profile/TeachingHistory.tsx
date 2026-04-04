"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { School, Calendar, Clock } from "lucide-react";

interface TeachingRecord {
  id: string;
  schoolName: string;
  date: string;
  subject: string;
  hours: string | null;
}

interface Stats {
  totalRecords: number;
  totalHours: number;
}

export function TeachingHistory({ instructorId }: { instructorId: string }) {
  const [records, setRecords] = useState<TeachingRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ totalRecords: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/instructors/${instructorId}/teaching-records`)
      .then((r) => r.json())
      .then((json) => {
        setRecords(json.data || []);
        setStats(json.stats || { totalRecords: 0, totalHours: 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [instructorId]);

  if (loading || records.length === 0) return null;

  return (
    <div className="px-6 mb-8">
      <h2 className="text-[12px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
        출강이력
      </h2>

      {/* 요약 통계 */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 p-3 rounded-xl text-center"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--glass-border)" }}>
          <p className="text-[18px] font-bold text-[var(--text-primary)]">{stats.totalRecords}</p>
          <p className="text-[11px] text-[var(--text-muted)]">총 출강</p>
        </div>
        <div className="flex-1 p-3 rounded-xl text-center"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--glass-border)" }}>
          <p className="text-[18px] font-bold text-[var(--text-primary)]">{stats.totalHours.toFixed(0)}h</p>
          <p className="text-[11px] text-[var(--text-muted)]">누적 시간</p>
        </div>
      </div>

      {/* 타임라인 */}
      <div className="space-y-0">
        {records.slice(0, 5).map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex gap-3 pb-4 relative"
          >
            {/* 타임라인 라인 */}
            {i < Math.min(records.length, 5) - 1 && (
              <div className="absolute left-[11px] top-8 bottom-0 w-px"
                style={{ background: "var(--glass-border)" }} />
            )}
            {/* 도트 */}
            <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: "rgba(37,99,235,0.08)" }}>
              <School className="w-3 h-3 text-[var(--accent-primary)]" />
            </div>
            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[var(--text-primary)]">{r.schoolName}</p>
              <div className="flex items-center gap-2 mt-0.5 text-[12px] text-[var(--text-muted)]">
                <span className="flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" />
                  {r.date}
                </span>
                {r.hours && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {r.hours}시간
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{r.subject}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
