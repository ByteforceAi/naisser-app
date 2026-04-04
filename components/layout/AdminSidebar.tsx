"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Image,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "강사 관리", href: "/admin/instructors", icon: Users },
  { label: "커뮤니티", href: "/admin/community", icon: MessageSquare },
  { label: "공지사항", href: "/admin/bulletins", icon: Megaphone },
  { label: "팝업 관리", href: "/admin/popups", icon: Image },
  { label: "AI 어시스턴트", href: "/admin/ai", icon: Bot },
  { label: "설정", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* 로고 */}
      <div className="px-5 py-6 border-b border-[var(--glass-border)]">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--accent-secondary)]">
            나이써
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]">
            ADMIN
          </span>
        </Link>
      </div>

      {/* 네비 */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 하단 */}
      <div className="px-3 py-4 border-t border-[var(--glass-border)]">
        <button
          onClick={() => {
            document.cookie = "admin-token=; path=/; max-age=0";
            window.location.href = "/admin/login";
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-[var(--text-muted)] hover:text-[var(--accent-danger)]
                     hover:bg-red-500/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 모바일 햄버거 */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--glass-border)]
                   flex items-center justify-center shadow-glass touch-target"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-[var(--bg-surface)] border-r border-[var(--glass-border)] z-40 transition-transform duration-300",
          "w-60",
          "lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 모바일 닫기 */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 touch-target"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebar}
      </aside>
    </>
  );
}
