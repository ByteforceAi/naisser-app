"use client";

import { cn } from "@/lib/utils/cn";
import {
  Inbox,
  type LucideIcon,
} from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = IconComponent || Inbox;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-6 py-2.5 bg-[var(--accent-primary)] text-white rounded-xl text-sm font-semibold
                     shadow-btn-primary hover:shadow-btn-primary-hover
                     transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0
                     touch-target"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
