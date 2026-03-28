"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, MapPin, Phone, Mail, Link2, ExternalLink,
  Calendar, School, Shield, Loader2,
  CheckCircle2, BookOpen, MessageSquare, Heart,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { getCategoryLabel } from "@/lib/constants/categories";

interface Instructor {
  id: string;
  userId: string;
  instructorName: string;
  profileImage: string | null;
  topics: string[];
  methods: string[];
  regions: string[];
  bio: string | null;
  career: string | null;
  phone: string | null;
  email: string | null;
  snsLinks: string[] | null;
  averageRating: string;
  reviewCount: number;
  isEarlyBird: boolean;
  documentBadge?: boolean;
}

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  teacherName?: string;
}

const TOPIC_COLORS: Record<string, string> = {
  환경: "#059669", 생명존중: "#10B981", AI: "#6366F1", 코딩: "#3B82F6",
  미술: "#EC4899", 공예: "#F59E0B", 체육: "#EF4444", 음악: "#8B5CF6",
  진로: "#0891B2", 독서: "#78716C", 기타: "#6B7280",
};

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function InstructorDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: session } = useSession();

  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [instRes, reviewRes] = await Promise.all([
          fetch(`/api/instructors/${id}`),
          fetch(`/api/instructors/${id}/reviews`),
        ]);

        if (instRes.ok) {
          const json = await instRes.json();
          setInstructor(json.data || json);
        }
        if (reviewRes.ok) {
          const json = await reviewRes.json();
          setReviews(json.data || []);
        }
      } catch {
        // 에러
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const copyPhone = () => {
    if (instructor?.phone) {
      navigator.clipboard.writeText(instructor.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-gray-400">강사를 찾을 수 없습니다</p>
        <button onClick={() => router.back()} className="text-blue-500 text-sm font-medium">
          돌아가기
        </button>
      </div>
    );
  }

  const rating = parseFloat(instructor.averageRating) || 0;
  const topicLabels = instructor.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
  const methodLabels = instructor.methods?.map((m) => getCategoryLabel(m, "method")) || [];
  const regionLabels = instructor.regions?.map((r) => getCategoryLabel(r, "region")) || [];
  const firstTopicLabel = topicLabels[0] || "교육";
  const topicColor = TOPIC_COLORS[firstTopicLabel] || "#3B82F6";

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* ─── 헤더 ─── */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(248,249,252,0.85)", backdropFilter: "blur(12px)" }}
      >
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFavorite(!isFavorite)}
          className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </motion.button>
      </div>

      {/* ─── 프로필 영역 ─── */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="px-5 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md"
            style={{ background: `linear-gradient(135deg, ${topicColor}20, ${topicColor}40)` }}
          >
            {instructor.profileImage ? (
              <img src={instructor.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                style={{ color: topicColor }}>
                {instructor.instructorName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{instructor.instructorName}</h1>
              {instructor.isEarlyBird && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium">🐣 얼리버드</span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({instructor.reviewCount}개 리뷰)</span>
            </div>
            {regionLabels.length > 0 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                {regionLabels.join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* 주제 태그 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {topicLabels.map((label) => {
            const c = TOPIC_COLORS[label] || "#3B82F6";
            return (
              <span key={label} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: `${c}12`, color: c, border: `1px solid ${c}25` }}>
                {label}
              </span>
            );
          })}
          {methodLabels.map((label) => (
            <span key={label} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
              {label}
            </span>
          ))}
        </div>

        {/* 서류 완비 + 수업 형태 뱃지 */}
        <div className="flex gap-2 mb-4">
          {instructor.documentBadge && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">서류 완비</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── 소개 ─── */}
      {instructor.bio && (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.05 }}
          className="mx-5 mb-4 p-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <h3 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> 소개
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{instructor.bio}</p>
        </motion.div>
      )}

      {/* ─── 경력 ─── */}
      {instructor.career && (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }}
          className="mx-5 mb-4 p-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <h3 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
            <School className="w-3.5 h-3.5" /> 경력
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{instructor.career}</p>
        </motion.div>
      )}

      {/* ─── 연락처 ─── */}
      {session && (
        <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.15 }}
          className="mx-5 mb-4 p-4 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <h3 className="text-xs font-bold text-gray-500 mb-3">연락처</h3>
          <div className="space-y-2">
            {instructor.phone && (
              <button onClick={copyPhone} className="flex items-center gap-2 text-sm w-full text-left">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{instructor.phone}</span>
                {copied && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
              </button>
            )}
            {instructor.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{instructor.email}</span>
              </div>
            )}
            {instructor.snsLinks?.map((link, i) => {
              const [platform, url] = link.split(":");
              return (
                <a key={i} href={url?.startsWith("http") ? url : `https://${url}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-500">
                  <Link2 className="w-4 h-4" />
                  {platform || link}
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ─── 리뷰 섹션 ─── */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
        className="mx-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            리뷰 ({instructor.reviewCount})
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">아직 리뷰가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="p-4 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.04)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
                {r.teacherName && (
                  <p className="text-xs text-gray-400 mt-1.5">{r.teacherName} 교사</p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── 하단 CTA 고정 ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3"
        style={{
          background: "rgba(248,249,252,0.9)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}>
        <div className="flex gap-2">
          {instructor.phone && (
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={`tel:${instructor.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-bold
                         border-2 border-blue-500 text-blue-600"
            >
              <Phone className="w-4 h-4" />
              전화하기
            </motion.a>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)", boxShadow: "0 4px 16px rgba(59,108,246,0.3)" }}
            onClick={() => router.push(`/teacher/request?instructorId=${id}`)}
          >
            <Calendar className="w-4 h-4" />
            수업 의뢰하기
          </motion.button>
        </div>
      </div>

      {/* CTA 영역 높이만큼 여백 */}
      <div className="h-24" />
    </div>
  );
}
