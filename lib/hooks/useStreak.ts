"use client";

import { useEffect, useState } from "react";

/**
 * useStreak — 연속 활동 스트릭 추적
 *
 * localStorage에 마지막 활동일 저장, 연속 일수 계산
 * 프로필이나 커뮤니티에서 "🔥 5일 연속 활동" 표시에 사용
 */
const STREAK_KEY = "naisser_streak";

interface StreakData {
  current: number;
  lastDate: string; // YYYY-MM-DD
  longest: number;
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({ current: 0, lastDate: "", longest: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STREAK_KEY);
      const data: StreakData = saved ? JSON.parse(saved) : { current: 0, lastDate: "", longest: 0 };
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      if (data.lastDate === today) {
        // 오늘 이미 기록됨
        setStreak(data);
      } else if (data.lastDate === yesterday) {
        // 어제 활동 → 스트릭 +1
        const updated = {
          current: data.current + 1,
          lastDate: today,
          longest: Math.max(data.longest, data.current + 1),
        };
        localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
        setStreak(updated);
      } else {
        // 스트릭 끊김 → 1부터 다시
        const updated = { current: 1, lastDate: today, longest: data.longest };
        localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
        setStreak(updated);
      }
    } catch { /* */ }
  }, []);

  return streak;
}
