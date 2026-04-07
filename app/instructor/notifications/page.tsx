"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell, Inbox, Star, Calendar, FileCheck2, CheckCheck,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
// TODO: 서버에서 그루핑된 알림 제공 시 활성화
// import { groupNotifications } from "@/lib/utils/groupNotifications";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link: string | null;
}

const ICON_MAP: Record<string, typeof Bell> = {
  request: Inbox,
  review: Star,
  teaching: Calendar,
  document: FileCheck2,
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications/read-all", { method: "PATCH" });
  };

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0088ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots px-5 pt-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">알림</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-blue-500 mt-0.5">읽지 않은 알림 {unreadCount}건</p>
          )}
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={markAllRead}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-600 bg-blue-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            전체 읽음
          </motion.button>
        )}
      </motion.div>

      {notifications.length === 0 ? (
        <div className="relative z-10">
          <EmptyState
            icon={Bell}
            title="아직 알림이 없어요"
            description="새로운 의뢰나 리뷰가 등록되면 알려드릴게요"
          />
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          className="relative z-10 space-y-3"
        >
          {notifications.map((n) => {
            const IconComp = ICON_MAP[n.type] || Bell;
            const timeAgo = getTimeAgo(n.createdAt);

            return (
              <motion.div
                key={n.id}
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                onClick={() => {
                  if (!n.isRead) markRead(n.id);
                  if (n.link) router.push(n.link);
                }}
                className={`${n.isRead ? "ds-card-muted" : "ds-card"} p-4 cursor-pointer transition-all ${
                  n.isRead ? "opacity-60" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    n.isRead ? "bg-gray-100" : "bg-blue-50"
                  }`}>
                    <IconComp className={`w-4 h-4 ${n.isRead ? "text-gray-400" : "text-blue-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-bold ${n.isRead ? "text-[var(--text-secondary)]" : "text-gray-900"}`}>
                        {n.title}
                      </h3>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{timeAgo}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}
