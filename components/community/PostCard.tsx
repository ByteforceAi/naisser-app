"use client";

import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

import { ImageGrid } from "./ImageGrid";
import { LikeButton } from "./LikeButton";
import { BookmarkButton } from "./BookmarkButton";
import { PostTypeTag } from "./PostTypeTag";
import { GradeBadge } from "./GradeBadge";
import type { GradeKey } from "./GradeBadge";
import { cn } from "@/lib/utils/cn";

export interface PostCardData {
  id: string;
  authorName: string;
  authorType: "instructor" | "teacher";
  authorGrade?: GradeKey;
  body: string;
  images?: string[];
  tags?: string[];
  postType: "case" | "question" | "info" | "free";
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
}

interface PostCardProps {
  post: PostCardData;
  index?: number;
}

/** Threads 스타일 카드 — staggered fadeIn */
export function PostCard({ post, index = 0 }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: "easeOut" as const }}
      whileTap={{ scale: 0.98 }}
      className="rounded-xl p-4"
      style={{ background: "var(--bg-grouped-secondary)" }}
    >
      {/* 작성자 헤더 */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold",
            post.authorType === "instructor"
              ? "bg-[var(--role-instructor)]"
              : "bg-[var(--role-teacher)]"
          )}
        >
          {post.authorName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold truncate">
              {post.authorName}
            </span>
            <span
              className={cn(
                "text-[11px] px-1.5 py-0.5 rounded-full font-medium",
                post.authorType === "instructor"
                  ? "bg-[rgba(0,122,255,0.08)] text-[#007AFF]"
                  : "bg-[rgba(52,199,89,0.08)] text-[#34C759]"
              )}
            >
              {post.authorType === "instructor" ? "강사" : "교사"}
            </span>
            {post.authorGrade && (
              <GradeBadge grade={post.authorGrade} size="sm" />
            )}
          </div>
          <span className="text-xs text-[var(--text-muted)]">{timeAgo}</span>
        </div>
        <PostTypeTag type={post.postType} />
      </div>

      {/* 본문 */}
      <Link href={`/community/post/${post.id}`}>
        <p className="text-sm leading-relaxed text-[var(--text-primary)] mb-3 line-clamp-4">
          {post.body}
        </p>

        {/* 이미지 그리드 */}
        {post.images && post.images.length > 0 && (
          <div className="mb-3">
            <ImageGrid images={post.images} />
          </div>
        )}
      </Link>

      {/* 태그 */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-[var(--accent-primary)] font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 인터랙션 바 */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--glass-border)]">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialLiked={post.isLiked}
            initialCount={post.likeCount}
          />
          <Link
            href={`/community/post/${post.id}`}
            className="flex items-center gap-1.5 text-[var(--text-muted)] touch-target"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm tabular-nums">{post.commentCount}</span>
          </Link>
        </div>
        <BookmarkButton
          postId={post.id}
          initialBookmarked={post.isBookmarked}
        />
      </div>
    </motion.article>
  );
}
