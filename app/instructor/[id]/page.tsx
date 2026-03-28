"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, MapPin, Phone, Mail, Link2, ExternalLink,
  Calendar, School, Shield, Loader2,
  CheckCircle2, BookOpen, MessageSquare, Heart,
  Award, FileCheck2, Briefcase,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { getCategoryLabel } from "@/lib/constants/categories";
import { getTopicColor } from "@/lib/design-system";

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

const fadeIn = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function InstructorProfilePage() {
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
      } catch { /* */ }
      finally { setLoading(false); }
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

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructorId: id }),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FC]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-[#F8F9FC]">
        <p className="text-gray-400 text-sm">강사를 찾을 수 없습니다</p>
        <button onClick={() => router.back()} className="text-blue-500 text-sm font-medium">돌아가기</button>
      </div>
    );
  }

  const rating = parseFloat(instructor.averageRating) || 0;
  const topicLabels = instructor.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
  const methodLabels = instructor.methods?.map((m) => getCategoryLabel(m, "method")) || [];
  const regionLabels = instructor.regions?.map((r) => getCategoryLabel(r, "region")) || [];
  const primaryColor = getTopicColor(topicLabels[0] || "기타");

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* ═══ 히어로 배너 ═══ */}
      <div className="relative">
        {/* 배경 그라데이션 */}
        <div className="h-48 relative overflow-hidden">
          <div className="absolute inset-0" style={{
            background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}08 50%, #F8F9FC 100%)`,
          }} />
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 70%)",
          }} />
          {/* 도트 패턴 */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
        </div>

        {/* 네비 */}
        <div className="absolute top-0 left-0 right-0 z-30 px-5 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="ds-back-btn">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggleFavorite} className="ds-back-btn">
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </motion.button>
        </div>

        {/* 프로필 아바타 — 배너 하단에 걸치기 */}
        <div className="absolute -bottom-12 left-5">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl border-4 border-white"
            style={{ background: `linear-gradient(135deg, ${primaryColor}20, ${primaryColor}40)` }}>
            {instructor.profileImage ? (
              <img src={instructor.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ color: primaryColor }}>
                {instructor.instructorName.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ 프로필 정보 ═══ */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="px-5 pt-16 pb-6">
        {/* 이름 + 뱃지 */}
        <motion.div variants={fadeIn} className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{instructor.instructorName}</h1>
          {instructor.isEarlyBird && (
            <span className="ds-badge bg-yellow-50 text-yellow-700">🐣 얼리버드</span>
          )}
          {instructor.documentBadge && (
            <span className="ds-badge bg-emerald-50 text-emerald-700">
              <Shield className="w-3 h-3" /> 서류완비
            </span>
          )}
        </motion.div>

        {/* 별점 + 지역 */}
        <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({instructor.reviewCount})</span>
          </div>
          {regionLabels.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" /> {regionLabels.join(", ")}
            </span>
          )}
        </motion.div>

        {/* 주제 태그 */}
        <motion.div variants={fadeIn} className="flex flex-wrap gap-1.5 mb-5">
          {topicLabels.map((label) => {
            const c = getTopicColor(label);
            return (
              <span key={label} className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: `${c}10`, color: c, border: `1.5px solid ${c}20` }}>
                {label}
              </span>
            );
          })}
          {methodLabels.map((label) => (
            <span key={label} className="text-xs px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
              {label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* ═══ 소개 ═══ */}
      {instructor.bio && (
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mx-5 mb-4 p-5 ds-card">
          <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-500" /> 소개
          </h3>
          <p className="text-sm text-gray-700 leading-[1.8] whitespace-pre-line">{instructor.bio}</p>
        </motion.div>
      )}

      {/* ═══ 경력 ═══ */}
      {instructor.career && (
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mx-5 mb-4 p-5 ds-card">
          <h3 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-violet-500" /> 경력
          </h3>
          <p className="text-sm text-gray-700 leading-[1.8] whitespace-pre-line">{instructor.career}</p>
        </motion.div>
      )}

      {/* ═══ 연락처 (비로그인 유도) ═══ */}
      {!session && (
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mx-5 mb-4 p-5 ds-card text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">연락처를 확인하세요</h3>
          <p className="text-xs text-gray-500 mb-4">로그인하면 전화번호, 이메일, SNS를 볼 수 있어요</p>
          <a href="/" className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-2xl text-sm font-bold text-white ds-btn-primary">
            로그인하고 연락하기
          </a>
        </motion.div>
      )}

      {/* ═══ 연락처 (로그인 시) ═══ */}
      {session && (
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mx-5 mb-4 p-5 ds-card">
          <h3 className="text-xs font-bold text-gray-900 mb-3">연락처</h3>
          <div className="space-y-3">
            {instructor.phone && (
              <button onClick={copyPhone} className="flex items-center gap-3 text-sm w-full text-left group">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{instructor.phone}</span>
                {copied && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
              </button>
            )}
            {instructor.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-gray-700">{instructor.email}</span>
              </div>
            )}
            {instructor.snsLinks?.map((link, i) => {
              const parts = link.split(":");
              const platform = parts[0];
              const url = parts.slice(1).join(":");
              return (
                <a key={i} href={url?.startsWith("http") ? url : `https://${url}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm group">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="text-blue-500 group-hover:text-blue-600">{platform}</span>
                  <ExternalLink className="w-3 h-3 text-gray-300 ml-auto" />
                </a>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ 리뷰 ═══ */}
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="mx-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            리뷰 ({instructor.reviewCount})
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div className="ds-empty ds-card">
            <Star className="ds-empty-icon" />
            <p className="ds-empty-text">아직 리뷰가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 ds-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{r.content}</p>
                {r.teacherName && (
                  <p className="text-xs text-gray-400 mt-2">{r.teacherName} 교사</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ═══ 하단 CTA ═══ */}
      <div className="ds-bottom-bar">
        {session ? (
          <div className="flex gap-2">
            {instructor.phone && (
              <motion.a whileTap={{ scale: 0.97 }} href={`tel:${instructor.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-sm font-bold
                           border-2 text-gray-700 bg-white" style={{ borderColor: primaryColor, color: primaryColor }}>
                <Phone className="w-4 h-4" /> 전화하기
              </motion.a>
            )}
            <motion.button whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-sm font-bold text-white ds-btn-primary"
              onClick={() => router.push(`/teacher/request?instructorId=${id}`)}>
              <Calendar className="w-4 h-4" /> 수업 의뢰하기
            </motion.button>
          </div>
        ) : (
          <a href="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white ds-btn-primary">
            로그인하고 연락하기
          </a>
        )}
      </div>

      <div className="h-24" />
    </div>
  );
}
