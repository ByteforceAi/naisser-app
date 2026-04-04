"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * useTheme — 라이트/다크/자동 테마 관리
 *
 * "auto": 시스템 설정 따름 (기본)
 * "light": 강제 라이트
 * "dark": 강제 다크
 * "schedule": 시간 기반 (6~18시 라이트, 나머지 다크)
 */

type ThemeMode = "auto" | "light" | "dark" | "schedule";

const THEME_KEY = "naisser_theme";

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("auto");

  // 초기 로드
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (saved) setMode(saved);
  }, []);

  // 테마 적용
  useEffect(() => {
    const root = document.documentElement;

    if (mode === "light") {
      root.setAttribute("data-theme", "light");
    } else if (mode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (mode === "schedule") {
      const hour = new Date().getHours();
      const isDark = hour < 6 || hour >= 18;
      root.setAttribute("data-theme", isDark ? "dark" : "light");

      // 매 분 체크
      const interval = setInterval(() => {
        const h = new Date().getHours();
        root.setAttribute("data-theme", h < 6 || h >= 18 ? "dark" : "light");
      }, 60000);
      return () => clearInterval(interval);
    } else {
      // auto — 시스템 따름 (명시적으로 data-theme 설정)
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");

      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e: MediaQueryListEvent) => {
        root.setAttribute("data-theme", e.matches ? "dark" : "light");
      };
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [mode]);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem(THEME_KEY, newMode);
  }, []);

  return { mode, setTheme };
}
