"use client";

import { Bell, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";

const SETTINGS_ITEMS = [
  { label: "알림 설정", icon: Bell, href: "#" },
  { label: "로그아웃", icon: LogOut, href: "#", danger: true },
];

export default function InstructorSettingsPage() {
  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold mb-4">설정</h1>
      <div className="space-y-1">
        {SETTINGS_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl
                       hover:bg-[var(--bg-elevated)] transition-colors touch-target
                       ${item.danger ? "text-[var(--accent-danger)]" : ""}`}
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
