"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MapPin, Phone, Mail, ExternalLink, Share2,
  Heart, ChevronDown, Copy, Check, MessageSquare,
  Camera, Play, Globe, ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getCategoryLabel } from "@/lib/constants/categories";
import { useDeviceTilt } from "@/lib/hooks/useDeviceTilt";
import { KakaoShareButton } from "@/components/shared/KakaoShareButton";
import { ProgramCards } from "@/components/profile/ProgramCards";
import { PortfolioGallery } from "@/components/profile/PortfolioGallery";
import { CertificationSection } from "@/components/profile/CertificationSection";
import { TeachingHistory } from "@/components/profile/TeachingHistory";
import { CostSection } from "@/components/profile/CostSection";
import { DocumentStatus } from "@/components/profile/DocumentStatus";

// ─── 타입 ───
interface InstructorProfile {
  id: string;
  instructorName: string;
  profileImage: string | null;
  topics: string[];
  methods: string[];
  regions: string[];
  bio: string | null;
  career: string | null;
  phone: string | null;
  email?: string | null;
  snsAccounts: string[] | null;
  averageRating: string;
  reviewCount: number;
  isEarlyBird: boolean;
  shortcode: string | null;
  certifications?: string[];
  lectureContent?: string | null;
}

interface Review {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  teacherName?: string;
}

// ─── 애니메이션 ───
const fadeIn = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── SNS 아이콘 매핑 ───
const SNS_CONFIG: Record<string, { icon: typeof Camera; label: string; color: string }> = {
  instagram: { icon: Camera, label: "Instagram", color: "#E4405F" },
  youtube: { icon: Play, label: "YouTube", color: "#FF0000" },
  blog: { icon: Globe, label: "Blog", color: "#03C75A" },
  kakao: { icon: MessageSquare, label: "KakaoTalk", color: "#FEE500" },
};

export default function ProfileBrandPage({
  instructorId,
}: {
  instructorId: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [inst, setInst] = useState<InstructorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllBio, setShowAllBio] = useState(false);
  const tilt = useDeviceTilt();
  const [showCTA, setShowCTA] = useState(false);

  const isLoggedIn = session?.user;

  // 데이터 로드
  useEffect(() => {
    async function load() {
      try {
        const [instRes, reviewRes] = await Promise.all([
          fetch(`/api/instructors/${instructorId}`),
          fetch(`/api/instructors/${instructorId}/reviews`),
        ]);
        if (instRes.ok) {
          const json = await instRes.json();
          setInst(json.data || json);
        }
        if (reviewRes.ok) {
          const json = await reviewRes.json();
          setReviews(json.data || []);
        }
      } catch { /* */ }
      finally { setLoading(false); }
    }
    load();
  }, [instructorId]);

  // 조회 이벤트 기록
  useEffect(() => {
    if (instructorId) {
      fetch("/api/profile/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId }),
      }).catch(() => {});
    }
  }, [instructorId]);

  // 즐겨찾기 상태 확인
  useEffect(() => {
    if (isLoggedIn && instructorId) {
      fetch(`/api/favorites?instructorId=${instructorId}`)
        .then((r) => r.json())
        .then((json) => setIsFavorite(!!json.data?.isFavorite))
        .catch(() => {});
    }
  }, [isLoggedIn, instructorId]);

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructorId }),
    });
    // 이벤트 기록
    fetch("/api/profile/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructorId, eventType: "favorite" }),
    }).catch(() => {});
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // 이벤트 기록
    fetch("/api/profile/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instructorId,
        eventType: "share",
        metadata: { channel: "link" },
      }),
    }).catch(() => {});
  };

  const handlePhoneClick = () => {
    if (inst?.phone && !inst.phone.includes("*")) {
      window.location.href = `tel:${inst.phone}`;
      fetch("/api/profile/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId, eventType: "phone_click" }),
      }).catch(() => {});
    }
  };

  // ─── 로딩 ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-blue-100 border-t-blue-500 animate-spin" />
          <p className="text-[13px] text-[var(--text-muted)]">프로필 불러오는 중</p>
        </div>
      </div>
    );
  }

  if (!inst) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ background: "var(--bg-primary)" }}>
        <p className="text-[var(--text-muted)] text-sm">강사를 찾을 수 없습니다</p>
        <button onClick={() => router.push("/")}
          className="text-[var(--accent-primary)] text-sm font-semibold">홈으로</button>
      </div>
    );
  }

  const rating = parseFloat(inst.averageRating) || 0;
  const topicLabels = inst.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
  const regionLabels = inst.regions?.map((r) => getCategoryLabel(r, "region")) || [];
  const snsLinks = (inst.snsAccounts || [])
    .map((s) => {
      const idx = s.indexOf(":");
      if (idx === -1) return null;
      return { platform: s.slice(0, idx), url: s.slice(idx + 1) };
    })
    .filter(Boolean) as { platform: string; url: string }[];

  const profileUrl = typeof window !== "undefined" ? window.location.href : "";
  const ogImageUrl = `/api/og/instructor?name=${encodeURIComponent(inst.instructorName)}&topic=${encodeURIComponent(topicLabels[0] || "")}&rating=${rating.toFixed(1)}&reviews=${inst.reviewCount}`;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ═══ 상단 네비 ═══ */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{
          background: "rgba(var(--bg-primary-rgb, 250,250,250), 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center
                     hover:bg-[var(--bg-elevated)] transition-colors touch-target">
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={toggleFavorite}
            className="w-9 h-9 rounded-full flex items-center justify-center
                       hover:bg-[var(--bg-elevated)] transition-colors touch-target">
            <Heart className={`w-5 h-5 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-[var(--text-muted)]"
            }`} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={copyLink}
            className="w-9 h-9 rounded-full flex items-center justify-center
                       hover:bg-[var(--bg-elevated)] transition-colors touch-target">
            {copied ? (
              <Check className="w-5 h-5 text-[var(--accent-success)]" />
            ) : (
              <Share2 className="w-5 h-5 text-[var(--text-muted)]" />
            )}
          </motion.button>
        </div>
      </div>

      {/* ═══ 프로필 카드 (첫 뷰포트) — A9: 3D 패럴랙스 ═══ */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="px-6 pt-4 pb-8"
        style={{
          perspective: "800px",
        }}
      >
        <motion.div
          animate={{
            rotateX: tilt.y * -4,
            rotateY: tilt.x * 4,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
        {/* 프로필 이미지 */}
        <motion.div variants={fadeIn} className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg relative"
              style={{
                background: inst.profileImage
                  ? "transparent"
                  : "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              }}>
              {inst.profileImage ? (
                <Image src={inst.profileImage} alt="프로필" fill className="object-cover" sizes="96px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {inst.instructorName.charAt(0)}
                </div>
              )}
            </div>
            {/* 얼리버드 뱃지 */}
            {inst.isEarlyBird && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-400
                              flex items-center justify-center text-xs shadow-md">
                🐣
              </div>
            )}
          </div>
        </motion.div>

        {/* 이름 + 한줄 소개 */}
        <motion.div variants={fadeIn} className="text-center mb-4">
          <h1 className="text-[24px] font-bold text-[var(--text-primary)] tracking-tight">
            {inst.instructorName}
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)] mt-1"
            style={{ lineHeight: 1.6 }}>
            {topicLabels.join(" · ")} 전문강사
          </p>
        </motion.div>

        {/* 평점 + 지역 */}
        <motion.div variants={fadeIn} className="flex items-center justify-center gap-4 mb-5">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-[14px] font-bold text-[var(--text-primary)]">
                {rating.toFixed(1)}
              </span>
              <span className="text-[13px] text-[var(--text-muted)]">
                ({inst.reviewCount})
              </span>
            </div>
          )}
          {regionLabels.length > 0 && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-[13px] text-[var(--text-muted)]">
                {regionLabels.slice(0, 2).join(", ")}
              </span>
            </div>
          )}
        </motion.div>

        {/* 토픽 태그 */}
        <motion.div variants={fadeIn} className="flex flex-wrap justify-center gap-2 mb-6">
          {topicLabels.map((label) => (
            <span key={label}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium
                         bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
              {label}
            </span>
          ))}
        </motion.div>
        </motion.div>{/* 3D 패럴랙스 wrapper 닫기 */}
      </motion.div>

      {/* ═══ 연락처 섹션 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6 mb-8"
      >
        <div className="rounded-xl overflow-hidden"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--glass-border)",
          }}>
          {/* 전화번호 */}
          {inst.phone && (
            <button onClick={handlePhoneClick}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left
                         hover:bg-[var(--bg-elevated)] transition-colors touch-target"
              style={{ borderBottom: "1px solid var(--glass-border)" }}>
              <Phone className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="flex-1 text-[14px] text-[var(--text-primary)]">
                {inst.phone}
              </span>
              {!inst.phone.includes("*") && (
                <span className="text-[12px] text-[var(--accent-primary)] font-medium">
                  전화하기
                </span>
              )}
            </button>
          )}

          {/* SNS 링크 (로그인 시만) */}
          {snsLinks.map(({ platform, url }) => {
            const config = SNS_CONFIG[platform];
            if (!config || url.includes("*")) return null;
            return (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5
                           hover:bg-[var(--bg-elevated)] transition-colors touch-target"
                style={{ borderBottom: "1px solid var(--glass-border)" }}
                onClick={() => {
                  fetch("/api/profile/view", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      instructorId,
                      eventType: "sns_click",
                      metadata: { platform },
                    }),
                  }).catch(() => {});
                }}>
                <config.icon className="w-4 h-4" style={{ color: config.color }} />
                <span className="flex-1 text-[14px] text-[var(--text-primary)]">
                  {config.label}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </a>
            );
          })}

          {/* 비로그인 시 안내 */}
          {!isLoggedIn && (
            <div className="px-4 py-4 text-center">
              <p className="text-[13px] text-[var(--text-muted)] mb-2">
                연락처를 확인하려면 로그인이 필요합니다
              </p>
              <button onClick={() => router.push("/auth/select-role")}
                className="text-[13px] font-semibold text-[var(--accent-primary)]">
                로그인하기
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══ 소개 ═══ */}
      {(inst.bio || inst.lectureContent) && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="px-6 mb-8"
        >
          <h2 className="text-[12px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
            소개
          </h2>
          <p className={`text-[14px] text-[var(--text-primary)] leading-relaxed
                         ${!showAllBio ? "line-clamp-4" : ""}`}
            style={{ lineHeight: 1.7, wordBreak: "keep-all" }}>
            {inst.bio || inst.lectureContent}
          </p>
          {(inst.bio || inst.lectureContent || "").length > 150 && !showAllBio && (
            <button onClick={() => setShowAllBio(true)}
              className="flex items-center gap-0.5 mt-2 text-[13px] font-medium text-[var(--accent-primary)]">
              더보기 <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </motion.div>
      )}

      {/* ═══ 경력 ═══ */}
      {inst.career && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-6 mb-8"
        >
          <h2 className="text-[12px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
            경력
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] whitespace-pre-line"
            style={{ lineHeight: 1.7, wordBreak: "keep-all" }}>
            {inst.career}
          </p>
        </motion.div>
      )}

      {/* ═══ 비용 안내 (Feature B) ═══ */}
      <CostSection
        feeType={(inst as unknown as Record<string, unknown>).feeType as string}
        feeNote={(inst as unknown as Record<string, unknown>).feeNote as string}
        materialCostPerPerson={(inst as unknown as Record<string, unknown>).materialCostPerPerson as number}
        materialCostNote={(inst as unknown as Record<string, unknown>).materialCostNote as string}
        preparation={(inst as unknown as Record<string, unknown>).preparation as string}
        transportIncluded={(inst as unknown as Record<string, unknown>).transportIncluded as boolean}
        minStudents={(inst as unknown as Record<string, unknown>).minStudents as number}
        maxStudents={(inst as unknown as Record<string, unknown>).maxStudents as number}
        classDuration={(inst as unknown as Record<string, unknown>).classDuration as string}
      />

      {/* ═══ 수업 프로그램 (Phase 2) ═══ */}
      <ProgramCards instructorId={instructorId} />

      {/* ═══ 포트폴리오 (Phase 2) ═══ */}
      <PortfolioGallery instructorId={instructorId} />

      {/* ═══ 자격/인증 (Phase 2) ═══ */}
      <CertificationSection certifications={inst.certifications || []} />

      {/* ═══ 출강이력 (Phase 2) ═══ */}
      <TeachingHistory instructorId={instructorId} />

      {/* ═══ 서류 현황 (Feature A) ═══ */}
      <DocumentStatus instructorId={instructorId} />

      {/* ═══ 리뷰 ═══ */}
      {reviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-6 mb-8"
        >
          <h2 className="text-[12px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
            교사 리뷰 ({reviews.length})
          </h2>
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id}
                className="p-4 rounded-xl"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--glass-border)",
                }}>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-[var(--text-muted)]"
                      }`} />
                  ))}
                  <span className="text-[11px] text-[var(--text-muted)] ml-1">
                    {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--text-primary)] line-clamp-3"
                  style={{ lineHeight: 1.6 }}>
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ 공유 섹션 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="px-6 mb-32"
      >
        <div className="flex gap-2">
          <KakaoShareButton
            title={`${inst.instructorName} - ${topicLabels[0] || "전문"} 강사`}
            description={inst.bio?.slice(0, 80) || `${topicLabels.join(", ")} 전문강사`}
            imageUrl={ogImageUrl}
            url={profileUrl}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                       transition-all touch-target"
            style={{
              background: "#FEE500",
              color: "#191919",
            }}
            onShare={() => {
              fetch("/api/profile/view", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  instructorId,
                  eventType: "kakao_share",
                }),
              }).catch(() => {});
            }}
          >
            <MessageSquare className="w-4 h-4" />
            카카오톡 공유
          </KakaoShareButton>
          <motion.button whileTap={{ scale: 0.97 }} onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                       transition-all touch-target"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
            }}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "복사됨" : "링크 복사"}
          </motion.button>
        </div>
      </motion.div>

      {/* ═══ 하단 CTA (고정) ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3"
        style={{
          background: "rgba(var(--bg-primary-rgb, 250,250,250), 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "0.5px solid var(--glass-border)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}>
        <div className="max-w-[520px] mx-auto">
          {isLoggedIn ? (
            <div className="flex gap-2">
              {inst.phone && !inst.phone.includes("*") && (
                <motion.a href={`tel:${inst.phone}`}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                             text-[15px] font-bold touch-target"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--glass-border)",
                    color: "var(--text-primary)",
                  }}>
                  <Phone className="w-4 h-4" />
                  전화하기
                </motion.a>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push(`/teacher/request?instructorId=${instructorId}`)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                           text-[15px] font-bold text-white touch-target"
                style={{
                  background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                  boxShadow: "0 4px 16px rgba(59,108,246,0.3)",
                }}>
                <MessageSquare className="w-4 h-4" />
                수업 문의하기
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/auth/select-role")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                         text-[15px] font-bold text-white touch-target"
              style={{
                background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                boxShadow: "0 4px 16px rgba(59,108,246,0.3)",
              }}>
              로그인하고 연락하기
            </motion.button>
          )}
        </div>
      </div>

      {/* NAISSER 워터마크 */}
      <div className="text-center pb-4">
        <p className="text-[11px] text-[var(--text-muted)] tracking-wider">
          NAISSER
        </p>
      </div>
    </div>
  );
}
