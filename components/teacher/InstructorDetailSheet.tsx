"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Star, MapPin, Phone, Globe, MessageSquare, Send,
  ChevronDown, ExternalLink,
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

export function InstructorDetailSheet({ instructor, isOpen, onClose, isLoggedIn }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!instructor || !isOpen) return;
    setLoadingReviews(true);
    fetch(`/api/instructors/${instructor.id}/reviews`)
      .then((r) => r.json())
      .then((json) => setReviews(json.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [instructor, isOpen]);

  if (!instructor) return null;

  const rating = parseFloat(instructor.averageRating) || 0;
  const topicLabels = instructor.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
  const methodLabels = instructor.methods?.map((m) => getCategoryLabel(m, "method")) || [];
  const regionLabels = instructor.regions?.map((r) => getCategoryLabel(r, "region")) || [];

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
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-50"
            style={{ backdropFilter: "blur(4px)" }}
          />

          {/* 시트 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto
                       rounded-t-3xl"
            style={{ background: "#F8F9FC" }}
          >
            {/* 드래그 핸들 */}
            <div className="flex justify-center pt-3 pb-2 sticky top-0 z-10"
              style={{ background: "rgba(248,249,252,0.95)", backdropFilter: "blur(20px)" }}
            >
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* 닫기 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center z-20"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            <div className="px-5 pb-8 max-w-[520px] mx-auto">
              {/* 프로필 */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400 overflow-hidden shrink-0">
                  {instructor.profileImage ? (
                    <img src={instructor.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    instructor.instructorName.charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{instructor.instructorName}</h2>
                    {instructor.isEarlyBird && <span title="얼리버드">🐣</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({instructor.reviewCount}개 리뷰)</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {regionLabels.join(", ")}
                  </div>
                </div>
              </div>

              {/* 태그 */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {topicLabels.map((l) => (
                  <span key={l} className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-600 font-medium">{l}</span>
                ))}
                {methodLabels.map((l) => (
                  <span key={l} className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{l}</span>
                ))}
              </div>

              {/* 소개 */}
              {instructor.bio && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 mb-1.5">소개</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{instructor.bio}</p>
                </div>
              )}

              {instructor.lectureContent && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 mb-1.5">수업 소개</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{instructor.lectureContent}</p>
                </div>
              )}

              {instructor.career && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 mb-1.5">주요 경력</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{instructor.career}</p>
                </div>
              )}

              {/* 연락처 (로그인 시) */}
              {isLoggedIn ? (
                <div className="p-4 rounded-2xl mb-4"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(0,0,0,0.06)" }}
                >
                  <h3 className="text-xs font-semibold text-gray-400 mb-3">연락처</h3>
                  <div className="space-y-2">
                    <a href={`tel:${instructor.phone}`} className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-blue-500" />
                      {instructor.phone}
                    </a>
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
                </div>
              ) : (
                <div className="p-4 rounded-2xl mb-4 text-center"
                  style={{ background: "rgba(59,108,246,0.04)", border: "1.5px solid rgba(59,108,246,0.1)" }}
                >
                  <p className="text-sm text-gray-500 mb-2">연락처를 확인하려면 로그인이 필요합니다</p>
                  <a href="/" className="text-sm font-semibold text-blue-600 hover:underline">로그인하기</a>
                </div>
              )}

              {/* 리뷰 */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> 리뷰 ({instructor.reviewCount})
                </h3>
                {loadingReviews ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">아직 리뷰가 없습니다</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.slice(0, 5).map((r) => (
                      <div key={r.id} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.04)" }}>
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3 h-3" fill={s <= r.rating ? "#FBBF24" : "none"} stroke={s <= r.rating ? "#FBBF24" : "#D1D5DB"} />
                          ))}
                          <span className="text-[10px] text-gray-400 ml-1">
                            {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        {r.content && <p className="text-xs text-gray-600 leading-relaxed">{r.content}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 하단 CTA */}
              {isLoggedIn && (
                <div className="flex gap-2">
                  <a
                    href={`tel:${instructor.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)" }}
                  >
                    <Phone className="w-4 h-4" /> 전화하기
                  </a>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold
                                     border border-gray-200 text-gray-700 bg-white">
                    <Send className="w-4 h-4" /> 수업 의뢰
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
