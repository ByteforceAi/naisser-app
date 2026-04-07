"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sun, Moon, Monitor, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/hooks/useTheme";

const THEMES = [
  { id: "auto" as const, label: "시스템 설정", desc: "기기 설정에 따라 자동 전환", icon: Monitor },
  { id: "light" as const, label: "라이트", desc: "항상 밝은 테마", icon: Sun },
  { id: "dark" as const, label: "다크", desc: "항상 어두운 테마", icon: Moon },
  { id: "schedule" as const, label: "시간 자동", desc: "오전 6시~오후 6시 라이트, 나머지 다크", icon: Clock },
];

export default function ThemeSettingsPage() {
  const router = useRouter();
  const { mode, setTheme } = useTheme();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      <div className="sticky top-0 z-50 px-5 py-3 flex items-center gap-3"
        style={{ background: "var(--bg-grouped)", opacity: 0.95, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors touch-target">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        </button>
        <h1 className="text-[17px] font-semibold" style={{ color: "var(--text-primary)" }}>화면 테마</h1>
      </div>

      <div className="max-w-[520px] mx-auto px-5 pt-2">
        <div className="rounded-[14px] overflow-hidden" style={{ background: "var(--bg-grouped-secondary)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          {THEMES.map((t, i) => (
            <motion.button key={t.id} whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(t.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:bg-[var(--bg-muted)]"
              style={i < THEMES.length - 1 ? { borderBottom: "0.5px solid var(--ios-separator)" } : {}}>
              <t.icon className="w-5 h-5 shrink-0"
                style={{ color: mode === t.id ? "var(--accent-primary)" : "var(--text-muted)" }} />
              <div className="flex-1">
                <p className="text-[15px]"
                  style={{ color: mode === t.id ? "var(--accent-primary)" : "var(--text-primary)" }}>
                  {t.label}
                </p>
                <p className="text-[12px]" style={{ color: "var(--ios-gray)" }}>{t.desc}</p>
              </div>
              {mode === t.id && (
                <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--accent-primary)" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <p className="text-[12px] text-center pt-4" style={{ color: "var(--ios-gray)" }}>
          시간 자동 모드는 기기 시간 기준으로 전환됩니다
        </p>
      </div>
    </div>
  );
}
