"use client";

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
} from "lucide-react";
import Link from "next/link";


const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const MENU_ITEMS = [
  { label: "프로필 수정", icon: Edit, href: "/instructor/profile/edit" },
  { label: "내 리뷰", icon: Star, href: "/instructor/reviews", badge: "12" },
  { label: "내 커뮤니티 활동", icon: MessageSquare, href: "/instructor/community-activity" },
  { label: "활동학교 관리", icon: School, href: "/instructor/schools" },
  { label: "설정", icon: Settings, href: "/instructor/settings" },
];

export default function InstructorMyPage() {
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
          <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
            <User className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">강사님</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">🐣 얼리버드</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-[var(--text-secondary)]">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">0.0</span>
              <span className="text-[var(--text-muted)]">(0개 리뷰)</span>
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
              {item.badge && (
                <span className="text-xs text-[var(--accent-primary)] font-semibold">
                  {item.badge}
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
