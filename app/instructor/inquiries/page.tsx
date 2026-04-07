"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Inbox, Mail, MailOpen, Clock, School,
  Phone, Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/shared/EmptyState";

interface Inquiry {
  id: string;
  senderName: string;
  senderPhone: string | null;
  senderEmail: string | null;
  schoolName: string | null;
  message: string;
  status: string;
  createdAt: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function InquiriesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [instructorId, setInstructorId] = useState<string | null>(null);

  // 내 강사 ID 찾기
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/instructors?limit=1&status=")
      .then((r) => r.json())
      .then((json) => {
        const mine = json.data?.find(
          (i: { userId?: string }) => i.userId === session.user.id
        );
        if (mine) setInstructorId(mine.id);
      })
      .catch(() => {});
  }, [session?.user?.id]);

  // 문의 목록 조회
  useEffect(() => {
    if (!instructorId) return;
    fetch(`/api/instructors/${instructorId}/inquiries`)
      .then((r) => r.json())
      .then((json) => setInquiries(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [instructorId]);

  const markAsRead = async (id: string) => {
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id ? { ...inq, status: "read" } : inq
      )
    );
    // TODO: PATCH API for status change
  };

  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3" style={{
        background: "var(--bg-grouped)",
        opacity: 0.95,
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
      }}>
        <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-lg active:bg-[var(--bg-muted)] touch-target">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />
        </button>
        <h1 className="text-base font-bold flex-1">받은 문의</h1>
        {newCount > 0 && (
          <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5
                           text-[10px] font-bold text-white rounded-full"
            style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)" }}>
            {newCount}
          </span>
        )}
      </header>

      <div className="relative z-10 px-5 pt-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
          </div>
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="받은 문의가 없어요"
            description="프로필 링크를 공유하면 교사님들의 문의를 받을 수 있어요"
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="space-y-3"
          >
            {inquiries.map((inq) => (
              <motion.div
                key={inq.id}
                variants={fadeIn}
                whileTap={{ scale: 0.98 }}
                onClick={() => markAsRead(inq.id)}
                className={`p-4 rounded-xl transition-all cursor-pointer ${
                  inq.status !== "new" ? "opacity-70" : ""
                }`}
                style={{ background: "var(--bg-grouped-secondary)", border: "none" }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    inq.status === "new" ? "bg-[rgba(0,122,255,0.08)]" : "bg-[var(--bg-muted)]"
                  }`}>
                    {inq.status === "new" ? (
                      <Mail className="w-4 h-4 text-[var(--accent-primary)]" />
                    ) : (
                      <MailOpen className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-[14px] font-bold ${
                        inq.status === "new" ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                      }`}>
                        {inq.senderName}
                      </h3>
                      <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(inq.createdAt)}
                      </span>
                    </div>
                    {inq.schoolName && (
                      <p className="text-[12px] text-[var(--text-muted)] flex items-center gap-0.5 mb-1">
                        <School className="w-3 h-3" /> {inq.schoolName}
                      </p>
                    )}
                    <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2"
                      style={{ lineHeight: 1.6 }}>
                      {inq.message}
                    </p>
                    {inq.senderPhone && (
                      <a href={`tel:${inq.senderPhone}`}
                        className="inline-flex items-center gap-1 mt-2 text-[12px] font-medium text-[var(--accent-primary)]"
                        onClick={(e) => e.stopPropagation()}>
                        <Phone className="w-3 h-3" /> {inq.senderPhone}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
}
