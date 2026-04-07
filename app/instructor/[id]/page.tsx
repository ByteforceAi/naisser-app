"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Star, MapPin, Phone, Mail, Link2, ExternalLink,
  Calendar, School, Shield, Loader2,
  CheckCircle2, BookOpen, MessageSquare, Heart,
  Award, FileCheck2, Briefcase, Share2, QrCode,
  Camera, Play, Globe, PenLine, ThumbsUp, GraduationCap,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getCategoryLabel } from "@/lib/constants/categories";
import { getTopicColor } from "@/lib/design-system";

interface Instructor {
  id: string;
  userId: string;
  instructorName: string;
  profileImage: string | null;
  coverImage?: string | null;
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
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
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-grouped)" }}>
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3" style={{ background: "var(--bg-grouped)" }}>
        <p className="text-[var(--text-muted)] text-sm">강사를 찾을 수 없습니다</p>
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
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      {/* ═══ 히어로 배너 ═══ */}
      <div className="relative">
        {/* 배경 그라데이션 */}
        <div className="h-48 relative overflow-hidden">
          {/* 커버 이미지 또는 그라디언트 */}
          {instructor.coverImage ? (
            <Image src={instructor.coverImage} alt="커버 이미지" fill className="object-cover" sizes="100vw" />
          ) : (
            <div className="absolute inset-0" style={{
              background: `linear-gradient(135deg, ${primaryColor}18 0%, ${primaryColor}06 50%, var(--bg-primary) 100%)`,
            }} />
          )}
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--bg-surface) 80%, transparent) 0%, transparent 70%)",
          }} />
          {/* 도트 패턴 */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
        </div>

        {/* 네비 — Liquid Glass */}
        <div className="absolute top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all"
            style={{
              background: "color-mix(in srgb, var(--bg-surface) 65%, transparent)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "0.5px solid rgba(255,255,255,0.5)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          </button>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleFavorite}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: "color-mix(in srgb, var(--bg-surface) 65%, transparent)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "0.5px solid rgba(255,255,255,0.5)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
              <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : ""}`} style={isFavorite ? {} : { color: "var(--ios-gray)" }} />
            </motion.button>
          </div>
        </div>

        {/* 프로필 아바타 — Liquid Glass 프레임 */}
        <div className="absolute -bottom-12 left-5">
          <div className="w-24 h-24 rounded-[24px] overflow-hidden"
            style={{
              background: "color-mix(in srgb, var(--bg-surface) 65%, transparent)",
              backdropFilter: "blur(14px) saturate(1.4)",
              WebkitBackdropFilter: "blur(14px) saturate(1.4)",
              border: "0.5px solid rgba(255,255,255,0.6)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)",
              padding: "3px",
            }}>
            <div className="w-full h-full rounded-[21px] overflow-hidden relative"
              style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}30)` }}>
              {instructor.profileImage ? (
                <Image src={instructor.profileImage} alt="프로필" fill className="object-cover" sizes="96px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ color: primaryColor }}>
                  {instructor.instructorName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 프로필 정보 ═══ */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="px-5 pt-16 pb-6">
        {/* 이름 + 뱃지 */}
        <motion.div variants={fadeIn} className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{instructor.instructorName}</h1>
          {instructor.isEarlyBird && (
            <span className="ds-badge bg-[rgba(255,204,0,0.08)] text-[#FF9500]">
              <Award className="w-3 h-3" /> 얼리버드
            </span>
          )}
          {instructor.documentBadge && (
            <span className="ds-badge bg-[rgba(52,199,89,0.08)] text-[#34C759]">
              <Shield className="w-3 h-3" /> 서류완비
            </span>
          )}
        </motion.div>

        {/* 별점 + 지역 */}
        <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-[var(--text-primary)]">{rating.toFixed(1)}</span>
            <span className="text-xs text-[var(--text-muted)]">({instructor.reviewCount})</span>
          </div>
          {regionLabels.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
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
            <span key={label} className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--ios-separator)]">
              {label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* ═══ 소개 ═══ */}
      {instructor.bio && (
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mx-5 mb-4 p-5 rounded-xl" style={{ background: "var(--bg-grouped-secondary)", border: "none" }}>
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-500" /> 소개
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-[1.8] whitespace-pre-line">{instructor.bio}</p>
        </motion.div>
      )}

      {/* ═══ 경력 ═══ */}
      {instructor.career && (
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mx-5 mb-4 p-5 rounded-xl" style={{ background: "var(--bg-grouped-secondary)", border: "none" }}>
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-violet-500" /> 경력
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-[1.8] whitespace-pre-line">{instructor.career}</p>
        </motion.div>
      )}

      {/* ═══ 활동 통계 ═══ */}
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="mx-5 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "수업", value: "—", icon: GraduationCap, color: "#059669" },
            { label: "리뷰", value: String(instructor.reviewCount || 0), icon: Star, color: "#F59E0B" },
            { label: "도움됐어요", value: "—", icon: ThumbsUp, color: "#2563EB" },
          ].map((s) => (
            <div key={s.label} className="stat-card-premium !p-3"
              style={{ "--stat-accent": s.color } as React.CSSProperties}>
              <s.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: s.color, opacity: 0.7 }} />
              <p className="text-[16px] font-bold text-[var(--text-primary)]">{s.value}</p>
              <p className="text-[11px] text-[var(--text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ SNS 링크트리 ═══ */}
      {session && instructor.snsLinks && instructor.snsLinks.length > 0 && (
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mx-5 mb-4 space-y-2">
          <h3 className="text-xs font-bold text-[var(--text-muted)] mb-3">SNS</h3>
          {instructor.snsLinks.map((link, i) => {
            const parts = link.split(":");
            const platform = parts[0].toLowerCase();
            const url = parts.slice(1).join(":");
            const SNS_STYLES: Record<string, { icon: typeof Globe; bg: string; color: string; label: string }> = {
              instagram: { icon: Camera, bg: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)", color: "white", label: "Camera" },
              youtube: { icon: Play, bg: "#FF0000", color: "white", label: "YouTube" },
              blog: { icon: PenLine, bg: "#03C75A", color: "white", label: "블로그" },
              kakao: { icon: MessageSquare, bg: "#FEE500", color: "#191919", label: "카카오채널" },
            };
            const style = SNS_STYLES[platform] || { icon: Globe, bg: "var(--text-primary)", color: "white", label: platform };
            const Icon = style.icon;
            return (
              <motion.a key={i} href={url?.startsWith("http") ? url : `https://${url}`}
                target="_blank" rel="noopener noreferrer"
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold
                           transition-all duration-200 hover:shadow-md"
                style={{ background: style.bg, color: style.color }}>
                <Icon className="w-5 h-5" />
                <span className="flex-1">{style.label}</span>
                <ExternalLink className="w-4 h-4 opacity-60" />
              </motion.a>
            );
          })}
        </motion.div>
      )}

      {/* ═══ 프로필 공유 ═══ */}
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="mx-5 mb-4 flex gap-2">
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/instructor/${id}`); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                     text-[var(--text-secondary)] border border-black/[0.06] bg-[var(--bg-surface)]/50 hover:bg-[var(--bg-surface)] transition-all">
          <Share2 className="w-4 h-4" /> 프로필 공유
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold
                     text-[var(--text-secondary)] border border-black/[0.06] bg-[var(--bg-surface)]/50 hover:bg-[var(--bg-surface)] transition-all">
          <QrCode className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* ═══ 연락처 (비로그인 유도) ═══ */}
      {!session && (
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mx-5 mb-4 p-5 rounded-xl text-center" style={{ background: "var(--bg-grouped-secondary)", border: "none" }}>
          <div className="w-12 h-12 rounded-xl bg-[rgba(0,122,255,0.08)] flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">연락처를 확인하세요</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">로그인하면 전화번호, 이메일, SNS를 볼 수 있어요</p>
          <a href="/" className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white ds-btn-primary">
            로그인하고 연락하기
          </a>
        </motion.div>
      )}

      {/* ═══ 연락처 (로그인 시) ═══ */}
      {session && (
        <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mx-5 mb-4 p-5 rounded-xl" style={{ background: "var(--bg-grouped-secondary)", border: "none" }}>
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3">연락처</h3>
          <div className="space-y-3">
            {instructor.phone && (
              <button onClick={copyPhone} className="flex items-center gap-3 text-sm w-full text-left group">
                <div className="w-9 h-9 rounded-xl bg-[rgba(0,122,255,0.08)] flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-[var(--text-secondary)] group-hover:text-blue-600 transition-colors">{instructor.phone}</span>
                {copied && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
              </button>
            )}
            {instructor.email && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
                </div>
                <span className="text-[var(--text-secondary)]">{instructor.email}</span>
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
                  <div className="w-9 h-9 rounded-xl bg-[rgba(88,86,214,0.08)] flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-violet-500" />
                  </div>
                  <span className="text-blue-500 group-hover:text-blue-600">{platform}</span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)] ml-auto" />
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
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            리뷰 ({instructor.reviewCount})
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div className="ds-empty rounded-xl" style={{ background: "var(--bg-grouped-secondary)", border: "none" }}>
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
                className="p-4 rounded-xl" style={{ background: "var(--bg-grouped-secondary)", border: "none" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? "fill-yellow-400 text-yellow-400" : "text-[var(--text-muted)]"}`} />
                    ))}
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{r.content}</p>
                {r.teacherName && (
                  <p className="text-xs text-[var(--text-muted)] mt-2">{r.teacherName} 교사</p>
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
                className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-sm font-bold
                           border-2 text-[var(--text-secondary)] bg-[var(--bg-surface)]" style={{ borderColor: primaryColor, color: primaryColor }}>
                <Phone className="w-4 h-4" /> 전화하기
              </motion.a>
            )}
            <motion.button whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-sm font-bold text-white ds-btn-primary"
              onClick={() => router.push(`/teacher/request?instructorId=${id}`)}>
              <Calendar className="w-4 h-4" /> 수업 의뢰하기
            </motion.button>
          </div>
        ) : (
          <a href="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white ds-btn-primary">
            로그인하고 연락하기
          </a>
        )}
      </div>

      <div className="h-24" />
    </div>
  );
}
