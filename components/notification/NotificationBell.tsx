"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import Link from "next/link";

interface NotificationBellProps {
  href?: string;
}

/** 알림 벨 아이콘 — unread count 빨간 뱃지 + shake 애니메이션 */
export function NotificationBell({
  href = "/instructor/notifications",
}: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    // 알림 count 폴링 (30초마다)
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count");
        if (res.ok) {
          const json = await res.json();
          const newCount = json.data?.count ?? 0;

          // 새 알림이 생기면 shake
          if (newCount > unreadCount && unreadCount > 0) {
            setShouldShake(true);
            setTimeout(() => setShouldShake(false), 600);
          }
          setUnreadCount(newCount);
        }
      } catch {
        // 무시
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [unreadCount]);

  return (
    <Link href={href} className="relative touch-target">
      <motion.div
        animate={
          shouldShake
            ? {
                rotate: [0, -15, 15, -10, 10, -5, 5, 0],
                transition: { duration: 0.6 },
              }
            : {}
        }
      >
        <Bell className="w-6 h-6" />
      </motion.div>

      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                       flex items-center justify-center
                       bg-red-500 text-white text-[10px] font-bold rounded-full"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
