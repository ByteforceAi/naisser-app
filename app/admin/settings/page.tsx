"use client";

import { useState } from "react";
import { Save, TestTube, RefreshCw } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    googleSheetsWebhookUrl: "",
    googleSheetsSyncEnabled: false,
    aiApiKey: "",
    aiProvider: "claude",
  });

  return (
    <div className="p-4 lg:p-8 max-w-2xl" style={{ background: "var(--bg-grouped)" }}>
      <h1 className="relative z-10 text-2xl font-bold mb-6 lg:ml-0 ml-12">설정</h1>

      <div className="space-y-6">
        {/* Google Sheets */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--bg-grouped-secondary)" }}>
          <h3 className="text-sm font-semibold">Google Sheets 연동</h3>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">웹훅 URL</label>
            <input
              value={settings.googleSheetsWebhookUrl}
              onChange={(e) => setSettings({ ...settings, googleSheetsWebhookUrl: e.target.value })}
              placeholder="https://script.google.com/..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-elevated)] text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">자동 동기화</span>
            <button
              onClick={() => setSettings({ ...settings, googleSheetsSyncEnabled: !settings.googleSheetsSyncEnabled })}
              className={`w-11 h-6 rounded-full transition-colors ${
                settings.googleSheetsSyncEnabled ? "bg-[var(--accent-success)]" : "bg-[var(--bg-muted)]"
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-[var(--bg-surface)] shadow transition-transform ${
                settings.googleSheetsSyncEnabled ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                               bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)] transition-colors touch-target">
              <TestTube className="w-3.5 h-3.5" />
              웹훅 테스트
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                               bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)] transition-colors touch-target">
              <RefreshCw className="w-3.5 h-3.5" />
              전체 동기화
            </button>
          </div>
        </div>

        {/* AI */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--bg-grouped-secondary)" }}>
          <h3 className="text-sm font-semibold">AI 설정</h3>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">제공자</label>
            <select
              value={settings.aiProvider}
              onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-elevated)] text-sm"
            >
              <option value="claude">Claude (Anthropic)</option>
              <option value="openai">GPT-4o (OpenAI)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">API Key</label>
            <input
              type="password"
              value={settings.aiApiKey}
              onChange={(e) => setSettings({ ...settings, aiApiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full px-3 py-2 rounded-lg border border-[var(--glass-border)] bg-[var(--bg-elevated)] text-sm"
            />
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                           bg-[var(--accent-secondary)] text-white font-semibold touch-target">
          <Save className="w-4 h-4" />
          설정 저장
        </button>
      </div>
    </div>
  );
}
