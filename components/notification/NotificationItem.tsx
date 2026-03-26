"use client";

import { motion } from "framer-motion";
import { Inbox, CheckCircle, XCircle, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";

interface NotificationItemProps {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
  onClick?: () => void;
}

const TYPE_ICONS: Record<string, typeof Bell> = {
  request_new: Inbox,
  request_accepted: CheckCircle,
  request_rejected: XCircle,
};

export function NotificationItem({
  type,
  title,
  body,
  isRead,
  createdAt,
  onClick,
}: NotificationItemProps) {
  const Icon = TYPE_ICONS[type] || Bell;
  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-xl text-left transition-colors touch-target",
        isRead ? "bg-transparent" : "bg-blue-50/30"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          isRead ? "bg-[var(--bg-elevated)]" : "bg-[var(--accent-primary)]/10"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5",
            isRead
              ? "text-[var(--text-muted)]"
              : "text-[var(--accent-primary)]"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm", !isRead && "font-semibold")}>
            {title}
          </p>
          {!isRead && (
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shrink-0" />
          )}
        </div>
        {body && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">
            {body}
          </p>
        )}
        <span className="text-xs text-[var(--text-muted)] mt-1 block">
          {timeAgo}
        </span>
      </div>
    </motion.button>
  );
}
