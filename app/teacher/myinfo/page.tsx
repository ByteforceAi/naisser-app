"use client";

import { motion } from "framer-motion";
import { User, Star, Settings, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TeacherMyInfoPage() {
  return (
    <div className="px-4 pt-6">
      {/* 프로필 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <User className="w-7 h-7 text-[var(--accent-success)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold">교사님</h2>
            <p className="text-xs text-[var(--text-secondary)]">학교명</p>
          </div>
        </div>
      </motion.div>

      {/* 메뉴 */}
      <div className="space-y-1">
        {[
          { label: "내 리뷰", icon: Star, href: "#" },
          { label: "설정", icon: Settings, href: "#" },
          { label: "로그아웃", icon: LogOut, href: "#", danger: true },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl
                        hover:bg-[var(--bg-elevated)] transition-colors touch-target
                        ${"danger" in item && item.danger ? "text-[var(--accent-danger)]" : ""}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
