"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  X, Star, MapPin, Phone, Globe, MessageSquare, Send,
  ExternalLink, Check, Copy,
} from "lucide-react";
import { getCategoryLabel } from "@/lib/constants/categories";

interface Instructor {
  id: string;
  instructorName: string;
  profileImage: string | null;
  topics: string[];
  methods: string[];
  regions: string[];
  bio: string | null;
  lectureContent: string | null;
  career: string | null;
  averageRating: string;
  reviewCount: number;
  isEarlyBird: boolean;
  phone: string;
  snsAccounts: string[] | null;
}

interface Review {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  teacherName?: string;
  schoolName?: string;
}

interface Props {
  instructor: Instructor | null;
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

/* ─── 애니메이션 Variants ─── */
const SHEET_SPRING = { type: "spring" as const, stiffness: 340, damping: 28 };

const STAGGER_PARENT = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const CHIP_POP = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 20 },
  },
};

const CTA_PULSE = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function InstructorDetailSheet({
  instructor,
  isOpen,
  onClose,
  isLoggedIn,
}: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  /* ─── 드래그로 닫기 ─── */
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 500) {
      onClose();
    }
  };

  /* ─── 리뷰 fetch ─── */
  useEffect(() => {
    if (!instructor || !isOpen) return;
    setLoadingReviews(true);
    fetch(`/api/instructors/${instructor.id}/reviews`)
      .then((r) => r.json())
      .then((json) => setReviews(json.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [instructor, isOpen]);

  /* ─── 전화번호 복사 (#7) ─── */
  const handleCopyPhone = async () => {
    if (!instructor?.phone) return;
    try {
      await navigator.clipboard.writeText(instructor.phone);
      setCopiedPhone(true);
      if (navigator.vibrate) navigator.vibrate(10);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      // clipboard API 미지원 fallback
    }
  };

  /* ─── 별점 카운트업 ─── */
  const [displayRating, setDisplayRating] = useState(0);
  useEffect(() => {
    if (!isOpen || !instructor) {
      setDisplayRating(0);
      return;
    }
    const target = parseFloat(instructor.averageRating) || 0;
    if (target === 0) {
      setDisplayRating(0);
      return;
    }
    let frame: number;
    const start = performance.now();
    const duration = 600;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayRating(target * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isOpen, instructor]);

  if (!instructor) return null;

  const topicLabels =
    instructor.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
  const methodLabels =
    instructor.methods?.map((m) => getCategoryLabel(m, "method")) || [];
  const regionLabels =
    instructor.regions?.map((r) => getCategoryLabel(r, "region")) || [];

  // SNS 파싱
  const snsLinks = (instructor.snsAccounts || [])
    .map((entry) => {
      const idx = entry.indexOf(":");
      if (idx === -1) return null;
      const platform = entry.slice(0, idx);
      const url = entry.slice(idx + 1);
      if (url === "***") return null;
      return { platform, url };
    })
    .filter(Boolean) as { platform: string; url: string }[];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ─── 오버레이: 블러 트랜지션 (#6) ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* ─── 시트: 스프링 오픈 (#1) + 드래그 닫기 ─── */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SHEET_SPRING}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-[60] max-h-[85vh]
                       rounded-t-3xl overflow-hidden"
            style={{ background: "#F8F9FC" }}
          >
            {/* 스크롤 컨테이너 */}
            <div className="overflow-y-auto max-h-[85vh] overscroll-contain">
              {/* 드래그 핸들 */}
              <div
                className="flex justify-center pt-3 pb-2 sticky top-0 z-10"
                style={{
                  background: "rgba(248,249,252,0.95)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className="w-10 h-1.5 rounded-full bg-gray-300/80" />
              </div>

              {/* 닫기 버튼 */}
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100
                           flex items-center justify-center z-20"
              >
                <X className="w-4 h-4 text-gray-500" />
              </motion.button>

              {/* ─── 컨텐츠: Staggered 등장 (#2) ─── */}
              <motion.div
                className="px-5 max-w-[520px] mx-auto"
                variants={STAGGER_PARENT}
                initial="hidden"
                animate="visible"
                style={{
                  paddingBottom:
                    "calc(80px + env(safe-area-inset-bottom, 0px))",
                }}
              >
                {/* ── 프로필 ── */}
                <motion.div
                  variants={FADE_UP}
                  className="flex items-center gap-4 mb-5"
                >
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center
                               text-xl font-bold text-gray-400 overflow-hidden shrink-0"
                    whileHover={{
                      boxShadow: "0 0 0 3px rgba(59,130,246,0.2)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {instructor.profileImage ? (
                      <img
                        src={instructor.profileImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      instructor.instructorName.charAt(0)
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        {instructor.instructorName}
                      </h2>
                      {instructor.isEarlyBird && (
                        <span title="얼리버드">🐣</span>
                      )}
                    </div>
                    {/* 별점 카운트업 */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold tabular-nums">
                        {displayRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({instructor.reviewCount}개 리뷰)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {regionLabels.join(", ")}
                    </div>
                  </div>
                </motion.div>

                {/* ── 태그 칩 팝인 (#3) ── */}
                <motion.div
                  variants={FADE_UP}
                  className="flex flex-wrap gap-1.5 mb-4"
                >
                  {topicLabels.map((l, i) => (
                    <motion.span
                      key={l}
                      variants={CHIP_POP}
                      custom={i}
                      className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-600 font-medium"
                    >
                      {l}
                    </motion.span>
                  ))}
                  {methodLabels.map((l, i) => (
                    <motion.span
                      key={l}
                      variants={CHIP_POP}
                      custom={topicLabels.length + i}
                      className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                    >
                      {l}
                    </motion.span>
                  ))}
                </motion.div>

                {/* ── 소개 ── */}
                {instructor.bio && (
                  <motion.div variants={FADE_UP} className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-400 mb-1.5">
                      소개
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {instructor.bio}
                    </p>
                  </motion.div>
                )}

                {instructor.lectureContent && (
                  <motion.div variants={FADE_UP} className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-400 mb-1.5">
                      수업 소개
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {instructor.lectureContent}
                    </p>
                  </motion.div>
                )}

                {instructor.career && (
                  <motion.div variants={FADE_UP} className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-400 mb-1.5">
                      주요 경력
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {instructor.career}
                    </p>
                  </motion.div>
                )}

                {/* ── 연락처 + 전화번호 복사 (#7) ── */}
                {isLoggedIn ? (
                  <motion.div
                    variants={FADE_UP}
                    className="p-4 rounded-2xl mb-4"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      border: "1.5px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <h3 className="text-xs font-semibold text-gray-400 mb-3">
                      연락처
                    </h3>
                    <div className="space-y-2">
                      {/* 전화번호 — 탭하면 복사 */}
                      <button
                        onClick={handleCopyPhone}
                        className="flex items-center gap-2 text-sm text-gray-700 w-full text-left
                                   hover:bg-gray-50 -mx-1 px-1 py-1 rounded-lg transition-colors group"
                      >
                        <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="flex-1">{instructor.phone}</span>
                        <AnimatePresence mode="wait">
                          {copiedPhone ? (
                            <motion.span
                              key="check"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="flex items-center gap-1 text-xs text-green-600 font-medium"
                            >
                              <Check className="w-3.5 h-3.5" /> 복사됨
                            </motion.span>
                          ) : (
                            <motion.span
                              key="copy"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.4 }}
                              exit={{ opacity: 0 }}
                            >
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>

                      {snsLinks.map((sns) => (
                        <a
                          key={sns.url}
                          href={sns.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Globe className="w-4 h-4" />
                          {sns.platform}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={FADE_UP}
                    className="p-4 rounded-2xl mb-4 text-center"
                    style={{
                      background: "rgba(59,108,246,0.04)",
                      border: "1.5px solid rgba(59,108,246,0.1)",
                    }}
                  >
                    <p className="text-sm text-gray-500 mb-2">
                      연락처를 확인하려면 로그인이 필요합니다
                    </p>
                    <a
                      href="/"
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      로그인하기
                    </a>
                  </motion.div>
                )}

                {/* ── 리뷰 ── */}
                <motion.div variants={FADE_UP} className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> 리뷰 (
                    {instructor.reviewCount})
                  </h3>
                  {loadingReviews ? (
                    <div className="flex justify-center py-4">
                      <div className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      아직 리뷰가 없습니다
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {reviews.slice(0, 5).map((r) => (
                        <div
                          key={r.id}
                          className="p-3 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.7)",
                            border: "1px solid rgba(0,0,0,0.04)",
                          }}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className="w-3 h-3"
                                fill={s <= r.rating ? "#FBBF24" : "none"}
                                stroke={
                                  s <= r.rating ? "#FBBF24" : "#D1D5DB"
                                }
                              />
                            ))}
                            <span className="text-[10px] text-gray-400 ml-1">
                              {new Date(r.createdAt).toLocaleDateString(
                                "ko-KR"
                              )}
                            </span>
                          </div>
                          {r.content && (
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {r.content}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* ── 하단 CTA: 펄스 (#5) ── */}
                {isLoggedIn && (
                  <motion.div variants={CTA_PULSE} className="flex gap-2">
                    <motion.a
                      href={`tel:${instructor.phone}`}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5
                                 rounded-2xl text-sm font-bold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                        boxShadow: "0 4px 16px rgba(59,108,246,0.3)",
                      }}
                    >
                      <Phone className="w-4 h-4" /> 전화하기
                    </motion.a>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5
                                 rounded-2xl text-sm font-bold border border-gray-200
                                 text-gray-700 bg-white"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                    >
                      <Send className="w-4 h-4" /> 수업 의뢰
                    </motion.button>
                  </motion.div>
                )}

                {/* 전체 프로필 보기 링크 */}
                <motion.a
                  href={`/instructor/${instructor.id}`}
                  variants={CTA_PULSE}
                  className="block text-center text-xs text-blue-500 font-medium mt-2 py-2"
                >
                  전체 프로필 보기 →
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
