"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

/** 좋아요 버튼 — 하트 팝 애니메이션 + optimistic update */
export function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = async () => {
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => (newLiked ? c + 1 : c - 1));

    if (newLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
    }

    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
      });
      if (!res.ok) {
        // 롤백
        setLiked(!newLiked);
        setCount((c) => (newLiked ? c - 1 : c + 1));
      }
    } catch {
      // 롤백
      setLiked(!newLiked);
      setCount((c) => (newLiked ? c - 1 : c + 1));
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-1.5 touch-target"
    >
      <div className="relative">
        <motion.div
          animate={
            isAnimating
              ? { scale: [1, 1.3, 1], transition: { duration: 0.4, type: "spring" } }
              : {}
          }
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors duration-150",
              liked
                ? "fill-red-500 text-red-500"
                : "text-[var(--text-muted)]"
            )}
          />
        </motion.div>

        {/* 파티클 효과 */}
        <AnimatePresence>
          {isAnimating && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-red-400"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((i * 60 * Math.PI) / 180) * 16,
                    y: Math.sin((i * 60 * Math.PI) / 180) * 16,
                    opacity: 0,
                    scale: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.1 }}
          className={cn(
            "text-sm tabular-nums",
            liked ? "text-red-500 font-semibold" : "text-[var(--text-muted)]"
          )}
        >
          {count}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
