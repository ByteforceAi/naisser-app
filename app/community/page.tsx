"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Pen,
  MessageCircle,
  Heart,
  BarChart3,
  Flame,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// ═══════════════════════════════════════════
// 타입
// ═══════════════════════════════════════════

interface PostData {
  id: string;
  authorId: string;
  body: string;
  category: string;
  images?: string[];
  likeCount: number;
  commentCount: number;
  pollQuestion?: string;
  pollOptions?: string[];
  pollVotes?: string; // JSON
  createdAt: string;
  isPinned?: boolean;
  // 반익명 프로필용 (API에서 JOIN)
  authorTopics?: string[];
  authorRegions?: string[];
  // 인라인 답글 미리보기
  previewComments?: {
    id: string;
    authorId: string;
    content: string;
    authorTopics?: string[];
    authorRegions?: string[];
  }[];
}

// ═══════════════════════════════════════════
// 상수
// ═══════════════════════════════════════════

const CATEGORIES = [
  { id: "hot", label: "HOT", icon: Flame, color: "#EF4444" },
  { id: "price", label: "단가", icon: null, emoji: "💰" },
  { id: "knowhow", label: "노하우", icon: null, emoji: "📚" },
  { id: "info", label: "정보", icon: null, emoji: "📢" },
  { id: "chat", label: "수다", icon: null, emoji: "💬" },
  { id: "schools", label: "학교", icon: null, emoji: "🏫" },
] as const;

const PROFILE_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

// ═══════════════════════════════════════════
// 유틸
// ═══════════════════════════════════════════

function getProfileColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return PROFILE_COLORS[Math.abs(hash) % PROFILE_COLORS.length];
}

function getAnonymousLabel(topics?: string[], regions?: string[]): string {
  const TOPIC_MAP: Record<string, string> = {
    smokingPrevention: "흡연예방", genderAwareness: "성인지",
    disabilityMulticultural: "장애인식", careerJob: "진로직업",
    multicultural: "다문화", cookingBaking: "요리", sportsPhysical: "체육",
    readingWriting: "독서", science: "과학", music: "음악",
    environmentEcology: "환경", characterBullying: "인성교육",
    aiDigital: "AI디지털", staffTraining: "교직원연수", etc: "기타",
  };
  const REGION_MAP: Record<string, string> = {
    metropolitan: "수도권", seoul: "서울", incheonGyeonggi: "인천경기",
    daejeonChungnam: "대전충남", chungbuk: "충북",
    busanGyeongnam: "부산경남", busanUlsanGyeongnam: "부산울산경남",
    daeguGyeongbuk: "대구경북", gangwon: "강원",
    gwangjuJeonnam: "광주전남", jeonbuk: "전북", jeju: "제주",
  };
  const topic = topics?.[0] ? (TOPIC_MAP[topics[0]] || "강사") : "강사";
  const region = regions?.[0] ? (REGION_MAP[regions[0]] || "") : "";
  return region ? `${topic} · ${region}` : topic;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

// ═══════════════════════════════════════════
// 반익명 프로필 아바타
// ═══════════════════════════════════════════

function AnonAvatar({ userId, size = 32 }: { userId: string; size?: number }) {
  const color = getProfileColor(userId);
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        boxShadow: `0 2px 8px ${color}30`,
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.35 }}>
        {userId.slice(-2).toUpperCase()}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════
// 투표 컴포넌트
// ═══════════════════════════════════════════

function PollDisplay({
  question,
  options,
  votesJson,
}: {
  question: string;
  options: string[];
  votesJson?: string;
}) {
  const votes: Record<string, string[]> = votesJson ? JSON.parse(votesJson) : {};
  const totalVotes = Object.values(votes).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
        <BarChart3 className="w-3.5 h-3.5" />
        {question}
      </p>
      {options.map((opt, i) => {
        const count = votes[String(i)]?.length || 0;
        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        return (
          <button
            key={i}
            className="w-full relative overflow-hidden rounded-xl py-2.5 px-3 text-left text-sm
                       transition-all duration-200 hover:scale-[1.01]"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(0,0,0,0.06)",
            }}
          >
            {/* 배경 바 */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-xl"
              style={{ background: "rgba(59,108,246,0.1)" }}
            />
            <span className="relative z-10 flex justify-between">
              <span className="text-gray-700">{opt}</span>
              <span className="text-gray-400 tabular-nums">{pct}%</span>
            </span>
          </button>
        );
      })}
      <p className="text-[11px] text-gray-400">{totalVotes}명 참여</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// 포스트 카드 (스레드 스타일 + 인라인 답글)
// ═══════════════════════════════════════════

function CommunityCard({ post, index }: { post: PostData; index: number }) {
  const [liked, setLiked] = useState(false);

  const handleLike = useCallback(async () => {
    setLiked((prev) => !prev);
    fetch(`/api/community/posts/${post.id}/like`, { method: "POST" });
  }, [post.id]);

  const color = getProfileColor(post.authorId);
  const label = getAnonymousLabel(post.authorTopics, post.authorRegions);
  const categoryEmoji = CATEGORIES.find((c) => c.id === post.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-2xl p-4 transition-all duration-200 hover:shadow-md"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      {/* 작성자 */}
      <div className="flex items-center gap-2.5 mb-3">
        <AnonAvatar userId={post.authorId} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold" style={{ color }}>
              {label}
            </span>
            {post.isPinned && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
                📌 고정
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <span>{timeAgo(post.createdAt)}</span>
            {categoryEmoji && (
              <>
                <span>·</span>
                <span>{categoryEmoji.emoji || ""} {categoryEmoji.label}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <p className="text-[14px] leading-relaxed text-gray-800 whitespace-pre-wrap mb-3">
        {post.body.length > 200 ? post.body.slice(0, 200) + "..." : post.body}
      </p>

      {/* 이미지 */}
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-1.5 mb-3 rounded-xl overflow-hidden ${
          post.images.length === 1 ? "grid-cols-1" :
          post.images.length === 2 ? "grid-cols-2" :
          "grid-cols-2"
        }`}>
          {post.images.slice(0, 4).map((img, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
          ))}
        </div>
      )}

      {/* 투표 */}
      {post.pollQuestion && post.pollOptions && (
        <PollDisplay
          question={post.pollQuestion}
          options={post.pollOptions}
          votesJson={post.pollVotes}
        />
      )}

      {/* 반응 바 */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
        >
          <Heart
            className="w-4 h-4"
            fill={liked ? "#EF4444" : "none"}
            stroke={liked ? "#EF4444" : "currentColor"}
          />
          <span>{post.likeCount + (liked ? 1 : 0)}</span>
        </button>
        <Link
          href={`/community/post/${post.id}`}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.commentCount}</span>
        </Link>
      </div>

      {/* 인라인 답글 미리보기 (스레드 스타일) */}
      {post.previewComments && post.previewComments.length > 0 && (
        <div className="mt-3 space-y-2">
          {post.previewComments.slice(0, 2).map((comment) => {
            const cColor = getProfileColor(comment.authorId);
            const cLabel = getAnonymousLabel(comment.authorTopics, comment.authorRegions);
            return (
              <div key={comment.id} className="flex items-start gap-2 pl-2">
                <AnonAvatar userId={comment.authorId} size={24} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold mr-1.5" style={{ color: cColor }}>
                    {cLabel}
                  </span>
                  <span className="text-xs text-gray-600">
                    {comment.content.length > 60
                      ? comment.content.slice(0, 60) + "..."
                      : comment.content}
                  </span>
                </div>
              </div>
            );
          })}
          {post.commentCount > 2 && (
            <Link
              href={`/community/post/${post.id}`}
              className="flex items-center gap-1 pl-2 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              답글 {post.commentCount - 2}개 더 보기
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}
    </motion.article>
  );
}

// ═══════════════════════════════════════════
// 빈 상태
// ═══════════════════════════════════════════

function EmptyCommunity({ category }: { category: string }) {
  const messages: Record<string, { title: string; desc: string }> = {
    hot: { title: "아직 HOT 글이 없어요", desc: "좋아요와 댓글이 많은 글이 여기에 올라옵니다" },
    price: { title: "단가 이야기를 시작해보세요", desc: "올해 단가는 어떠세요? 첫 글을 남겨보세요" },
    knowhow: { title: "수업 노하우를 공유해보세요", desc: "선생님만의 팁이 다른 강사에게 큰 도움이 됩니다" },
    info: { title: "유용한 정보를 나눠보세요", desc: "교육청 공모, 입찰 정보 등을 공유해주세요" },
    chat: { title: "편하게 이야기 나눠요", desc: "같은 길을 걷는 동료 강사들과 대화해보세요" },
  };
  const msg = messages[category] || messages.chat;
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <MessageCircle className="w-7 h-7 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{msg.title}</h3>
      <p className="text-sm text-gray-400">{msg.desc}</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// 메인 페이지
// ═══════════════════════════════════════════

export default function CommunityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState("hot");
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  // 피드 로드
  const loadFeed = useCallback(async (category: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (category !== "hot") {
        params.set("boardType", "all");
        params.set("category", category);
      }
      const res = await fetch(`/api/community/feed?${params}`);
      const json = await res.json();
      setPosts(json.data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(activeCategory);
  }, [activeCategory, loadFeed]);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8F9FC" }}>
      {/* ─── 헤더 ─── */}
      <header className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{
          background: "rgba(248,249,252,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-[520px] mx-auto">
          <h1 className="text-lg font-bold text-gray-900 mb-3">
            강사 라운지
          </h1>

          {/* 카테고리 탭 */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.id === "schools") {
                      router.push("/community/schools");
                      return;
                    }
                    setActiveCategory(cat.id);
                  }}
                  className="shrink-0 px-4 py-2 rounded-full text-sm font-medium
                             transition-all duration-200 whitespace-nowrap"
                  style={
                    isActive
                      ? {
                          background: cat.id === "hot"
                            ? "linear-gradient(135deg, #EF4444, #F97316)"
                            : "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                          color: "white",
                          boxShadow: cat.id === "hot"
                            ? "0 2px 12px rgba(239,68,68,0.25)"
                            : "0 2px 12px rgba(59,108,246,0.25)",
                        }
                      : {
                          background: "rgba(255,255,255,0.65)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(0,0,0,0.06)",
                          color: "#6B7280",
                        }
                  }
                >
                  {cat.id === "hot" ? "🔥 " : cat.emoji ? cat.emoji + " " : ""}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ─── 피드 ─── */}
      <div className="max-w-[520px] mx-auto px-4 space-y-3 mt-3">
        <AnimatePresence mode="wait">
          {loading ? (
            // 스켈레톤
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100" />
                    <div className="space-y-1.5">
                      <div className="w-24 h-3 bg-gray-100 rounded" />
                      <div className="w-16 h-2.5 bg-gray-50 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-100 rounded" />
                    <div className="w-3/4 h-3 bg-gray-50 rounded" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : posts.length > 0 ? (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {posts.map((post, i) => (
                <CommunityCard key={post.id} post={post} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyCommunity category={activeCategory} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── FAB 글쓰기 ─── */}
      {session?.user && (
        <Link
          href={`/community/write?category=${activeCategory === "hot" ? "chat" : activeCategory}`}
          className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full
                     flex items-center justify-center
                     transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
          style={{
            background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
            boxShadow: "0 4px 20px rgba(59,108,246,0.35)",
          }}
        >
          <Pen className="w-5 h-5 text-white" />
        </Link>
      )}
    </div>
  );
}
