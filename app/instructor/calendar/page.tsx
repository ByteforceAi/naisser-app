"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, School, Clock,
  BookOpen, Loader2, AlertCircle,
} from "lucide-react";

interface TeachingRecord {
  id: string;
  schoolName: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  hours: string | null;
  subject: string;
  status: string;
  fee: number | null;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTH_NAMES = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [records, setRecords] = useState<TeachingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    today.toISOString().slice(0, 10)
  );

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teaching-records?status=all&limit=200");
      if (res.ok) {
        const json = await res.json();
        setRecords(json.data || []);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // 달력 그리드 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    const days: Array<{ date: string; day: number; isCurrentMonth: boolean; isToday: boolean }> = [];

    // 이전 달
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevLastDate - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      days.push({
        date: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        day: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // 현재 달
    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        day: d,
        isCurrentMonth: true,
        isToday: dateStr === today.toISOString().slice(0, 10),
      });
    }

    // 다음 달 (6주 채우기)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({
        date: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        day: d,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [year, month, today]);

  // 날짜별 수업 수 맵
  const dateCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      map[r.date] = (map[r.date] || 0) + 1;
    });
    return map;
  }, [records]);

  // 선택된 날짜의 수업
  const selectedRecords = useMemo(() => {
    if (!selectedDate) return [];
    return records.filter((r) => r.date === selectedDate);
  }, [records, selectedDate]);

  // 월간 통계
  const monthStats = useMemo(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthRecords = records.filter((r) => r.date.startsWith(monthStr));
    const confirmed = monthRecords.filter((r) => r.status === "confirmed");
    return {
      total: monthRecords.length,
      confirmed: confirmed.length,
      hours: confirmed.reduce((s, r) => s + (parseFloat(r.hours || "0") || 0), 0),
      fee: confirmed.reduce((s, r) => s + (r.fee || 0), 0),
    };
  }, [records, year, month]);

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  // 일정 충돌 감지
  const hasConflict = (date: string) => {
    const dayRecords = records.filter((r) => r.date === date && r.startTime && r.endTime);
    for (let i = 0; i < dayRecords.length; i++) {
      for (let j = i + 1; j < dayRecords.length; j++) {
        if (dayRecords[i].startTime! < dayRecords[j].endTime! &&
            dayRecords[j].startTime! < dayRecords[i].endTime!) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots px-5 pt-4 pb-24">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">수업 캘린더</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {monthStats.total}건 수업 · {monthStats.hours.toFixed(0)}시간
          </p>
        </div>
        <motion.a
          href="/instructor/career"
          whileTap={{ scale: 0.97 }}
          className="ds-btn-primary flex items-center gap-1 px-3 py-1.5 !rounded-xl text-xs"
        >
          <Plus className="w-3.5 h-3.5" /> 출강 등록
        </motion.a>
      </motion.div>

      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h2 className="text-base font-bold text-gray-900">{year}년 {MONTH_NAMES[month]}</h2>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div key={d} className={`text-center text-[10px] font-medium py-1.5 ${
            i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-[var(--text-muted)]"
          }`}>
            {d}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-[#0088ff]" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-[1px] mb-4">
          {calendarDays.map((d, i) => {
            const count = dateCountMap[d.date] || 0;
            const conflict = count > 1 && hasConflict(d.date);
            const isSelected = selectedDate === d.date;

            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedDate(d.date)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all ${
                  !d.isCurrentMonth ? "opacity-30" : ""
                } ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                style={{
                  background: d.isToday
                    ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)"
                    : isSelected
                    ? "rgba(37,99,235,0.08)"
                    : "transparent",
                }}
              >
                <span className={`text-xs font-medium ${
                  d.isToday ? "text-white" : isSelected ? "text-blue-600" : "text-gray-700"
                }`}>
                  {d.day}
                </span>

                {/* 수업 도트 */}
                {count > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                      <div key={j} className={`w-1 h-1 rounded-full ${
                        d.isToday ? "bg-white/80" : conflict ? "bg-red-400" : "bg-blue-400"
                      }`} />
                    ))}
                  </div>
                )}

                {/* 충돌 경고 */}
                {conflict && !d.isToday && (
                  <AlertCircle className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-red-400" />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* 선택된 날짜의 수업 */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              {selectedDate && new Date(selectedDate + "T00:00:00").toLocaleDateString("ko-KR", {
                month: "long", day: "numeric", weekday: "short",
              })}
            </h3>

            {selectedRecords.length === 0 ? (
              <div className="ds-card text-center py-8">
                <p className="text-xs text-[var(--text-muted)]">이 날은 수업이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedRecords.map((r) => (
                  <div key={r.id} className="ds-card p-3.5"
                    style={{
                      border: `1.5px solid ${r.status === "confirmed" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"}`,
                    }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <School className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span className="text-sm font-bold text-gray-900">{r.schoolName}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}>
                        {r.status === "confirmed" ? "확인됨" : "대기"}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
                      {r.startTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {r.startTime}~{r.endTime}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {r.subject}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
