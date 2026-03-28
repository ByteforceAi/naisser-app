"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Edit, Eye, Star, MessageSquare, School, Settings,
  ChevronRight, Bell, Inbox, Loader2,
  Calendar, Clock, DollarSign, FileCheck2, AlertTriangle,
  FolderLock, TrendingUp, Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getCategoryLabel } from "@/lib/constants/categories";
import { ActivityTracker } from "@/components/instructor/ActivityTracker";

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

interface CareerStats {
  totalRecords: number;
  confirmedRecords: number;
  totalHours: number;
  totalFee: number;
}

interface TeachingRecord {
  id: string;
  schoolName: string;
  date: string;
  subject: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
}

interface DocSummary {
  total: number;
  uploaded: number;
  expiringSoon: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const MENU_ITEMS = [
  { label: "프로필 수정", icon: Edit, href: "/instructor/profile/edit" },
  { label: "출강이력", icon: Briefcase, href: "/instructor/career" },
  { label: "서류함", icon: FolderLock, href: "/instructor/documents" },
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
  const [careerStats, setCareerStats] = useState<CareerStats | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<TeachingRecord[]>([]);
  const [docSummary, setDocSummary] = useState<DocSummary>({ total: 6, uploaded: 0, expiringSoon: 0 });
  const [newRequests, setNewRequests] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, notiRes, careerRes, docsRes, reqRes] = await Promise.all([
          fetch("/api/instructors?limit=1&status="),
          fetch("/api/notifications/unread-count"),
          fetch("/api/teaching-records"),
          fetch("/api/documents"),
          fetch("/api/requests/received?status=pending"),
        ]);

        if (profileRes.ok) {
          const json = await profileRes.json();
          const mine = json.data?.find(
            (inst: InstructorProfile & { userId?: string }) =>
              inst.userId === session?.user?.id
          );
          if (mine) setProfile(mine);
          else if (json.data?.[0]) setProfile(json.data[0]);
        }

        if (notiRes.ok) {
          const notiJson = await notiRes.json();
          setUnreadCount(notiJson.data?.count || 0);
        }

        if (careerRes.ok) {
          const careerJson = await careerRes.json();
          setCareerStats(careerJson.stats || null);
          // 미래 날짜 수업만 (다가오는 수업)
          const today = new Date().toISOString().slice(0, 10);
          const upcoming = (careerJson.data || [])
            .filter((r: TeachingRecord) => r.date >= today)
            .slice(0, 3);
          setUpcomingClasses(upcoming);
        }

        if (docsRes.ok) {
          const docsJson = await docsRes.json();
          const docs = docsJson.data || [];
          const requiredTypes = ["criminal_record", "bank_account", "resume"];
          const uploadedRequired = requiredTypes.filter(
            (t) => docs.some((d: { docType: string }) => d.docType === t)
          ).length;
          const expiring = docs.filter((d: { expiresAt: string | null }) => {
            if (!d.expiresAt) return false;
            const diff = new Date(d.expiresAt).getTime() - Date.now();
            return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
          }).length;
          setDocSummary({
            total: requiredTypes.length,
            uploaded: uploadedRequired,
            expiringSoon: expiring,
          });
        }

        if (reqRes.ok) {
          const reqJson = await reqRes.json();
          setNewRequests(reqJson.data?.length || 0);
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const rating = profile ? parseFloat(profile.averageRating) || 0 : 0;
  const name = profile?.instructorName || session?.user?.name || "강사";
  const topicLabels = profile?.topics?.map((t) => getCategoryLabel(t, "subject")) || [];

  return (
    <div className="px-4 pt-6 pb-24">
      {/* ═══ 프로필 요약 카드 ═══ */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4 }}
        className="p-5 mb-5 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.04)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {profile?.isEarlyBird && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                  🐣 얼리버드
                </span>
              )}
              {topicLabels.slice(0, 3).map((label) => (
                <span key={label} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-gray-400">({profile?.reviewCount || 0}개 리뷰)</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/instructor/profile/edit"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                       text-white text-sm font-semibold transition-all duration-200"
            style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)", boxShadow: "0 4px 12px rgba(59,108,246,0.25)" }}
          >
            <Edit className="w-4 h-4" />
            프로필 수정
          </Link>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                       border border-gray-200 text-sm font-semibold text-gray-600
                       bg-white transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </button>
        </div>
      </motion.div>

      {/* ═══ 대시보드 통계 카드 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            이번 달 활동
          </h3>
          <Link href="/instructor/career" className="text-xs text-blue-500 font-medium">전체보기 →</Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "출강",
              value: `${careerStats?.confirmedRecords || 0}회`,
              icon: Calendar,
              color: "#059669",
              bgColor: "rgba(16,185,129,0.08)",
            },
            {
              label: "누적 시간",
              value: `${(careerStats?.totalHours || 0).toFixed(0)}h`,
              icon: Clock,
              color: "#2563EB",
              bgColor: "rgba(37,99,235,0.08)",
            },
            {
              label: "수입",
              value: careerStats?.totalFee
                ? `${(careerStats.totalFee / 10000).toFixed(0)}만`
                : "-",
              icon: DollarSign,
              color: "#D97706",
              bgColor: "rgba(217,119,6,0.08)",
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileTap={{ scale: 0.97 }}
              className="p-3 rounded-2xl text-center cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: s.bgColor }}
              >
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══ 다가오는 수업 + 새 의뢰 + 서류 상태 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2 mb-5"
      >
        {/* 다가오는 수업 */}
        {upcomingClasses.length > 0 && (
          <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> 다가오는 수업
            </h4>
            <div className="space-y-1.5">
              {upcomingClasses.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-900 font-medium">{c.date} {c.schoolName}</span>
                  <span className="text-gray-400">{c.subject}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 새 의뢰 */}
        {newRequests > 0 && (
          <Link href="/instructor/requests">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-2xl flex items-center justify-between"
              style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)" }}
            >
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-blue-700">새 의뢰 {newRequests}건</span>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400" />
            </motion.div>
          </Link>
        )}

        {/* 서류 상태 */}
        <Link href="/instructor/documents">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-2xl flex items-center justify-between"
            style={{
              background: docSummary.uploaded >= docSummary.total
                ? "rgba(16,185,129,0.06)"
                : "rgba(245,158,11,0.06)",
              border: `1px solid ${docSummary.uploaded >= docSummary.total
                ? "rgba(16,185,129,0.12)"
                : "rgba(245,158,11,0.12)"}`,
            }}
          >
            <div className="flex items-center gap-2">
              {docSummary.uploaded >= docSummary.total ? (
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span className="text-sm font-medium" style={{
                color: docSummary.uploaded >= docSummary.total ? "#059669" : "#D97706"
              }}>
                서류 {docSummary.uploaded}/{docSummary.total}
                {docSummary.expiringSoon > 0 && ` · ${docSummary.expiringSoon}건 만료 임박`}
                {docSummary.uploaded >= docSummary.total && " ✅ 완비"}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </motion.div>
        </Link>
      </motion.div>

      {/* ═══ 활동 트래커 — 스트라바 스타일 ═══ */}
      <div className="mb-5">
        <ActivityTracker />
      </div>

      {/* ═══ 메뉴 리스트 ═══ */}
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.03 }}
        className="space-y-0.5"
      >
        {MENU_ITEMS.map((item) => (
          <motion.div key={item.href} variants={fadeInUp}>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl
                         hover:bg-gray-50 transition-colors duration-200"
            >
              <item.icon className="w-5 h-5 text-gray-400" />
              <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
              {item.label === "알림" && unreadCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5
                                 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {item.label === "의뢰함" && newRequests > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5
                                 text-[10px] font-bold text-white bg-blue-500 rounded-full">
                  {newRequests}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
