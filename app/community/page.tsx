"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import {
  Pen,
  MessageCircle,
  Heart,
  BarChart3,
  Bookmark,
  MoreHorizontal,
  Repeat2,
  X,
  Copy,
  Flag,
  EyeOff,
  Share2,
  Send,
  ArrowUpDown,
  Eye,
  ChevronDown,
  MapPin,
  Search,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { renderRichText } from "@/lib/utils/richText";

// ═══ 타입 ═══

interface PostData {
  id: string;
  authorId: string;
  authorName?: string;
  authorImage?: string | null;
  authorBadge?: string; // "certified" | "earlybird" | null
  body: string;
  category: string;
  images?: string[];
  likeCount: number;
  helpfulCount: number;
  commentCount: number;
  viewCount?: number;
  tags?: string[];
  pollQuestion?: string;
  pollOptions?: string[];
  pollVotes?: string;
  createdAt: string;
  isPinned?: boolean;
  authorTopics?: string[];
  authorRegions?: string[];
  previewComments?: {
    id: string;
    authorId: string;
    authorName?: string;
    authorImage?: string | null;
    content: string;
    authorTopics?: string[];
    authorRegions?: string[];
  }[];
}

// ═══ 상수 ═══

const TABS = [
  { id: "hot", label: "HOT" },
  { id: "price", label: "단가" },
  { id: "knowhow", label: "노하우" },
  { id: "info", label: "정보" },
  { id: "chat", label: "수다" },
];

const CATEGORY_NOTICES: Record<string, string> = {
  price: "실제 강사료, 교통비 등 단가 정보를 공유하는 공간입니다.",
  knowhow: "수업 팁, 교구 추천, 학생 관리법 등을 나누는 공간입니다.",
  info: "교육청 공고, 입찰 정보, 연수 일정 등을 공유해주세요.",
  chat: "강사 생활의 이런저런 이야기를 편하게 나누세요.",
  hot: "좋아요와 댓글이 많은 인기 게시글입니다.",
};

const REGION_LABEL_MAP: Record<string, string> = {
  metropolitan: "수도권", seoul: "서울", incheonGyeonggi: "인천경기",
  daejeonChungnam: "대전충남", chungbuk: "충북",
  busanGyeongnam: "부산경남", busanUlsanGyeongnam: "부산울산경남",
  daeguGyeongbuk: "대구경북", gangwon: "강원",
  gwangjuJeonnam: "광주전남", jeonbuk: "전북", jeju: "제주",
};

const PROFILE_COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

// ═══ 시드 데이터 (개발/폴백) ═══

const SEED_POSTS: PostData[] = [
  {
    id: "s1", authorId: "u-abc12", authorName: "김하늘", category: "price",
    body: "서울 초등 흡연예방 2시간 18만원\n다른 분들은 어떠세요?",
    tags: [],
    likeCount: 45, helpfulCount: 28, commentCount: 12, viewCount: 287,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    authorTopics: ["smokingPrevention"], authorRegions: ["seoul"], images: [],
    previewComments: [
      { id: "c1", authorId: "u-def34", authorName: "오민석", content: "경기도는 15만원 정도예요", authorTopics: ["smokingPrevention"], authorRegions: ["incheonGyeonggi"] },
      { id: "c2", authorId: "u-ghi56", authorName: "강지은", content: "부산은 12~15 사이입니다", authorTopics: ["smokingPrevention"], authorRegions: ["busanGyeongnam"] },
    ],
  },
  {
    id: "s2", authorId: "u-jkl78", authorName: "박진우", category: "knowhow",
    body: "진로 수업 팁인데\n실제 직업인 인터뷰 영상 5분짜리 3개 틀어주면\n2시간이 훨씬 수월해요",
    tags: [],
    likeCount: 67, helpfulCount: 42, commentCount: 8, viewCount: 412,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    authorTopics: ["careerJob"], authorRegions: ["metropolitan"], images: [],
    previewComments: [
      { id: "c3", authorId: "u-mno90", authorName: "윤재호", content: "영상 어디서 구하세요?", authorTopics: ["careerJob"], authorRegions: ["seoul"] },
    ],
  },
  {
    id: "s3", authorId: "u-pqr12", authorName: "이서연", category: "info", isPinned: true,
    body: "서울시교육청 하반기 강사 공모 시작\n4/1~4/15 접수\n분야: 흡연예방, 성인지, 진로직업",
    tags: ["서울시교육청"],
    likeCount: 89, helpfulCount: 55, commentCount: 15, viewCount: 631,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    authorTopics: ["genderAwareness"], authorRegions: ["seoul"], images: [],
    previewComments: [
      { id: "c4", authorId: "u-stu34", authorName: "배수진", content: "올해도 도전해봐야겠어요", authorTopics: ["smokingPrevention"], authorRegions: ["seoul"] },
      { id: "c5", authorId: "u-vwx56", authorName: "임도현", content: "경기도는 언제 나오나요", authorTopics: ["careerJob"], authorRegions: ["incheonGyeonggi"] },
    ],
  },
  {
    id: "s4", authorId: "u-yza78", authorName: "최민정", category: "chat",
    body: "오늘 수업 끝나고 복도에서\n\"선생님 다음에 또 오세요!\"\n이 일 하길 잘했다 싶었습니다",
    tags: [],
    likeCount: 112, helpfulCount: 5, commentCount: 23, viewCount: 189,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    authorTopics: ["characterBullying"], authorRegions: ["daejeonChungnam"], images: [],
    previewComments: [
      { id: "c6", authorId: "u-bcd90", authorName: "송미래", content: "그런 순간이 다 보상해주죠", authorTopics: ["music"], authorRegions: ["seoul"] },
    ],
  },
  {
    id: "s5", authorId: "u-hij34", authorName: "정우성", category: "price",
    body: "경기도 중학교 AI디지털 단가 얼마 받으세요?",
    tags: [],
    likeCount: 23, helpfulCount: 8, commentCount: 6, viewCount: 142,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    authorTopics: ["aiDigital"], authorRegions: ["incheonGyeonggi"], images: [],
    pollQuestion: "AI디지털 2시간 기준",
    pollOptions: ["10만원 이하", "10~15만원", "15~20만원", "20만원 이상"],
    pollVotes: JSON.stringify({ "0": ["a","b"], "1": ["c","d","e","f","g"], "2": ["h","i","j","k"], "3": ["l"] }),
    previewComments: [],
  },
  {
    id: "s6", authorId: "u-klm56", authorName: "한소희", category: "knowhow",
    body: "요리 수업 가기 전에 조리실 꼭 사전답사 하세요\n학교마다 장비가 다 달라서 현장에서 당황함",
    tags: ["요리수업"],
    likeCount: 34, helpfulCount: 31, commentCount: 4, viewCount: 98,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    authorTopics: ["cookingBaking"], authorRegions: ["busanGyeongnam"], images: [],
    previewComments: [
      { id: "c8", authorId: "u-nop78", authorName: "권유나", content: "맞아요 저도 한번 당한 적 있어요 ㅠ", authorTopics: ["cookingBaking"], authorRegions: ["daeguGyeongbuk"] },
    ],
  },
  {
    id: "s7", authorId: "u-qrs90", authorName: "나현수", category: "chat",
    body: "비 오는 날 수업 가는 거 진짜 싫다",
    tags: [],
    likeCount: 78, helpfulCount: 2, commentCount: 31, viewCount: 445,
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    authorTopics: ["sportsPhysical"], authorRegions: ["incheonGyeonggi"], images: [],
    previewComments: [
      { id: "c9", authorId: "u-tuv12", authorName: "김도윤", content: "ㅋㅋㅋ 공감", authorTopics: ["music"], authorRegions: ["seoul"] },
    ],
  },
  {
    id: "s8", authorId: "u-wxy34", authorName: "서지민", category: "info",
    body: "내일까지 입찰 마감인데 아는 분 계세요?\n인천 남동구 초등학교 성인지 교육",
    tags: [],
    likeCount: 15, helpfulCount: 9, commentCount: 3, viewCount: 76,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    authorTopics: ["genderAwareness"], authorRegions: ["incheonGyeonggi"], images: [],
    previewComments: [],
  },
];

// ═══ 유틸 ═══

function hashColor(userId: string): string {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) | 0;
  return PROFILE_COLORS[Math.abs(h) % PROFILE_COLORS.length];
}

function anonLabel(topics?: string[], regions?: string[]): string {
  const T: Record<string, string> = {
    smokingPrevention: "흡연예방", genderAwareness: "성인지", careerJob: "진로직업",
    cookingBaking: "요리", sportsPhysical: "체육", music: "음악",
    environmentEcology: "환경", characterBullying: "인성교육", aiDigital: "AI디지털",
    readingWriting: "독서", science: "과학", multicultural: "다문화", etc: "기타",
  };
  const t = topics?.[0] ? (T[topics[0]] || "강사") : "강사";
  const r = regions?.[0] ? (REGION_LABEL_MAP[regions[0]] || "") : "";
  return r ? `${t} \u00b7 ${r}` : t;
}

function ago(d: string): string {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간`;
  const dy = Math.floor(h / 24);
  if (dy < 7) return `${dy}일`;
  return new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function viewStr(n?: number): string {
  if (!n) return "";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// ═══ 아바타 ═══

function Avatar({ id, src, name, size = 36 }: { id: string; src?: string | null; name?: string; size?: number }) {
  const c = hashColor(id);
  const initial = name ? name.charAt(0) : id.slice(-2).toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 overflow-hidden relative"
      style={{ width: size, height: size, background: src ? "transparent" : `linear-gradient(145deg, ${c}, ${c}88)` }}
    >
      {src ? (
        <Image src={src} alt={name || "프로필"} fill className="object-cover" sizes={`${size}px`} />
      ) : (
        <span className="text-white font-bold select-none" style={{ fontSize: size * 0.32 }}>
          {initial}
        </span>
      )}
    </div>
  );
}

// ═══ 롤링 숫자 ═══

function Num({ v }: { v: number }) {
  if (!v) return null;
  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={v}
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -6, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="inline-block tabular-nums"
      >{v}</motion.span>
    </AnimatePresence>
  );
}

// ═══ 더블탭 하트 버스트 ═══

function HeartBurst({ show, onDone }: { show: boolean; onDone: () => void }) {
  useEffect(() => { if (show) { const t = setTimeout(onDone, 800); return () => clearTimeout(t); } }, [show, onDone]);
  if (!show) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: [0, 1.2, 1, 0], rotate: [-10, 5, 0, 0] }}
        transition={{ duration: 0.7, times: [0, 0.3, 0.5, 1] }}
      >
        <Heart className="w-10 h-10 text-red-500 fill-red-500 drop-shadow-lg" />
      </motion.div>
    </div>
  );
}

// ═══ 투표 ═══

function Poll({ question, options, votesJson }: { question: string; options: string[]; votesJson?: string }) {
  const votes: Record<string, string[]> = votesJson ? JSON.parse(votesJson) : {};
  const total = Object.values(votes).reduce((s, a) => s + a.length, 0);
  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
        <BarChart3 className="w-3.5 h-3.5" />{question}
      </p>
      {options.map((opt, i) => {
        const pct = total > 0 ? Math.round(((votes[String(i)]?.length || 0) / total) * 100) : 0;
        return (
          <motion.button key={i} whileTap={{ scale: 0.98 }}
            className="w-full relative overflow-hidden rounded-xl py-2.5 px-3 text-left text-[13px]"
            style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="absolute inset-y-0 left-0 rounded-xl" style={{ background: "rgba(59,108,246,0.08)" }} />
            <span className="relative z-10 flex justify-between">
              <span className="text-[var(--text-primary)]">{opt}</span>
              <span className="text-[var(--text-muted)] tabular-nums font-medium">{pct}%</span>
            </span>
          </motion.button>
        );
      })}
      <p className="text-[11px] text-[var(--text-muted)]">{total}명 참여</p>
    </div>
  );
}

// ═══ 쉬머 스켈레톤 ═══

function Shimmer() {
  return (
    <div>
      <style>{`
        @keyframes shimmerSlide {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .shimmer-bar {
          background: linear-gradient(90deg, var(--subtle-bg) 25%, rgba(0,0,0,0.06) 50%, var(--subtle-bg) 75%);
          background-size: 200% 100%;
          animation: shimmerSlide 1.5s infinite;
          border-radius: 4px;
        }
      `}</style>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex px-4 py-3" style={{ gap: 12 }}>
          <div style={{ width: 48 }} className="flex justify-center pt-1">
            <div className="w-9 h-9 rounded-full shimmer-bar" />
          </div>
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="w-28 h-3.5 shimmer-bar" />
            <div className="w-full h-3.5 shimmer-bar" />
            <div className="w-3/5 h-3.5 shimmer-bar" />
            <div className="flex gap-5 pt-1.5">
              <div className="w-10 h-3 shimmer-bar" />
              <div className="w-10 h-3 shimmer-bar" />
              <div className="w-10 h-3 shimmer-bar" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══ 더보기 메뉴 ═══

function MoreMenu({ show, onClose, postId, isOwner }: { show: boolean; onClose: () => void; postId: string; isOwner?: boolean }) {
  const router = useRouter();
  if (!show) return null;
  const acts = [
    ...(isOwner ? [
      { label: "수정하기", icon: Pen, fn: () => { router.push(`/community/write?edit=${postId}`); }, danger: false },
      { label: "삭제하기", icon: X, fn: async () => {
        if (confirm("정말 삭제하시겠습니까?")) {
          await fetch(`/api/community/posts/${postId}`, { method: "DELETE" });
          router.refresh();
        }
        onClose();
      }, danger: true },
    ] : []),
    { label: "링크 복사", icon: Copy, fn: () => { navigator.clipboard?.writeText(`${location.origin}/community/post/${postId}`); onClose(); } },
    { label: "공유하기", icon: Share2, fn: onClose },
    ...(!isOwner ? [
      { label: "이 사람 뮤트", icon: EyeOff, fn: () => {
        try {
          const muted = JSON.parse(localStorage.getItem("naisser_muted") || "[]");
          if (!muted.includes(postId)) { muted.push(postId); localStorage.setItem("naisser_muted", JSON.stringify(muted)); }
        } catch { /* */ }
        onClose();
      } },
      { label: "신고하기", icon: Flag, fn: onClose, danger: true },
    ] : []),
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] mx-4 mb-8 overflow-hidden"
        style={{
          borderRadius: "var(--liquid-radius-sheet)",
          background: "var(--liquid-bg)",
          backdropFilter: "blur(var(--liquid-frost)) saturate(1.4)",
          WebkitBackdropFilter: "blur(var(--liquid-frost)) saturate(1.4)",
          border: "0.5px solid rgba(255,255,255,0.5)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}>
        <div className="p-1">
          {acts.map((a) => (
            <motion.button key={a.label} whileTap={{ scale: 0.97 }} onClick={a.fn}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-medium
                ${a.danger ? "text-red-500" : "text-[var(--text-primary)]"}`}>
              <a.icon className="w-4 h-4" strokeWidth={1.5} />{a.label}
            </motion.button>
          ))}
        </div>
        <div className="h-[0.5px] bg-black/5" />
        <button onClick={onClose} className="w-full py-3.5 text-center text-[13px] font-semibold text-[var(--text-muted)]">
          취소
        </button>
      </motion.div>
    </motion.div>
  );
}

// ═══ 인라인 댓글 입력 ═══

function QuickReply({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 80); }, []);
  const submit = async () => {
    if (!text.trim()) return;
    await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    });
    setText(""); onClose();
  };
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 mt-1 mx-4 rounded-xl bg-[var(--subtle-bg)] border border-[var(--subtle-border)]">
        <input ref={ref} value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="답글 달기..." className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--text-muted)]" />
        <motion.button whileTap={{ scale: 0.85 }} onClick={submit} disabled={!text.trim()}
          className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30"
          style={{ background: text.trim() ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)" : "transparent" }}>
          <Send className="w-3.5 h-3.5" style={{ color: text.trim() ? "white" : "var(--text-muted)" }} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ═══ 링크 프리뷰 카드 ═══

function LinkPreview({ url }: { url: string }) {
  const [data, setData] = useState<{ title: string; description: string; image: string; siteName: string } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (json.data?.title) setData(json.data);
      } catch { /* */ }
    })();
  }, [url]);

  if (!data) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="block mt-2.5 rounded-xl overflow-hidden border border-[var(--subtle-border)] hover:border-black/[0.1] transition-colors">
      {data.image && (
        <div className="h-32 bg-[var(--bg-elevated)]"
          style={{ backgroundImage: `url(${data.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      )}
      <div className="px-3 py-2.5">
        {data.siteName && <p className="text-[11px] text-[var(--text-muted)] mb-0.5">{data.siteName}</p>}
        <p className="text-[13px] font-semibold text-[var(--text-primary)] line-clamp-1">{data.title}</p>
        {data.description && (
          <p className="text-[10.5px] text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-relaxed">{data.description}</p>
        )}
      </div>
    </a>
  );
}

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/);
  return match ? match[0] : null;
}

// ═══ 광고 슬롯 ═══

function AdSlot() {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(0,0,0,0.015)", border: "1px solid rgba(0,0,0,0.03)" }}>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed line-clamp-1">
            강사 프로필을 완성하면 더 많은 수업 기회를 받을 수 있어요
          </p>
        </div>
        <Link href="/instructor/profile/edit"
          className="shrink-0 text-[11px] font-semibold text-[var(--accent-primary)]">
          바로가기
        </Link>
        <span className="shrink-0 text-[11px] font-bold px-1 py-0.5 rounded"
          style={{ color: "var(--text-secondary)", background: "var(--subtle-bg)" }}>AD</span>
      </div>
    </div>
  );
}

// ═══ 포스트 카드 ═══

function Card({ post, i, onZoom, userId }: { post: PostData; i: number; onZoom: (src: string) => void; userId?: string }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeN, setLikeN] = useState(post.likeCount);
  // helpful 상태는 내부 알고리즘용으로만 유지 (UI에서 제거)
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(false);
  const [menu, setMenu] = useState(false);
  const [reply, setReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lastTap = useRef(0);
  const longTimer = useRef<NodeJS.Timeout>();

  // 읽음 페이드
  const cardRef = useRef<HTMLElement>(null);
  const [read, setRead] = useState(false);
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && e.boundingClientRect.top < 0) setRead(true);
    }, { threshold: 0, rootMargin: "0px 0px -80% 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const doubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300 && !liked) {
      setLiked(true); setLikeN((c) => c + 1); setBurst(true);
      fetch(`/api/community/posts/${post.id}/like`, { method: "POST" });
    }
    lastTap.current = now;
  }, [liked, post.id]);

  const color = hashColor(post.authorId);
  const label = anonLabel(post.authorTopics, post.authorRegions);
  const hasReplies = (post.previewComments?.length || 0) > 0;

  return (
    <motion.article
      ref={cardRef as React.Ref<HTMLElement>}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      whileInView={{ opacity: read ? 0.5 : 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      style={{ transition: "opacity 0.5s ease" }}
      onClick={doubleTap}
      onTouchStart={() => { longTimer.current = setTimeout(() => setMenu(true), 500); }}
      onTouchEnd={() => clearTimeout(longTimer.current)}
      onTouchMove={() => clearTimeout(longTimer.current)}
    >
      <HeartBurst show={burst} onDone={() => setBurst(false)} />

      <div className="flex px-4 py-3" style={{ gap: 12 }}>
        {/* 아바타 — Threads: 36px, container 48px */}
        <div className="flex flex-col items-center shrink-0" style={{ width: 48 }}>
          <button onClick={(e) => { e.stopPropagation(); router.push(`/instructor/${post.authorId}`); }}
            style={{ paddingTop: 4 }}>
            <Avatar id={post.authorId} src={post.authorImage} name={post.authorName} size={36} />
          </button>
          {hasReplies && showReplies && (
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.2 }}
              className="flex-1 w-[2px] mt-2 origin-top rounded-full"
              style={{ background: `linear-gradient(180deg, ${color}25, transparent)` }} />
          )}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          {/* 헤더 — Threads: 이름14/600 · 핸들14/400/#999 · 시간14/400/#999 */}
          <div className="flex items-center justify-between" style={{ height: 21 }}>
            <button onClick={(e) => { e.stopPropagation(); router.push(`/instructor/${post.authorId}`); }}
              className="flex items-center gap-1.5 min-w-0">
              <span className="text-[14px] font-bold truncate text-[var(--text-primary)]">
                {post.authorName || label}
              </span>
              {post.authorTopics?.[0] && (
                <span className="text-[14px] font-normal shrink-0" style={{ color: "var(--text-secondary)" }}>
                  {anonLabel(post.authorTopics)}
                </span>
              )}
              {post.isPinned && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 flex items-center gap-0.5"
                  style={{ background: "rgba(37,99,235,0.06)", color: "var(--accent-primary)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 2l-4 4-3.5-2L4 8.5 8.5 13 2 22l9-6.5L15.5 20 20 15.5l-2-3.5 4-4z"/></svg>
                  고정
                </span>
              )}
            </button>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                {ago(post.createdAt)}
                {post.viewCount ? ` · ${viewStr(post.viewCount)}` : ""}
              </span>
              <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); setMenu(true); }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--subtle-hover)]">
                <MoreHorizontal className="w-[18px] h-[18px]" style={{ color: "var(--text-secondary)" }} />
              </motion.button>
            </div>
          </div>

          {/* 본문 — Threads: 이름↔본문 2px, 한글 lh 1.6 */}
          <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 2 }}>
            <div className="text-[15px] text-[var(--text-primary)]" style={{ lineHeight: 1.6, letterSpacing: 0, wordBreak: "keep-all", overflowWrap: "break-word" }}>
              {post.body.length > 180 && !expanded
                ? renderRichText(post.body.slice(0, 180))
                : renderRichText(post.body)}
              {post.tags && post.tags.length > 0 && (expanded || post.body.length <= 180) && (
                <span style={{ color: "var(--text-secondary)" }}>
                  {" "}{post.tags.map((t) => `#${t}`).join(" ")}
                </span>
              )}
            </div>
            {post.body.length > 180 && !expanded && (
              <button onClick={() => setExpanded(true)}
                className="text-[13px] text-[var(--text-muted)] font-medium mt-0.5">
                ...더 보기
              </button>
            )}
          </div>

          {/* 링크 프리뷰 */}
          {(() => { const u = extractFirstUrl(post.body); return u ? <LinkPreview url={u} /> : null; })()}

          {/* 이미지 — blur-up 로딩 */}
          {post.images && post.images.length > 0 && (
            <div className="flex gap-2 mt-2.5 overflow-x-auto scrollbar-hide -mr-4 pr-4">
              {post.images.slice(0, 4).map((img, j) => (
                <motion.div key={j} whileTap={{ scale: 0.97 }}
                  onClick={(e) => { e.stopPropagation(); if (img) onZoom(img); }}
                  className="shrink-0 rounded-xl overflow-hidden cursor-pointer relative"
                  style={{
                    width: post.images!.length === 1 ? "100%" : 150,
                    height: post.images!.length === 1 ? 180 : 110,
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}>
                  {/* 블러 플레이스홀더 */}
                  <div className="absolute inset-0 bg-[var(--bg-elevated)]"
                    style={{ filter: "blur(20px)", transform: "scale(1.1)" }} />
                  {img && (
                    <Image src={img} alt="게시글 이미지" fill
                      className="object-cover transition-opacity duration-300"
                      sizes={post.images!.length === 1 ? "100vw" : "150px"}
                      loading="lazy"
                      onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = "1"; }}
                      style={{ opacity: 0 }} />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* 투표 */}
          {post.pollQuestion && post.pollOptions && (
            <Poll question={post.pollQuestion} options={post.pollOptions} votesJson={post.pollVotes} />
          )}

          {/* 반응 바 — Threads: 아이콘20px, 카운트14px, stroke1.5, 좌측정렬 */}
          <div className="flex items-center -ml-2" style={{ marginTop: 8 }}>
            <motion.button onClick={(e) => { e.stopPropagation(); const n = !liked; setLiked(n); setLikeN((c) => n ? c+1 : Math.max(c-1,0)); if (n) setBurst(true); fetch(`/api/community/posts/${post.id}/like`, { method: "POST" }); }}
              whileTap={{ scale: 0.85 }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[14px] touch-target"
              style={{ color: liked ? "var(--accent-danger)" : "var(--text-secondary)" }}>
              <motion.div animate={liked ? { scale: [1, 1.3, 0.9, 1.1, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
                <Heart className="w-5 h-5" fill={liked ? "#EF4444" : "none"} strokeWidth={liked ? 0 : 1.5} />
              </motion.div>
              <Num v={likeN} />
            </motion.button>

            <motion.button onClick={(e) => { e.stopPropagation(); setShowReplies(!showReplies); if (!showReplies) setReply(false); }}
              whileTap={{ scale: 0.85 }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[14px] touch-target"
              style={{ color: "var(--text-secondary)" }}>
              <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
              <Num v={post.commentCount} />
            </motion.button>

            <motion.button whileTap={{ scale: 0.85, rotate: 180 }} transition={{ type: "spring", stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1.5 rounded-full touch-target" style={{ color: "var(--text-secondary)" }}>
              <Repeat2 className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>

            <motion.button onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
              whileTap={{ scale: 0.7 }}
              className="ml-auto px-2 py-1.5 rounded-full touch-target"
              style={{ color: saved ? "var(--accent-primary)" : "var(--text-secondary)" }}>
              <motion.div animate={saved ? { scale: [1, 1.3, 0.85, 1.1, 1], y: [0, -3, 1, 0] } : { scale: 1 }}
                transition={{ duration: 0.4 }}>
                <Bookmark className="w-5 h-5" fill={saved ? "var(--accent-primary)" : "none"} strokeWidth={saved ? 0 : 1.5} />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* 답글 (접힌 상태 → 펼치기) */}
      <AnimatePresence>
        {showReplies && hasReplies && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="overflow-hidden pl-[54px] pr-4 pb-1 space-y-2">
            {post.previewComments!.slice(0, 2).map((c, ci) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ci * 0.06 }} className="flex items-start gap-2">
                <Avatar id={c.authorId} src={c.authorImage} name={c.authorName} size={22} />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-bold mr-1 text-[var(--text-primary)]">
                    {c.authorName || anonLabel(c.authorTopics, c.authorRegions)}
                  </span>
                  <span className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {c.content.length > 80 ? c.content.slice(0, 80) + "\u2026" : c.content}
                  </span>
                </div>
              </motion.div>
            ))}
            {post.commentCount > 2 && (
              <Link href={`/community/post/${post.id}`} onClick={(e) => e.stopPropagation()}
                className="text-[11px] text-[var(--accent-primary)] font-semibold hover:underline inline-block">
                전체 {post.commentCount}개 보기
              </Link>
            )}
            {/* 빠른 답글 입력 */}
            <button onClick={(e) => { e.stopPropagation(); setReply(!reply); }}
              className="text-[10.5px] text-[var(--text-muted)] font-medium">
              {reply ? "닫기" : "답글 달기"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {reply && <QuickReply postId={post.id} onClose={() => setReply(false)} />}
      </AnimatePresence>

      {/* 더보기 메뉴 */}
      <MoreMenu show={menu} onClose={() => setMenu(false)} postId={post.id} isOwner={userId === post.authorId} />

      {/* 디바이더 — X스타일: 아바타(48px)+gap(12px) 이후부터 시작 */}
      <div className="h-[0.5px]"
        style={{ marginLeft: 76, marginRight: 16, background: "var(--divider)" }} />
    </motion.article>
  );
}

// ═══ 빈 상태 ═══

function Empty({ cat }: { cat: string }) {
  const m: Record<string, string> = {
    hot: "인기 게시글이 아직 없어요", price: "단가 이야기를 시작해보세요",
    knowhow: "수업 노하우를 공유해보세요", info: "유용한 정보를 나눠보세요",
    chat: "편하게 이야기 나눠요",
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-28 px-6 text-center">
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.04)" }}>
        <MessageCircle className="w-6 h-6 text-[var(--text-muted)]" style={{ opacity: 0.5 }} />
      </motion.div>
      <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">{m[cat] || "게시글이 없어요"}</p>
      <p className="text-[12px] text-[var(--text-muted)] mb-4">첫 글을 작성해보세요</p>
      <Link href={`/community/write?category=${cat === "hot" ? "chat" : cat}`}>
        <motion.button whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-[var(--text-primary)]"
          style={{ border: "1px solid var(--subtle-border)" }}>
          글 작성하기
        </motion.button>
      </Link>
    </motion.div>
  );
}

// ═══ 메인 ═══

export default function CommunityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [tab, setTab] = useState("hot");
  const [sort, setSort] = useState<"recommended" | "latest">("recommended");
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [newPostsBanner, setNewPostsBanner] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [regionSheet, setRegionSheet] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [myTopicFilter, setMyTopicFilter] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const REGION_FILTERS = [
    { id: null, label: "전국" },
    { id: "seoul", label: "서울" },
    { id: "incheonGyeonggi", label: "경기" },
    { id: "daejeonChungnam", label: "대전충남" },
    { id: "busanGyeongnam", label: "부산경남" },
    { id: "daeguGyeongbuk", label: "대구경북" },
    { id: "gwangjuJeonnam", label: "광주전남" },
    { id: "gangwon", label: "강원" },
    { id: "jeju", label: "제주" },
  ];

  // FAB 스크롤 방향
  const [fabShow, setFabShow] = useState(true);
  const prevY = useRef(0);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    if (y - prevY.current > 8) setFabShow(false);
    else if (prevY.current - y > 8) setFabShow(true);
    prevY.current = y;
  });

  // 피드 로드 (초기 + 탭 변경)
  const load = useCallback(async (category: string, sortBy: string, append = false) => {
    if (!append) { setLoading(true); setCursor(null); setHasMore(true); }
    else { setLoadingMore(true); }
    try {
      const p = new URLSearchParams({ limit: "20", boardType: "all" });
      if (category === "hot") p.set("category", "hot");
      else p.set("category", category);
      if (sortBy === "latest") p.set("sort", "latest");
      if (regionFilter) p.set("region", regionFilter);
      if (append && cursor) p.set("cursor", cursor);
      const res = await fetch(`/api/community/feed?${p}`);
      const json = await res.json();
      const newPosts = json.data || [];
      if (newPosts.length > 0) {
        setPosts((prev) => append ? [...prev, ...newPosts] : newPosts);
        setCursor(json.pagination?.nextCursor || null);
        setHasMore(json.pagination?.hasMore ?? newPosts.length >= 20);
      } else if (!append) {
        // 시드 데이터 폴백
        let f = category === "hot"
          ? [...SEED_POSTS].sort((a, b) => b.likeCount - a.likeCount)
          : SEED_POSTS.filter((p) => p.category === category);
        if (regionFilter) f = f.filter((p) => p.authorRegions?.includes(regionFilter));
        setPosts(f.length > 0 ? f : SEED_POSTS);
        setHasMore(false);
      }
    } catch {
      if (!append) {
        let f = category === "hot"
          ? [...SEED_POSTS].sort((a, b) => b.likeCount - a.likeCount)
          : SEED_POSTS.filter((p) => p.category === category);
        if (regionFilter) f = f.filter((p) => p.authorRegions?.includes(regionFilter));
        setPosts(f.length > 0 ? f : SEED_POSTS);
        setHasMore(false);
      }
    } finally { setLoading(false); setLoadingMore(false); }
  }, [regionFilter, cursor]);

  // 탭/정렬/지역 변경 시 초기 로드
  useEffect(() => { load(tab, sort); }, [tab, sort, regionFilter]);

  // 무한스크롤 — IntersectionObserver
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
        load(tab, sort, true);
      }
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadingMore, tab, sort, load]);

  // 새 글 배너 — 30초마다 체크
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const p = new URLSearchParams({ limit: "1", boardType: "all", category: tab });
        const res = await fetch(`/api/community/feed?${p}`);
        const json = await res.json();
        const latest = json.data?.[0];
        if (latest && posts.length > 0 && latest.id !== posts[0]?.id) {
          setNewPostsBanner(true);
        }
      } catch { /* */ }
    }, 30000);
    return () => clearInterval(interval);
  }, [tab, posts]);

  const isLoggedIn = !!session?.user;

  // 유저 분야 (세션에서 — 로그인 시)
  const [userTopics, setUserTopics] = useState<string[]>([]);
  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const json = await res.json();
          setUserTopics(json.data?.topics || []);
        }
      } catch { /* */ }
    })();
  }, [session]);

  // 검색 + 내분야 필터 (클라이언트사이드)
  let filteredPosts = posts;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter((p) =>
      p.body.toLowerCase().includes(q)
      || p.authorName?.toLowerCase().includes(q)
      || p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (myTopicFilter && userTopics.length > 0) {
    filteredPosts = filteredPosts.filter((p) =>
      p.authorTopics?.some((t) => userTopics.includes(t))
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      {/* 줌 모달 */}
      <AnimatePresence>
        {zoomImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl" onClick={() => setZoomImg(null)}>
            <button aria-label="닫기" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[var(--bg-surface)]/10 flex items-center justify-center" onClick={() => setZoomImg(null)}>
              <X className="w-5 h-5 text-white" />
            </button>
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              src={zoomImg} alt="" className="max-w-[95vw] max-h-[80vh] object-contain rounded-xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 지역 선택 바텀시트 */}

      {/* ═══ 헤더 — 초컴팩트 ═══ */}
      <header className="sticky top-0 z-40" style={{
        background: "var(--bg-grouped)",
        opacity: 0.95,
        backdropFilter: "blur(20px) saturate(1.8)",
      }}>
        <div className="max-w-[520px] mx-auto">
          {/* 검색 바 (열릴 때) */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden px-4 pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input ref={searchRef} value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="게시글, 작성자, 태그 검색..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] bg-[var(--subtle-bg)] border border-[var(--subtle-border)]
                                 outline-none focus:border-[var(--accent-primary)]/30 placeholder:text-[var(--text-muted)]" />
                  </div>
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="text-[13px] text-[var(--text-muted)] font-medium shrink-0">취소</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 탭 + 지역/정렬을 한 줄에 */}
          <div className="flex items-center px-4 pt-3">
            {/* 검색 아이콘 */}
            {!searchOpen && (
              <motion.button whileTap={{ scale: 0.9 }}
                aria-label="검색"
                onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
                className="mr-1 w-8 h-8 flex items-center justify-center rounded-full
                           hover:bg-[var(--subtle-hover)] transition-colors shrink-0">
                <Search className="w-4 h-4 text-[var(--text-muted)]" />
              </motion.button>
            )}

            {/* 탭 */}
            <div className="flex gap-0 flex-1 overflow-x-auto scrollbar-hide" style={{ touchAction: "pan-x" }}>
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button key={t.id} onClick={() => {
                      if (tab === t.id) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
                      setTab(t.id); if (t.id !== "hot") setSort("recommended");
                    }}
                    className={`relative px-3 pb-2.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-200
                      ${active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                    {t.label}
                    {active && (
                      <motion.div layoutId="tabLine"
                        className="absolute bottom-0 left-1.5 right-1.5 h-[2px] rounded-full bg-[var(--text-primary)]"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                    )}
                  </button>
                );
              })}
            </div>

          </div>
          <div className="h-[0.5px] bg-[var(--divider)]" />

        </div>
      </header>

      {/* "새 글이 있습니다" 배너 */}
      <AnimatePresence>
        {newPostsBanner && (
          <motion.button
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => { setNewPostsBanner(false); load(tab, sort); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full
                       text-[12px] font-semibold text-white shadow-lg"
            style={{ background: "var(--text-primary)" }}>
            ↑ 새 글이 있습니다
          </motion.button>
        )}
      </AnimatePresence>

      {/* 트렌딩 태그 */}
      {tab === "hot" && !searchOpen && (
        <div className="max-w-[520px] mx-auto px-4 pt-2 pb-1">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <span className="text-[11px] text-[var(--text-muted)] shrink-0">트렌딩</span>
            {["흡연예방", "서울시교육청", "단가인상", "AI수업", "진로직업"].map((tag) => (
              <button key={tag} onClick={() => { setSearchOpen(true); setSearchQuery(tag); }}
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium
                           text-[var(--text-secondary)] bg-[var(--subtle-bg)]
                           hover:bg-[var(--subtle-hover)] transition-colors">
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 피드 ═══ */}
      <div className="max-w-[520px] mx-auto mt-0.5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Shimmer />
            </motion.div>
          ) : filteredPosts.length > 0 ? (
            <motion.div key={tab + sort + searchQuery} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {filteredPosts.map((p, i) => (
                <div key={p.id}>
                  <Card post={p} i={i} onZoom={setZoomImg} userId={session?.user?.id as string | undefined} />
                  {(i + 1) % 5 === 0 && <AdSlot />}
                </div>
              ))}
              {/* 무한스크롤 센티넬 */}
              <div ref={loadMoreRef} className="h-1" />
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 rounded-full border-2 border-black/10 border-t-[var(--accent-primary)] animate-spin" />
                </div>
              )}
              {!hasMore && posts.length > 5 && (
                <p className="text-center text-[10.5px] text-[var(--text-muted)] py-8">
                  모든 글을 불러왔습니다
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Empty cat={tab} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ FAB ═══ */}
      {isLoggedIn && (
        <motion.div
          animate={{ scale: fabShow ? 1 : 0, opacity: fabShow ? 1 : 0, y: fabShow ? 0 : 16 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="fixed bottom-24 right-5 z-50">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.88 }}>
            <Link href={`/community/write?category=${tab === "hot" ? "chat" : tab}`}
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)", boxShadow: "0 6px 24px rgba(59,108,246,0.4)" }}>
              <Pen className="w-5 h-5 text-white" />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
