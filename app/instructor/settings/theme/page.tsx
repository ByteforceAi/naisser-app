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
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots">
      <header className="sticky top-0 z-40 community-header">
        <div className="max-w-[520px] mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--subtle-hover)] transition-colors touch-target">
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <h1 className="text-[15px] font-bold text-[var(--text-primary)]">화면 테마</h1>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 pt-4 space-y-2">
        {THEMES.map((t) => (
          <motion.button key={t.id} whileTap={{ scale: 0.98 }}
            onClick={() => setTheme(t.id)}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all
              ${mode === t.id
                ? "bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20"
                : "bg-[var(--bg-surface)] border border-[var(--subtle-border)]"}`}>
            <t.icon className="w-5 h-5 shrink-0"
              style={{ color: mode === t.id ? "var(--accent-primary)" : "var(--text-muted)" }} />
            <div>
              <p className={`text-[13px] font-medium ${mode === t.id ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                {t.label}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">{t.desc}</p>
            </div>
            {mode === t.id && (
              <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "var(--accent-primary)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}

        <p className="text-[11px] text-[var(--text-muted)] text-center pt-4">
          시간 자동 모드는 기기 시간 기준으로 전환됩니다
        </p>
      </div>
    </div>
  );
}
