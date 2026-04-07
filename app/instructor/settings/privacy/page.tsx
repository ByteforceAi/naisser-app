"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Globe, Lock, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const PRIVACY_OPTIONS = [
  { id: "public", label: "전체 공개", desc: "누구나 프로필과 연락처를 볼 수 있습니다", icon: Globe },
  { id: "instructors", label: "강사만", desc: "같은 강사만 프로필을 볼 수 있습니다", icon: Users },
  { id: "private", label: "비공개", desc: "검색에 노출되지 않습니다", icon: Lock },
];

export default function PrivacySettingsPage() {
  const router = useRouter();
  const [visibility, setVisibility] = useState("public");
  const [showPhone, setShowPhone] = useState(true);
  const [showEmail, setShowEmail] = useState(true);

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots">
      <header className="sticky top-0 z-40 community-header">
        <div className="max-w-[520px] mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--subtle-hover)] transition-colors touch-target">
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <h1 className="text-[15px] font-bold text-[var(--text-primary)]">개인정보 보호</h1>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 pt-4 space-y-6">
        {/* 프로필 공개 범위 */}
        <div>
          <p className="text-[12px] font-semibold text-[var(--text-muted)] mb-3 uppercase tracking-wider">프로필 공개 범위</p>
          <div className="space-y-2">
            {PRIVACY_OPTIONS.map((opt) => (
              <motion.button key={opt.id} whileTap={{ scale: 0.98 }}
                onClick={() => setVisibility(opt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all
                  ${visibility === opt.id
                    ? "bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20"
                    : "bg-[var(--bg-surface)] border border-[var(--subtle-border)]"}`}>
                <opt.icon className="w-5 h-5 shrink-0"
                  style={{ color: visibility === opt.id ? "var(--accent-primary)" : "var(--text-muted)" }} />
                <div>
                  <p className={`text-[13px] font-semibold ${visibility === opt.id ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">{opt.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 연락처 공개 */}
        <div>
          <p className="text-[12px] font-semibold text-[var(--text-muted)] mb-3 uppercase tracking-wider">연락처 공개</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--subtle-border)]">
              <div className="flex items-center gap-3">
                {showPhone ? <Eye className="w-4 h-4 text-[var(--text-muted)]" /> : <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />}
                <span className="text-[13px] text-[var(--text-primary)]">전화번호</span>
              </div>
              <button onClick={() => setShowPhone(!showPhone)}
                className={`w-10 h-6 rounded-full transition-colors ${showPhone ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-muted)]"}`}>
                <div className={`w-4.5 h-4.5 rounded-full bg-[var(--bg-surface)] shadow transition-transform
                  ${showPhone ? "translate-x-5" : "translate-x-1"}`}
                  style={{ width: 18, height: 18, margin: 3 }} />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--subtle-border)]">
              <div className="flex items-center gap-3">
                {showEmail ? <Eye className="w-4 h-4 text-[var(--text-muted)]" /> : <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />}
                <span className="text-[13px] text-[var(--text-primary)]">이메일</span>
              </div>
              <button onClick={() => setShowEmail(!showEmail)}
                className={`w-10 h-6 rounded-full transition-colors ${showEmail ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-muted)]"}`}>
                <div className={`w-4.5 h-4.5 rounded-full bg-[var(--bg-surface)] shadow transition-transform
                  ${showEmail ? "translate-x-5" : "translate-x-1"}`}
                  style={{ width: 18, height: 18, margin: 3 }} />
              </button>
            </div>
          </div>
        </div>

        {/* 저장 */}
        <motion.button whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl text-[14px] font-bold text-white"
          style={{ background: "var(--accent-primary)" }}>
          저장
        </motion.button>
      </div>
    </div>
  );
}
