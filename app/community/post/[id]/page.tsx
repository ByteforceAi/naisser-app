"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Heart, MessageCircle, Send, BarChart3, ThumbsUp } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ═══ 타입 ═══
interface PostDetail {
  id: string;
  authorId: string;
  body: string;
  category: string;
  images?: string[];
  likeCount: number;
  helpfulCount: number;
  commentCount: number;
  pollQuestion?: string;
  pollOptions?: string[];
  pollVotes?: string;
  createdAt: string;
  authorTopics?: string[];
  authorRegions?: string[];
}

interface Comment {
  id: string;
  authorId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  authorTopics?: string[];
  authorRegions?: string[];
}

// ═══ 유틸 ═══
const PROFILE_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

function getColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return PROFILE_COLORS[Math.abs(h) % PROFILE_COLORS.length];
}

const TOPIC_MAP: Record<string, string> = {
  smokingPrevention: "흡연예방", genderAwareness: "성인지", careerJob: "진로직업",
  cookingBaking: "요리", sportsPhysical: "체육", music: "음악",
  environmentEcology: "환경", characterBullying: "인성교육", aiDigital: "AI디지털",
  staffTraining: "교직원연수", science: "과학", readingWriting: "독서",
  disabilityMulticultural: "장애인식", multicultural: "다문화", etc: "기타",
};
const REGION_MAP: Record<string, string> = {
  metropolitan: "수도권", seoul: "서울", incheonGyeonggi: "인천경기",
  daejeonChungnam: "대전충남", busanGyeongnam: "부산경남", busanUlsanGyeongnam: "부산울산경남",
  daeguGyeongbuk: "대구경북", gangwon: "강원", gwangjuJeonnam: "광주전남",
  jeonbuk: "전북", jeju: "제주", chungbuk: "충북",
};

function anonLabel(topics?: string[], regions?: string[]) {
  const t = topics?.[0] ? (TOPIC_MAP[topics[0]] || "강사") : "강사";
  const r = regions?.[0] ? (REGION_MAP[regions[0]] || "") : "";
  return r ? `${t} · ${r}` : t;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function Avatar({ userId, size = 32 }: { userId: string; size?: number }) {
  const c = getColor(userId);
  return (
    <div className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${c}, ${c}88)` }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.35 }}>
        {userId.slice(-2).toUpperCase()}
      </span>
    </div>
  );
}

// ═══ 메인 ═══
export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [helpful, setHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // 데이터 로드
  useEffect(() => {
    async function load() {
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`/api/community/posts/${postId}`),
          fetch(`/api/community/posts/${postId}/comments`),
        ]);
        const postJson = await postRes.json();
        const commentsJson = await commentsRes.json();
        setPost(postJson.data || null);
        setHelpfulCount(postJson.data?.helpfulCount ?? 0);
        setComments(commentsJson.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  // 좋아요
  const handleLike = useCallback(async () => {
    setLiked((p) => !p);
    fetch(`/api/community/posts/${postId}/like`, { method: "POST" });
  }, [postId]);

  // 도움됐어요
  const handleHelpful = useCallback(async () => {
    const wasHelpful = helpful;
    setHelpful((p) => !p);
    setHelpfulCount((prev) => wasHelpful ? Math.max(prev - 1, 0) : prev + 1);
    fetch(`/api/community/posts/${postId}/helpful`, { method: "POST" });
  }, [postId, helpful]);

  // 댓글 작성
  const handleComment = useCallback(async () => {
    if (!comment.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      if (res.ok) {
        const json = await res.json();
        setComments((prev) => [...prev, json.data]);
        setComment("");
      }
    } finally {
      setSending(false);
    }
  }, [comment, postId, sending]);

  if (loading) {
    return (
      <div className="min-h-screen page-bg-mesh page-bg-mesh-warm page-bg-dots flex items-center justify-center" >
        <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" >
        <p className="text-[var(--text-secondary)] mb-4">게시글을 찾을 수 없습니다</p>
        <button onClick={() => router.push("/community")} className="text-blue-500 text-sm font-medium">
          커뮤니티로 돌아가기
        </button>
      </div>
    );
  }

  const authorColor = getColor(post.authorId);
  const authorLabel = anonLabel(post.authorTopics, post.authorRegions);

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-warm page-bg-dots flex flex-col" >
      {/* 헤더 */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 community-header">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--subtle-hover)] transition-colors touch-target">
          <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
        </button>
        <h1 className="text-base font-semibold text-[var(--text-primary)]">게시글</h1>
      </header>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-[520px] mx-auto px-4 py-5">
          {/* 작성자 */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar userId={post.authorId} size={40} />
            <div>
              <span className="text-sm font-semibold" style={{ color: authorColor }}>{authorLabel}</span>
              <p className="text-[11px] text-[var(--text-muted)]">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {/* 본문 텍스트 */}
          <p className="text-[15px] leading-[1.8] text-[var(--text-primary)] whitespace-pre-wrap mb-4">
            {post.body}
          </p>

          {/* 투표 */}
          {post.pollQuestion && post.pollOptions && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" /> {post.pollQuestion}
              </p>
              {post.pollOptions.map((opt, i) => {
                const votes: Record<string, string[]> = post.pollVotes ? JSON.parse(post.pollVotes) : {};
                const total = Object.values(votes).reduce((s, a) => s + a.length, 0);
                const count = votes[String(i)]?.length || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <button key={i} className="w-full relative overflow-hidden rounded-xl py-3 px-4 text-left text-sm transition-all hover:scale-[1.01]"
                    style={{ background: "var(--subtle-bg)", border: "1px solid var(--subtle-border)" }}
                  >
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-y-0 left-0 rounded-xl" style={{ background: "rgba(59,108,246,0.12)" }}
                    />
                    <span className="relative z-10 flex justify-between">
                      <span className="text-[var(--text-secondary)]">{opt}</span>
                      <span className="text-[var(--text-muted)] tabular-nums">{pct}%</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 반응 */}
          <div className="flex items-center gap-5 py-3 border-y border-[var(--subtle-border)]">
            <button onClick={handleLike} className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-red-400 transition-colors">
              <Heart className="w-5 h-5" fill={liked ? "#EF4444" : "none"} stroke={liked ? "#EF4444" : "currentColor"} />
              {post.likeCount + (liked ? 1 : 0)}
            </button>
            <button
              onClick={handleHelpful}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: helpful ? "#3B82F6" : "#6B7280" }}
            >
              <ThumbsUp
                className="w-5 h-5"
                fill={helpful ? "#3B82F6" : "none"}
                stroke={helpful ? "#3B82F6" : "currentColor"}
              />
              도움됐어요 {helpfulCount > 0 ? helpfulCount : ""}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              <MessageCircle className="w-5 h-5" /> {comments.length}
            </span>
          </div>

          {/* 댓글 목록 */}
          <div className="mt-4 space-y-4">
            <AnimatePresence initial={false}>
              {comments.map((c) => {
                const cColor = getColor(c.authorId);
                const cLabel = anonLabel(c.authorTopics, c.authorRegions);
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2.5"
                  >
                    <Avatar userId={c.authorId} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: cColor }}>{cLabel}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-0.5 leading-relaxed">{c.content}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {comments.length === 0 && (
              <p className="text-center text-sm text-[var(--text-muted)] py-8">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
            )}
          </div>
        </div>
      </div>

      {/* 댓글 입력 (하단 고정) */}
      <div className="shrink-0 px-4 py-3 max-w-[520px] mx-auto w-full community-header"
        style={{ borderTop: "0.5px solid var(--subtle-border)" }}
      >
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            placeholder="댓글을 입력하세요..."
            className="flex-1 px-4 py-2.5 rounded-full text-[13px] focus:outline-none transition-all
                       bg-[var(--subtle-bg)] border border-[var(--subtle-border)]
                       text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            style={{
            }}
          />
          <motion.button
            onClick={handleComment}
            disabled={!comment.trim() || sending}
            animate={{
              scale: comment.trim() ? 1 : 0.9,
              opacity: comment.trim() ? 1 : 0.3,
            }}
            whileTap={comment.trim() ? { scale: 0.9 } : {}}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white touch-target"
            style={{
              background: comment.trim()
                ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)"
                : "#E5E7EB",
            }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
