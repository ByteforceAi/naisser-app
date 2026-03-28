"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  User,
  Inbox,
  MessageSquare,
  Bell,
  Home,
  Search,
  Heart,
  School,
  FolderLock,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const INSTRUCTOR_NAV: NavItem[] = [
  { label: "홈", href: "/instructor", icon: User },
  { label: "서류함", href: "/instructor/documents", icon: FolderLock },
  { label: "의뢰함", href: "/instructor/requests", icon: Inbox },
  { label: "커뮤니티", href: "/community", icon: MessageSquare },
  { label: "알림", href: "/instructor/notifications", icon: Bell },
];

const TEACHER_NAV: NavItem[] = [
  { label: "홈", href: "/teacher/home", icon: Home },
  { label: "검색", href: "/teacher/search", icon: Search },
  { label: "즐겨찾기", href: "/teacher/favorites", icon: Heart },
  { label: "커뮤니티", href: "/community", icon: MessageSquare },
  { label: "내 정보", href: "/teacher/myinfo", icon: School },
];

interface BottomNavProps {
  role: "instructor" | "teacher";
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const items = role === "instructor" ? INSTRUCTOR_NAV : TEACHER_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)]/95 backdrop-blur-lg
                     border-t border-[var(--glass-border)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-full h-full touch-target",
                "transition-colors duration-200",
                isActive
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-muted)]"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
