"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, Star, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { getCategoryLabel } from "@/lib/constants/categories";

interface FavoriteItem {
  id: string;
  instructorId: string;
  instructorName: string;
  profileImage: string | null;
  topics: string[];
  regions: string[];
  averageRating: string;
  reviewCount: number;
  isEarlyBird: boolean;
}

const TOPIC_COLORS: Record<string, string> = {
  환경: "#059669", 생명존중: "#10B981", AI: "#6366F1", 코딩: "#3B82F6",
  미술: "#EC4899", 공예: "#F59E0B", 체육: "#EF4444", 음악: "#8B5CF6",
  진로: "#0891B2", 독서: "#78716C", 기타: "#6B7280",
};

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const removeFavorite = async (instructorId: string) => {
    setItems((prev) => prev.filter((i) => i.instructorId !== instructorId));
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructorId }),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-xl font-bold text-gray-900 mb-1">즐겨찾기</h1>
      <p className="text-sm text-gray-400 mb-5">관심 있는 강사를 모아보세요</p>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">아직 즐겨찾기한 강사가 없습니다</p>
          <Link href="/teacher/home" className="text-xs text-blue-500 mt-2 inline-block">
            강사 검색하러 가기 →
          </Link>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="space-y-3"
        >
          {items.map((item) => {
            const topicLabels = item.topics?.map((t) => getCategoryLabel(t, "subject")) || [];
            const regionLabels = item.regions?.map((r) => getCategoryLabel(r, "region")) || [];
            const firstTopic = topicLabels[0] || "교육";
            const color = TOPIC_COLORS[firstTopic] || "#3B82F6";
            const rating = parseFloat(item.averageRating) || 0;

            return (
              <motion.div
                key={item.id}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                className="p-4 rounded-2xl flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.04)" }}
              >
                <Link href={`/instructor/${item.instructorId}`} className="shrink-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${color}20, ${color}40)` }}>
                    {item.profileImage ? (
                      <img src={item.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold" style={{ color }}>
                        {item.instructorName.charAt(0)}
                      </div>
                    )}
                  </div>
                </Link>
                <Link href={`/instructor/${item.instructorId}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{item.instructorName}</h3>
                    {item.isEarlyBird && <span className="text-[10px]">🐣</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
                    </div>
                    {regionLabels[0] && (
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />{regionLabels[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {topicLabels.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{t}</span>
                    ))}
                  </div>
                </Link>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeFavorite(item.instructorId)} className="shrink-0 p-2">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
