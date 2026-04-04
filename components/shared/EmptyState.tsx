"use client";

import { motion } from "framer-motion";
import { Inbox, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
  compact = false,
}: EmptyStateProps) {
  const Icon = IconComponent || Inbox;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center text-center
                  ${compact ? "py-12 px-4" : "py-20 px-6"} ${className}`}
    >
      {/* 플로팅 아이콘 링 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 20 }}
        className="relative mb-5"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center animate-gentle-float"
          style={{
            background: "linear-gradient(135deg, rgba(0,136,255,0.08), rgba(97,85,245,0.08))",
            border: "1px solid rgba(0,136,255,0.10)",
          }}
        >
          <Icon className="w-8 h-8 text-[var(--accent-primary)]" style={{ opacity: 0.6 }} />
        </div>
        {/* 글로우 링 */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))",
            filter: "blur(12px)",
            transform: "scale(1.3)",
          }}
        />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-lg font-bold text-[var(--text-primary)] mb-1.5"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-sm text-[var(--text-secondary)] max-w-[280px] leading-relaxed"
        >
          {description}
        </motion.p>
      )}

      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="mt-5 px-6 py-2.5 text-white rounded-xl text-sm font-semibold
                     transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
            boxShadow: "0 4px 16px rgba(59,108,246,0.3)",
          }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
