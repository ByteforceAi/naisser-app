"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  SUBJECT_CATEGORIES,
  REGION_CATEGORIES,
} from "@/lib/constants/categories";

/**
 * 빠른 가입 — 30초 완료
 *
 * 이름 + 주제(1개 이상) + 지역(1개 이상) → 바로 대시보드
 * 나머지(소개, 경력, 사진, SNS, 서류)는 프로필 완성도 카드로 유도
 */

export default function QuickOnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [name, setName] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 세션 체크
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
    if (status === "authenticated") {
      const role = (session?.user as { role?: string })?.role;
      if (role === "instructor") router.replace("/instructor");
      // 이름 자동 채우기
      if (session?.user?.name && !name) setName(session.user.name);
    }
  }, [status, session, router, name]);

  const toggleTopic = (id: string) =>
    setTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : prev.length < 5 ? [...prev, id] : prev
    );

  const toggleRegion = (id: string) =>
    setRegions((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );

  const canSubmit = name.trim().length >= 2 && topics.length >= 1 && regions.length >= 1;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorName: name.trim(),
          topics,
          methods: ["face_to_face"], // 기본값
          regions,
          agreedToTerms: true,
          agreedToPrivacy: true,
        }),
      });

      if (res.ok) {
        // 성공 — localStorage 정리 후 대시보드로
        localStorage.removeItem("naisser_onboarding");
        router.push("/instructor");
      } else if (res.status === 401) {
        setError("세션이 만료되었습니다. 다시 로그인해주세요.");
        setTimeout(() => { window.location.href = "/"; }, 2000);
      } else {
        const json = await res.json();
        setError(json.error || "등록에 실패했습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center page-bg-mesh page-bg-mesh-blue page-bg-dots">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots">
      <div className="max-w-lg mx-auto px-5 pt-12 pb-24">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
            강사 프로필 만들기
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            3가지만 입력하면 바로 시작할 수 있어요
          </p>
        </motion.div>

        {/* 1. 이름 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <label className="ds-label flex items-center gap-1 mb-2">
            이름 <span className="text-blue-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="강사명 (실명 또는 활동명)"
            className="ds-input text-base"
            maxLength={20}
          />
        </motion.div>

        {/* 2. 주제 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <label className="ds-label flex items-center gap-1 mb-2">
            수업 주제 <span className="text-blue-500">*</span>
            <span className="text-[11px] text-[var(--text-muted)] ml-1">(1~5개 선택)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_CATEGORIES.map((cat) => {
              const selected = topics.includes(cat.id);
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleTopic(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    selected
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-[var(--bg-surface)] border border-[var(--ios-separator)] text-[var(--text-secondary)]"
                  }`}
                >
                  {selected && <Check className="w-3 h-3" />}
                  {cat.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* 3. 지역 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <label className="ds-label flex items-center gap-1 mb-2">
            활동 지역 <span className="text-blue-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {REGION_CATEGORIES.map((cat) => {
              const selected = regions.includes(cat.id);
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleRegion(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selected
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-[var(--bg-surface)] border border-[var(--ios-separator)] text-[var(--text-secondary)]"
                  }`}
                >
                  {cat.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* 에러 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl text-sm text-red-600 bg-red-50 border border-red-100 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* 완료 버튼 */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full py-4 rounded-xl text-base font-bold text-white disabled:opacity-40 transition-all"
          style={{
            background: canSubmit ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)" : "#E5E7EB",
            boxShadow: canSubmit ? "0 4px 20px rgba(59,108,246,0.3)" : "none",
          }}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> 등록 중...
            </span>
          ) : (
            "시작하기"
          )}
        </motion.button>

        <p className="text-[11px] text-[var(--text-muted)] text-center mt-3">
          나머지 정보(소개, 경력, 사진)는 나중에 입력할 수 있어요
        </p>

        {/* 약관 동의 문구 */}
        <p className="text-[11px] text-[var(--text-muted)] text-center mt-6">
          시작하기를 누르면 이용약관 및 개인정보처리방침에 동의합니다
        </p>
      </div>
    </div>
  );
}
