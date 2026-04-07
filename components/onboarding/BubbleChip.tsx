"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface BubbleChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  /** 방사형 스프링 등장용 딜레이 (초) */
  delay?: number;
}

/**
 * 버블칩 — 글래스모피즘 + 스프링 바운스
 *
 * ① 글래스모피즘: backdrop-blur + 반투명 + 상단 하이라이트
 * ② 선택 시: 그라데이션 + 글로우 오라 + 체크마크 SVG 드로잉
 * ③ Pop bounce: 선택 scale(1→1.1→1), 해제 scale(0.92→1.05→1)
 * ④ 리플: 클릭 좌표에서 원형 확산
 */
export function BubbleChip({
  label,
  selected,
  onClick,
  delay = 0,
}: BubbleChipProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // 리플 이펙트
      const rect = e.currentTarget.getBoundingClientRect();
      setRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        key: Date.now(),
      });
      onClick();
    },
    [onClick]
  );

  return (
    <motion.button
      ref={btnRef}
      initial={{ opacity: 0, scale: 0, y: 12 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        delay,
        type: "spring",
        stiffness: 320,
        damping: 14,
        mass: 0.8,
      }}
      // Pop bounce on select/deselect
      whileTap={{ scale: 0.92 }}
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center gap-2 px-5 py-3 rounded-full",
        "text-[15px] font-medium select-none touch-target",
        "transition-all duration-250 overflow-hidden",
        selected
          ? // ─── 선택 상태: 그라데이션 + 글로우 오라 ───
            "text-white shadow-lg"
          : // ─── 미선택: 글래스모피즘 ───
            "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      )}
      style={
        selected
          ? {
              background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
              boxShadow: "0 4px 20px rgba(59,108,246,0.35), 0 0 0 1px rgba(59,108,246,0.15)",
            }
          : {
              background: "var(--glass-bg, rgba(255,255,255,0.65))",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1.5px solid var(--glass-border)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.04)",
            }
      }
    >
      {/* ─── 글래스 상단 하이라이트 라인 (미선택) ─── */}
      {!selected && (
        <span
          className="absolute top-0 left-[10%] right-[10%] h-[1px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
          }}
        />
      )}

      {/* ─── 선택 시 글로우 오라 (뒤쪽 blur) ─── */}
      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 -z-10 rounded-full pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
              filter: "blur(12px)",
              opacity: 0.4,
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── 체크마크 SVG 드로잉 애니메이션 ─── */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.svg
            key="check"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 15,
            }}
          >
            <motion.path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            />
          </motion.svg>
        )}
      </AnimatePresence>

      <span className="relative z-10">{label}</span>

      {/* ─── 리플 이펙트 ─── */}
      <AnimatePresence>
        {ripple && (
          <motion.span
            key={ripple.key}
            initial={{ width: 0, height: 0, opacity: 0.35 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onAnimationComplete={() => setRipple(null)}
            className="absolute rounded-full pointer-events-none -z-0"
            style={{
              left: ripple.x - 100,
              top: ripple.y - 100,
              background: selected
                ? "rgba(255,255,255,0.3)"
                : "rgba(59,108,246,0.15)",
            }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
