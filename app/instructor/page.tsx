"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Edit, Eye, Star, MessageSquare, School, Settings,
  ChevronRight, Bell, Inbox, Loader2,
  Calendar, Clock, DollarSign, FileCheck2, AlertTriangle,
  FolderLock, TrendingUp, Briefcase, ImageIcon, Receipt, CalendarDays, Award,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { calculateCertification } from "@/lib/utils/certification";
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
  career: string | null;
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

// 퀵 액션 — 2×2 그리드
const QUICK_ACTIONS = [
  { label: "의뢰함", icon: Inbox, href: "/instructor/requests", color: "var(--accent-primary)" },
  { label: "캘린더", icon: CalendarDays, href: "/instructor/calendar", color: "#059669" },
  { label: "인사이트", icon: TrendingUp, href: "/instructor/insights", color: "#7C3AED" },
  { label: "서류함", icon: FolderLock, href: "/instructor/documents", color: "#D97706" },
];

// 나머지 메뉴
const MENU_ITEMS = [
  { label: "프로필 수정", icon: Edit, href: "/instructor/profile/edit" },
  { label: "받은 문의", icon: Inbox, href: "/instructor/inquiries" },
  { label: "수입/지출", icon: Receipt, href: "/instructor/ledger" },
  { label: "출강이력", icon: Briefcase, href: "/instructor/career" },
  { label: "포트폴리오", icon: ImageIcon, href: "/instructor/portfolio" },
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
      <div className="min-h-screen pb-24" style={{ background: "var(--bg-grouped)" }}>
        <div className="px-5 pt-6">
        {/* 프로필 카드 스켈레톤 */}
        <div className="rounded-xl p-5 mb-6 space-y-4" style={{ background: "var(--bg-grouped-secondary)", border: "none" }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[18px] bg-[var(--bg-muted)] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-24 rounded-lg bg-[var(--bg-muted)] animate-pulse" />
              <div className="h-3 w-32 rounded-lg bg-[var(--bg-muted)] animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 flex-1 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
            <div className="h-10 flex-1 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
          </div>
        </div>
        {/* 통계 스켈레톤 */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[1,2,3].map((i) => (
            <div key={i} className="stat-card-premium p-4 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[var(--bg-muted)] mx-auto animate-pulse" />
              <div className="h-5 w-12 rounded-lg bg-[var(--bg-muted)] mx-auto animate-pulse" />
              <div className="h-2 w-10 rounded bg-[var(--bg-muted)] mx-auto animate-pulse" />
            </div>
          ))}
        </div>
        {/* 메뉴 스켈레톤 */}
        <div className="rounded-xl overflow-hidden space-y-0" style={{ background: "var(--bg-grouped-secondary)", border: "none" }}>
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid var(--ios-separator)" }}>
              <div className="w-9 h-9 rounded-xl bg-[var(--bg-muted)] animate-pulse" />
              <div className="h-4 flex-1 rounded-lg bg-[var(--bg-muted)] animate-pulse" />
            </div>
          ))}
        </div>
        </div>
      </div>
    );
  }

  const rating = profile ? parseFloat(profile.averageRating) || 0 : 0;
  const name = profile?.instructorName || session?.user?.name || "강사";

  // 인증마크 계산
  const cert = calculateCertification({
    documentsComplete: docSummary.uploaded >= docSummary.total,
    confirmedCount: careerStats?.confirmedRecords || 0,
    averageRating: rating,
    profileCompleteness: profile ? (
      (profile.instructorName ? 20 : 0) +
      (profile.topics?.length ? 20 : 0) +
      (profile.bio ? 20 : 0) +
      (profile.profileImage ? 15 : 0) +
      (profile.regions?.length ? 15 : 0) +
      10 // 기본
    ) : 0,
  });
  const topicLabels = profile?.topics?.map((t) => getCategoryLabel(t, "subject")) || [];

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg-grouped)" }}>
      <div className="px-5 pt-6">
      {/* ═══ 프로필 요약 카드 ═══ */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 rounded-xl p-5 mb-6 overflow-hidden"
        style={{ background: "var(--bg-grouped-secondary)", border: "none" }}
      >
        {/* 상단 악센트 라인 */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[20px]"
          style={{ background: "linear-gradient(90deg, #0088ff, #6155f5, #0088ff)", backgroundSize: "200% 100%", animation: "meshFloat 4s ease infinite" }} />

        <div className="flex items-center gap-4 mb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="w-16 h-16 rounded-[18px] overflow-hidden shrink-0"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(14px) saturate(1.4)",
              WebkitBackdropFilter: "blur(14px) saturate(1.4)",
              border: "0.5px solid rgba(255,255,255,0.5)",
              boxShadow: "0 4px 16px rgba(0,136,255,0.08), inset 0 1px 0 rgba(255,255,255,0.4)",
              padding: "2px",
            }}
          >
            <div className="w-full h-full rounded-[16px] overflow-hidden relative" style={{ background: "linear-gradient(135deg, rgba(0,136,255,0.1), rgba(97,85,245,0.1))" }}>
              {profile?.profileImage ? (
                <Image src={profile.profileImage} alt="프로필" fill className="object-cover" sizes="64px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-7 h-7" style={{ color: "var(--accent-primary)", opacity: 0.6 }} />
                </div>
              )}
            </div>
          </motion.div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {cert.level !== "none" && (
                <span className="ds-badge" style={{ background: cert.bgColor, color: cert.color }}>
                  {cert.emoji} {cert.label}
                </span>
              )}
              {profile?.isEarlyBird && (
                <span className="ds-badge bg-[rgba(255,204,0,0.08)] text-[#FF9500]">
                  🐣 얼리버드
                </span>
              )}
              {topicLabels.slice(0, 3).map((label) => (
                <span key={label} className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,122,255,0.08)] text-[#007AFF]">
                  {label}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-[var(--text-secondary)]">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-[var(--text-muted)]">({profile?.reviewCount || 0}개 리뷰)</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/instructor/profile/edit"
            className="ds-btn-primary flex-1 flex items-center justify-center gap-1.5 py-2.5"
          >
            <Edit className="w-4 h-4" />
            프로필 수정
          </Link>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                       border border-[var(--ios-separator)] text-sm font-semibold text-[var(--text-secondary)]
                       bg-[var(--bg-surface)] transition-all duration-200"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </button>
        </div>
      </motion.div>

      {/* ═══ 프로필 완성도 카드 ═══ */}
      {profile && (() => {
        const completeness =
          (profile.instructorName ? 15 : 0) +
          (profile.topics?.length ? 15 : 0) +
          (profile.regions?.length ? 10 : 0) +
          (profile.bio ? 20 : 0) +
          (profile.career ? 10 : 0) +
          (profile.profileImage ? 15 : 0) +
          (profile.methods?.length ? 5 : 0) +
          (docSummary.uploaded >= docSummary.total ? 10 : 0);
        if (completeness >= 100) return null;
        return (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-6"
          >
            <Link href="/instructor/profile/edit" className="block rounded-xl p-4" style={{ background: "var(--bg-grouped-secondary)", border: "none" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--text-primary)]">프로필 완성도</span>
                <span className="text-xs font-bold text-blue-500">{completeness}%</span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #3B6CF6, #5B8AFF)" }}
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                {completeness < 50
                  ? "소개와 프로필 사진을 추가하면 교사에게 더 잘 보여요 →"
                  : completeness < 80
                  ? "경력과 서류를 추가하면 인증마크를 받을 수 있어요 →"
                  : "서류를 완비하면 인증 강사가 돼요 →"}
              </p>
            </Link>
          </motion.div>
        );
      })()}

      {/* ═══ 대시보드 통계 카드 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="ds-section-label flex items-center gap-1.5">
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
          ].map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 + idx * 0.08, type: "spring", stiffness: 300, damping: 25 }}
              whileTap={{ scale: 0.97 }}
              className="stat-card-premium cursor-pointer"
              style={{ "--stat-accent": s.color } as React.CSSProperties}
            >
              <div
                className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: s.bgColor }}
              >
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)]">{s.value}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══ 다가오는 수업 + 새 의뢰 + 서류 상태 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3 mb-6"
      >
        {/* 다가오는 수업 */}
        {upcomingClasses.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: "var(--bg-grouped-secondary)", border: "none" }}>
            <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> 다가오는 수업
            </h4>
            <div className="space-y-1.5">
              {upcomingClasses.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-primary)] font-medium">{c.date} {c.schoolName}</span>
                  <span className="text-[var(--text-muted)]">{c.subject}</span>
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
              className="p-4 rounded-xl flex items-center justify-between"
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
            className="p-4 rounded-xl flex items-center justify-between"
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
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          </motion.div>
        </Link>
      </motion.div>

      {/* ═══ 활동 트래커 — 스트라바 스타일 ═══ */}
      <div className="mb-6">
        <ActivityTracker />
      </div>

      {/* ═══ 퀵 액션 — 2×2 그리드 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-4 gap-2 mb-6"
      >
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <motion.div whileTap={{ scale: 0.93 }}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
              style={{ background: "var(--bg-grouped-secondary)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${action.color}10` }}>
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: "var(--text-secondary)" }}>{action.label}</span>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* ═══ 메뉴 리스트 ═══ */}
      <div className="divider-premium" />
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.03, delayChildren: 0.2 }}
        className="rounded-xl overflow-hidden divide-y divide-[var(--ios-separator)]"
        style={{ background: "var(--bg-grouped-secondary)", border: "none" }}
      >
        {MENU_ITEMS.map((item) => (
          <motion.div key={item.href} variants={fadeInUp}>
            <Link
              href={item.href}
              className="menu-item-premium py-4"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(37,99,235,0.06)" }}>
                <item.icon className="w-4 h-4 text-[var(--accent-primary)]" style={{ opacity: 0.7 }} />
              </div>
              <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{item.label}</span>
              {item.label === "알림" && unreadCount > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5
                                 text-[10px] font-bold text-white bg-red-500 rounded-full badge-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {item.label === "의뢰함" && newRequests > 0 && (
                <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5
                                 text-[10px] font-bold text-white rounded-full"
                  style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)" }}>
                  {newRequests}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
      </div>
    </div>
  );
}
