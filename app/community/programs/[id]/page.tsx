"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ThumbsUp,
  Star,
  Users,
  Clock,
  Check,
  Download,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSession } from "next-auth/react";

// ═══════════════════════════════════════════
// 타입
// ═══════════════════════════════════════════

interface ReviewData {
  id: string;
  userId: string;
  rating: number;
  content?: string | null;
  createdAt: string;
}

interface ProgramDetailData {
  id: string;
  authorId: string;
  title: string;
  description: string;
  topic?: string | null;
  targetGrade?: string | null;
  duration?: string | null;
  maxStudents?: number | null;
  materialsCost?: string | null;
  includes?: string[] | null;
  images?: string[] | null;
  price: number;
  priceType: string;
  downloadUrl?: string | null;
  upvoteCount: number;
  usedCount: number;
  createdAt: string;
  reviews: ReviewData[];
  averageRating: number;
  reviewCount: number;
}

const TOPIC_MAP: Record<string, string> = {
  smokingPrevention: "흡연예방",
  genderAwareness: "성인지",
  disabilityMulticultural: "장애인식",
  careerJob: "진로직업",
  multicultural: "다문화",
  cookingBaking: "요리",
  sportsPhysical: "체육",
  readingWriting: "독서",
  science: "과학",
  music: "음악",
  environmentEcology: "환경",
  characterBullying: "인성교육",
  aiDigital: "AI디지털",
  staffTraining: "교직원연수",
  etc: "기타",
};

// ═══════════════════════════════════════════
// 이미지 갤러리
// ═══════════════════════════════════════════

function ImageGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, i) => (
            <div key={i} className="w-full shrink-0">
              <img
                src={img}
                alt={`프로그램 이미지 ${i + 1}`}
                className="w-full aspect-[16/9] object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          {/* 좌우 네비게이션 */}
          {current > 0 && (
            <button
              onClick={() => setCurrent((prev) => prev - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {current < images.length - 1 && (
            <button
              onClick={() => setCurrent((prev) => prev + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* 인디케이터 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                style={{
                  background:
                    i === current
                      ? "white"
                      : "rgba(255,255,255,0.5)",
                  width: i === current ? 12 : 6,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// 별점 표시
// ═══════════════════════════════════════════

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="transition-colors"
          style={{ width: size, height: size }}
          fill={i <= rating ? "#FBBF24" : "none"}
          stroke={i <= rating ? "#FBBF24" : "#D1D5DB"}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// 리뷰 카드
// ═══════════════════════════════════════════

function ReviewCard({ review }: { review: ReviewData }) {
  const date = new Date(review.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <StarRating rating={review.rating} size={14} />
        <span className="text-[11px] text-[var(--text-muted)]">{date}</span>
      </div>
      {review.content && (
        <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// 메인 페이지
// ═══════════════════════════════════════════

export default function ProgramDetailPage() {
  const router = useRouter();
  const params = useParams();
  const programId = params.id as string;
  const { data: session } = useSession();

  const [program, setProgram] = useState<ProgramDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);

  const loadProgram = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/programs/${programId}`);
      const json = await res.json();
      if (res.ok) {
        setProgram(json.data);
      }
    } catch {
      // 조용히 실패
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    if (programId) loadProgram();
  }, [programId, loadProgram]);

  const handleUpvote = async () => {
    if (!session?.user || !program) return;
    try {
      const res = await fetch(`/api/community/programs/${programId}/upvote`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok) {
        setUpvoted(json.data.upvoted);
        setProgram((prev) =>
          prev
            ? {
                ...prev,
                upvoteCount: json.data.upvoted
                  ? prev.upvoteCount + 1
                  : Math.max(prev.upvoteCount - 1, 0),
              }
            : prev
        );
      }
    } catch {
      // 조용히 실패
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen page-bg-mesh page-bg-mesh-warm page-bg-dots" >
        <div className="max-w-[520px] mx-auto px-4 pt-16 space-y-4 animate-pulse">
          <div className="w-full aspect-[16/9] bg-gray-100 rounded-2xl" />
          <div className="w-3/4 h-6 bg-gray-100 rounded" />
          <div className="w-1/2 h-4 bg-gray-50 rounded" />
          <div className="space-y-2">
            <div className="w-full h-3 bg-gray-100 rounded" />
            <div className="w-full h-3 bg-gray-100 rounded" />
            <div className="w-2/3 h-3 bg-gray-50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen page-bg-mesh page-bg-mesh-warm page-bg-dots flex items-center justify-center" >
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">프로그램을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-500 text-sm"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-warm page-bg-dots pb-32" >
      {/* ─── 헤더 ─── */}
      <header
        className="sticky top-0 z-40 px-4 py-3"
        style={{
          background: "rgba(248,249,252,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-[520px] mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-900 truncate flex-1">
            프로그램 상세
          </h1>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 mt-2">
        {/* ─── 이미지 갤러리 ─── */}
        {program.images && program.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ImageGallery images={program.images} />
          </motion.div>
        )}

        {/* ─── 기본 정보 ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mt-4"
        >
          {/* 가격 배지 */}
          <span
            className="inline-block text-xs px-3 py-1 rounded-full font-medium mb-3"
            style={{
              background:
                program.priceType === "free"
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(59,108,246,0.1)",
              color:
                program.priceType === "free" ? "#16A34A" : "#3B6CF6",
            }}
          >
            {program.priceType === "free"
              ? "무료 공유"
              : `${program.price.toLocaleString()}원`}
          </span>

          <h2 className="text-xl font-bold text-gray-900 leading-snug">
            {program.title}
          </h2>

          {/* 메타 태그 */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {program.targetGrade && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {program.targetGrade}
              </span>
            )}
            {program.duration && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {program.duration}
              </span>
            )}
            {program.topic && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-600">
                {TOPIC_MAP[program.topic] || program.topic}
              </span>
            )}
            {program.maxStudents && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-600">
                최대 {program.maxStudents}명
              </span>
            )}
          </div>

          {/* 소셜 프루프 */}
          <div className="flex items-center gap-4 mt-4">
            {program.reviewCount > 0 && (
              <div className="flex items-center gap-1.5">
                <StarRating rating={Math.round(program.averageRating)} size={14} />
                <span className="text-sm font-semibold text-gray-800">
                  {program.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  ({program.reviewCount}명)
                </span>
              </div>
            )}
            {program.usedCount > 0 && (
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {program.usedCount}명이 사용했어요
              </span>
            )}
          </div>
        </motion.div>

        {/* ─── 상세 설명 ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="mt-6 rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <h3 className="text-sm font-semibold text-gray-800 mb-2">프로그램 소개</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {program.description}
          </p>
        </motion.div>

        {/* ─── 포함 항목 ─── */}
        {program.includes && program.includes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-4 rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-3">포함 항목</h3>
            <div className="space-y-2">
              {program.includes.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(34,197,94,0.1)" }}
                  >
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── 재료비 ─── */}
        {program.materialsCost && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="mt-4 rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-1">재료비</h3>
            <p className="text-sm text-gray-600">{program.materialsCost}</p>
          </motion.div>
        )}

        {/* ─── 사용 후기 ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-6"
        >
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            사용 후기 ({program.reviewCount})
          </h3>

          {program.reviews.length > 0 ? (
            <div className="space-y-2">
              {program.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl p-6 text-center"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <p className="text-sm text-[var(--text-muted)]">
                아직 사용 후기가 없어요
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ─── 하단 CTA ─── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4"
        style={{
          background: "rgba(248,249,252,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <div className="max-w-[520px] mx-auto flex items-center gap-3">
          {/* 업보트 버튼 */}
          <button
            onClick={handleUpvote}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: upvoted
                ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)"
                : "rgba(255,255,255,0.7)",
              color: upvoted ? "white" : "#6B7280",
              border: upvoted ? "none" : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{program.upvoteCount}</span>
          </button>

          {/* CTA */}
          {program.downloadUrl ? (
            <a
              href={program.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                boxShadow: "0 2px 12px rgba(59,108,246,0.25)",
              }}
            >
              <Download className="w-4 h-4" />
              {program.priceType === "free" ? "무료 다운로드" : "다운로드"}
            </a>
          ) : (
            <button
              className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                boxShadow: "0 2px 12px rgba(59,108,246,0.25)",
              }}
            >
              <MessageCircle className="w-4 h-4 inline mr-1.5" />
              문의하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
