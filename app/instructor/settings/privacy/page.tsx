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
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      <div className="sticky top-0 z-50 px-5 py-3 flex items-center gap-3"
        style={{ background: "var(--bg-grouped)", opacity: 0.95, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors touch-target">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        </button>
        <h1 className="text-[17px] font-semibold" style={{ color: "var(--text-primary)" }}>개인정보 보호</h1>
      </div>

      <div className="max-w-[520px] mx-auto px-5 pt-2 pb-24 space-y-8">
        {/* 프로필 공개 범위 */}
        <div>
          <p className="text-[13px] font-medium px-4 mb-2 uppercase tracking-wider" style={{ color: "var(--ios-gray)" }}>프로필 공개 범위</p>
          <div className="rounded-[14px] overflow-hidden" style={{ background: "var(--bg-grouped-secondary)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            {PRIVACY_OPTIONS.map((opt, i) => (
              <motion.button key={opt.id} whileTap={{ scale: 0.98 }}
                onClick={() => setVisibility(opt.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:bg-[var(--bg-muted)]"
                style={i < PRIVACY_OPTIONS.length - 1 ? { borderBottom: "0.5px solid var(--ios-separator)" } : {}}>
                <opt.icon className="w-5 h-5 shrink-0"
                  style={{ color: visibility === opt.id ? "var(--accent-primary)" : "var(--text-muted)" }} />
                <div className="flex-1">
                  <p className="text-[15px]"
                    style={{ color: visibility === opt.id ? "var(--accent-primary)" : "var(--text-primary)" }}>
                    {opt.label}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--ios-gray)" }}>{opt.desc}</p>
                </div>
                {visibility === opt.id && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent-primary)" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 연락처 공개 */}
        <div>
          <p className="text-[13px] font-medium px-4 mb-2 uppercase tracking-wider" style={{ color: "var(--ios-gray)" }}>연락처 공개</p>
          <div className="rounded-[14px] overflow-hidden" style={{ background: "var(--bg-grouped-secondary)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom: "0.5px solid var(--ios-separator)" }}>
              <div className="flex items-center gap-3">
                {showPhone ? <Eye className="w-4 h-4" style={{ color: "var(--text-muted)" }} /> : <EyeOff className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                <span className="text-[15px]" style={{ color: "var(--text-primary)" }}>전화번호</span>
              </div>
              <button onClick={() => setShowPhone(!showPhone)}
                className="rounded-full transition-colors"
                style={{ width: 51, height: 31, background: showPhone ? "var(--accent-success)" : "var(--ios-separator)" }}>
                <motion.div
                  animate={{ x: showPhone ? 23 : 3 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="rounded-full"
                  style={{ width: 27, height: 27, marginTop: 2, background: "var(--bg-surface)", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}
                />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                {showEmail ? <Eye className="w-4 h-4" style={{ color: "var(--text-muted)" }} /> : <EyeOff className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                <span className="text-[15px]" style={{ color: "var(--text-primary)" }}>이메일</span>
              </div>
              <button onClick={() => setShowEmail(!showEmail)}
                className="rounded-full transition-colors"
                style={{ width: 51, height: 31, background: showEmail ? "var(--accent-success)" : "var(--ios-separator)" }}>
                <motion.div
                  animate={{ x: showEmail ? 23 : 3 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="rounded-full"
                  style={{ width: 27, height: 27, marginTop: 2, background: "var(--bg-surface)", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 저장 */}
        <motion.button whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-[14px] text-[15px] font-bold text-white"
          style={{ background: "var(--accent-primary)" }}>
          저장
        </motion.button>
      </div>
    </div>
  );
}
