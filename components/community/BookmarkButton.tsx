"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface BookmarkButtonProps {
  postId: string;
  initialBookmarked: boolean;
}

/** 저장(북마크) 버튼 — optimistic update */
export function BookmarkButton({
  postId,
  initialBookmarked,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const handleToggle = async () => {
    const newVal = !bookmarked;
    setBookmarked(newVal);

    try {
      const res = await fetch(`/api/community/posts/${postId}/bookmark`, {
        method: "POST",
      });
      if (!res.ok) setBookmarked(!newVal);
    } catch {
      setBookmarked(!newVal);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className="touch-target"
    >
      <Bookmark
        className={cn(
          "w-5 h-5 transition-colors duration-150",
          bookmarked
            ? "fill-[var(--accent-primary)] text-[var(--accent-primary)]"
            : "text-[var(--text-muted)]"
        )}
      />
    </motion.button>
  );
}
