"use client";

import { motion } from "framer-motion";
import { Bell, LogOut, ChevronRight, ArrowLeft, Shield, HelpCircle, FileText, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SETTINGS_SECTIONS = [
  {
    items: [
      { label: "알림 설정", icon: Bell, href: "/instructor/settings/notifications", desc: "푸시 알림, 이메일 알림", color: "var(--accent-danger)" },
      { label: "화면 테마", icon: Moon, href: "/instructor/settings/theme", desc: "라이트 / 다크 / 자동", color: "#007AFF" },
    ],
  },
  {
    items: [
      { label: "개인정보 보호", icon: Shield, href: "/instructor/settings/privacy", desc: "프로필 공개 범위 설정", color: "#007AFF" },
      { label: "차단/뮤트 관리", icon: Shield, href: "/instructor/settings/blocked", desc: "차단한 사용자 관리", color: "#8E8E93" },
      { label: "이용약관", icon: FileText, href: "/p/terms", desc: "서비스 이용 약관", color: "#8E8E93" },
      { label: "도움말", icon: HelpCircle, href: "/instructor/settings/help", desc: "자주 묻는 질문", color: "#34C759" },
    ],
  },
  {
    items: [
      { label: "로그아웃", icon: LogOut, href: "#", danger: true, color: "var(--accent-danger)" },
    ],
  },
];

export default function InstructorSettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg-grouped)" }}>
      {/* 헤더 */}
      <div className="sticky top-0 z-50 px-5 py-3 flex items-center gap-3"
        style={{ background: "var(--bg-grouped)", opacity: 0.95, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors touch-target">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        </button>
        <h1 className="text-[17px] font-semibold" style={{ color: "var(--text-primary)" }}>설정</h1>
      </div>

      <motion.div
        initial="hidden" animate="visible"
        transition={{ staggerChildren: 0.04 }}
        className="space-y-8 px-5 pt-2"
      >
        {SETTINGS_SECTIONS.map((section, si) => (
          <motion.div key={si}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.06 }}>
            <div className="rounded-[14px] overflow-hidden"
              style={{ background: "var(--bg-grouped-secondary)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              {section.items.map((item, ii) => (
                <Link key={item.label} href={item.href}
                  className="flex items-center gap-3 px-4 active:bg-[var(--bg-muted)] transition-colors"
                  style={ii < section.items.length - 1 ? { borderBottom: "0.5px solid var(--ios-separator)" } : {}}>
                  <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center shrink-0 my-2.5"
                    style={{ background: item.color }}>
                    <item.icon className="w-[17px] h-[17px] text-white" />
                  </div>
                  <div className="flex-1 min-w-0 py-3">
                    <span className="text-[17px] block"
                      style={{ color: "danger" in item && item.danger ? "var(--accent-danger)" : "var(--text-primary)" }}>
                      {item.label}
                    </span>
                    {"desc" in item && item.desc && (
                      <span className="text-[13px] block" style={{ color: "var(--ios-gray)" }}>{item.desc as string}</span>
                    )}
                  </div>
                  {!("danger" in item && item.danger) && (
                    <ChevronRight className="w-[14px] h-[14px] shrink-0" style={{ color: "var(--ios-gray3)" }} />
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="text-center text-[13px] pt-8 pb-4" style={{ color: "var(--ios-gray)" }}>
        NAISSER v1.0.0
      </motion.p>
    </div>
  );
}
