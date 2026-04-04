"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  User,
  Inbox,
  MessageSquare,
  Bell,
  Home,
  Search,
  Heart,
  FileText,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const INSTRUCTOR_NAV: NavItem[] = [
  { href: "/instructor", icon: Home },
  { href: "/community", icon: MessageSquare },
  { href: "/teacher/search", icon: Search },
  { href: "/instructor/notifications", icon: Bell },
  { href: "/instructor/profile/edit", icon: User },
];

const TEACHER_NAV: NavItem[] = [
  { href: "/teacher/home", icon: Home },
  { href: "/teacher/request", icon: FileText },
  { href: "/teacher/favorites", icon: Heart },
  { href: "/teacher/confirm", icon: Bell },
  { href: "/teacher/myinfo", icon: User },
];

interface BottomNavProps {
  role: "instructor" | "teacher";
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const items = role === "instructor" ? INSTRUCTOR_NAV : TEACHER_NAV;

  const activeIndex = items.findIndex((item) =>
    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50
                     pb-[env(safe-area-inset-bottom)]"
      style={{
        background: "rgba(250,250,252,0.75)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        borderTop: "0.5px solid rgba(0,0,0,0.06)",
      }}>
      <div className="relative flex items-center justify-around max-w-lg mx-auto" style={{ height: 49 }}>
        {/* Liquid Glass 인디케이터 — 선택된 탭 뒤 */}
        {activeIndex >= 0 && (
          <motion.div
            className="absolute top-1.5 rounded-full"
            layoutId="tabIndicator"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              width: 48,
              height: 32,
              left: `calc(${(activeIndex + 0.5) / items.length * 100}% - 24px)`,
              background: "rgba(0,136,255,0.08)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "0.5px solid rgba(0,136,255,0.12)",
              boxShadow: "0 2px 8px rgba(0,136,255,0.06)",
            }}
          />
        )}

        {items.map((item, i) => {
          const isActive = i === activeIndex;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center justify-center w-full h-full touch-target",
                "transition-colors duration-200",
              )}
            >
              <motion.div
                className="relative"
                animate={isActive ? { scale: 1 } : { scale: 1 }}
                whileTap={{ scale: 0.85 }}
              >
                <item.icon
                  style={{ width: 24, height: 24 }}
                  className={cn(
                    "transition-all duration-200",
                    isActive
                      ? "stroke-[2] text-[#0088ff]"
                      : "stroke-[1.5] text-[#b0b8c8]"
                  )}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center rounded-full"
                    style={{
                      minWidth: 16, height: 16, padding: "0 4px",
                      fontSize: 10, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                      background: "#FF3B30", color: "white",
                    }}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
