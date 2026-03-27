"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Edit,
  Eye,
  Star,
  MessageSquare,
  School,
  Settings,
  ChevronRight,
  Bell,
  Inbox,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getCategoryLabel } from "@/lib/constants/categories";

interface InstructorProfile {
  id: string;
  instructorName: string;
  profileImage: string | null;
  topics: string[];
  methods: string[];
  regions: string[];
  averageRating: string;
  reviewCount: number;
  isEarlyBird: boolean;
  bio: string | null;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const MENU_ITEMS = [
  { label: "프로필 수정", icon: Edit, href: "/instructor/profile/edit" },
  { label: "의뢰함", icon: Inbox, href: "/instructor/requests" },
  { label: "내 리뷰", icon: Star, href: "/instructor/reviews" },
  { label: "내 커뮤니티 활동", icon: MessageSquare, href: "/instructor/community-activity" },
  { label: "활동학교 관리", icon: School, href: "/instructor/schools" },
  { label: "알림", icon: Bell, href: "/instructor/notifications" },
  { label: "설정", icon: Settings, href: "/instructor/settings" },
];

export default function InstructorMyPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        // 강사 프로필 조회 (현재 로그인 유저 기준)
        const [profileRes, notiRes] = await Promise.all([
          fetch("/api/instructors?limit=1&status="),
          fetch("/api/notifications/unread-count"),
        ]);

        if (profileRes.ok) {
          const json = await profileRes.json();
          // 현재 유저의 프로필을 찾기 — userId 기반
          const mine = json.data?.find(
            (inst: InstructorProfile & { userId?: string }) =>
              inst.userId === session?.user?.id
          );
          if (mine) setProfile(mine);
          else if (json.data?.[0]) setProfile(json.data[0]); // fallback
        }

        if (notiRes.ok) {
          const notiJson = await notiRes.json();
          setUnreadCount(notiJson.data?.count || 0);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    if (session?.user?.id) load();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  const rating = profile ? parseFloat(profile.averageRating) || 0 : 0;
  const name = profile?.instructorName || session?.user?.name || "강사";
  const topicLabels = profile?.topics?.map((t) => getCategoryLabel(t, "subject")) || [];

  return (
    <div className="px-4 pt-6">
      {/* 프로필 요약 카드 */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4 }}
        className="glass-card p-5 mb-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center overflow-hidden shrink-0">
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-[var(--text-muted)]" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {profile?.isEarlyBird && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                  🐣 얼리버드
                </span>
              )}
              {topicLabels.slice(0, 3).map((label) => (
                <span
                  key={label}
                  className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[var(--accent-primary)]"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-[var(--text-secondary)]">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-[var(--text-muted)]">
                ({profile?.reviewCount || 0}개 리뷰)
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/instructor/profile/edit"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                       bg-[var(--accent-primary)] text-white text-sm font-semibold
                       shadow-btn-primary transition-all duration-200 touch-target"
          >
            <Edit className="w-4 h-4" />
            프로필 수정
          </Link>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                       border border-[var(--glass-border)] text-sm font-semibold
                       bg-[var(--bg-surface)] transition-all duration-200 touch-target"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </button>
        </div>
      </motion.div>

      {/* 메뉴 리스트 */}
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.05 }}
        className="space-y-1"
      >
        {MENU_ITEMS.map((item) => (
          <motion.div key={item.href} variants={fadeInUp}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl
                         hover:bg-[var(--bg-elevated)] transition-colors duration-200 touch-target"
            >
              <item.icon className="w-5 h-5 text-[var(--text-secondary)]" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {item.label === "알림" && unreadCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5
                                 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
