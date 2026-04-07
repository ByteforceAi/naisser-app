"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, School, Calendar, BookOpen,
  Loader2, ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TeachingRecord {
  id: string;
  instructorId: string;
  schoolName: string;
  date: string;
  subject: string;
  startTime: string | null;
  endTime: string | null;
  hours: string | null;
  status: string;
  instructorName?: string;
}

export default function ConfirmPage() {
  const router = useRouter();
  const [records, setRecords] = useState<TeachingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/teaching-records?status=pending");
      if (res.ok) {
        const json = await res.json();
        setRecords(json.data || []);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleConfirm = async (id: string) => {
    setConfirming(id);
    try {
      const res = await fetch(`/api/teaching-records/${id}/confirm`, { method: "PATCH" });
      if (res.ok) {
        setRecords((prev) => prev.map((r) =>
          r.id === id ? { ...r, status: "confirmed" } : r
        ));
      } else {
        const json = await res.json();
        alert(json.error || "확인에 실패했습니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setConfirming(null);
    }
  };

  const pending = records.filter((r) => r.status === "pending");
  const confirmed = records.filter((r) => r.status === "confirmed");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0088ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-green page-bg-dots">
      <div className="page-header-premium">
        <button onClick={() => router.back()} className="ds-back-btn touch-target">
          <ArrowLeft className="w-5 h-5" style={{ color: "#555" }} />
        </button>
        <h1 className="text-[15px] font-bold" style={{ color: "#111" }}>출강 확인</h1>
      </div>

      <div className="px-5 pt-4 pb-24">
        {/* 출강확인 목록 */}
        {/* 대기 중 */}
        {pending.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-amber-600 mb-3 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 확인 대기 ({pending.length}건)
            </h2>
            <div className="space-y-2">
              {pending.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "1.5px solid rgba(245,158,11,0.15)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-sm font-bold text-gray-900">{r.schoolName}</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleConfirm(r.id)}
                      disabled={confirming === r.id}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-500 disabled:opacity-50"
                    >
                      {confirming === r.id ? "처리중..." : "✓ 확인"}
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{r.date}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{r.subject}</span>
                    {r.hours && <span>{r.hours}시간</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 확인 완료 */}
        {confirmed.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-emerald-600 mb-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 확인 완료 ({confirmed.length}건)
            </h2>
            <div className="space-y-2">
              {confirmed.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl opacity-60"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-gray-700">{r.schoolName}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-[var(--text-muted)]">
                    <span>{r.date}</span>
                    <span>{r.subject}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && confirmed.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-[var(--text-muted)]">확인할 출강 기록이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
