"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BubbleChip } from "@/components/onboarding/BubbleChip";
import {
  SUBJECT_CATEGORIES,
  METHOD_CATEGORIES,
} from "@/lib/constants/categories";

// ═══════════════════════════════════════════
// 타입 & 상수
// ═══════════════════════════════════════════

const TOTAL_STEPS = 5;
const MAIN_COLOR = "#3B6CF6";

/** 지역 카테고리 + "전국" 옵션 */
const REGION_OPTIONS = [
  { id: "seoul", label: "서울" },
  { id: "incheonGyeonggi", label: "인천경기" },
  { id: "daejeonChungnam", label: "대전충남" },
  { id: "chungbuk", label: "충북" },
  { id: "gwangjuJeonnam", label: "광주전남" },
  { id: "jeonbuk", label: "전북" },
  { id: "daeguGyeongbuk", label: "대구경북" },
  { id: "busanUlsanGyeongnam", label: "부산울산경남" },
  { id: "gangwon", label: "강원" },
  { id: "jeju", label: "제주" },
  { id: "nationwide", label: "전국" },
];

interface FormData {
  topics: string[];
  methods: string[];
  regions: string[];
  instructorName: string;
  phone: string;
  sns: string;
  lectureContent: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
}

// ═══════════════════════════════════════════
// 슬라이드 전환 variants
// ═══════════════════════════════════════════

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const slideTransition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
};

// ═══════════════════════════════════════════
// AI 오브 (랜딩과 동일)
// ═══════════════════════════════════════════

/** 랜딩과 동일한 AI 오브 (축소 버전) */
function AiOrbSmall() {
  return (
    <div className="w-9 h-9 rounded-full relative shrink-0"
      style={{ boxShadow: "0 0 20px rgba(37,99,235,0.2)" }}
    >
      {/* 외부 conic 링 — 블루→바이올렛 회전 */}
      <div className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #2563eb, #7c3aed, #2563eb)",
          animation: "orbSpin 8s linear infinite, orbFloat 3s ease-in-out infinite",
        }}
      />
      {/* 내부 흰색 코어 */}
      <div className="absolute inset-[3px] rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-sm" />
      {/* 내부 그라데이션 하이라이트 */}
      <div className="absolute inset-[5px] rounded-full opacity-60"
        style={{
          background: "radial-gradient(circle at 35% 35%, rgba(37,99,235,0.4), rgba(124,58,237,0.2), transparent 70%)",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// AI 챗 버블
// ═══════════════════════════════════════════

function AiBubble({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="flex items-start gap-2.5"
    >
      <AiOrbSmall />
      <div className="px-4 py-2.5 rounded-xl rounded-bl-md max-w-[85%]
                      text-[14px] leading-relaxed text-[var(--text-primary)]"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 참고사항 토글
// ═══════════════════════════════════════════

function GuideToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-3"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <span>💡</span>
        <span>참고사항</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3" />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <div className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed space-y-2">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 프로그레스 바
// ═══════════════════════════════════════════

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = (step / total) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${MAIN_COLOR}, #5B8AFF)` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as const }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
            style={{ background: MAIN_COLOR, boxShadow: `0 0 8px 2px rgba(59,108,246,0.4)` }}
          />
        </motion.div>
      </div>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={step}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-[var(--text-muted)] tabular-nums w-8 text-right"
        >
          {step}/{total}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════
// 커스텀 체크박스
// ═══════════════════════════════════════════

function GlassCheckbox({
  checked,
  onChange,
  label,
  linkText,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  linkText?: string;
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-3 w-full p-4 rounded-xl text-left transition-all duration-200"
      style={{
        background: checked ? "rgba(59,108,246,0.06)" : "rgba(255,255,255,0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: checked ? "1.5px solid rgba(59,108,246,0.3)" : "1.5px solid rgba(0,0,0,0.06)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      {/* 체크박스 */}
      <motion.div
        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
        animate={{
          background: checked
            ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)"
            : "rgba(255,255,255,0.8)",
          borderColor: checked ? "transparent" : "rgba(0,0,0,0.12)",
        }}
        style={{ border: "1.5px solid" }}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <motion.path
                d="M3 7.5L5.5 10L11 4"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, delay: 0.1 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="flex-1">
        <span className="text-sm text-[var(--text-secondary)] font-medium">{label}</span>
        {linkText && (
          <span className="text-xs text-[var(--text-muted)] ml-1">({linkText})</span>
        )}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════
// 하단 고정 바
// ═══════════════════════════════════════════

function BottomBar({
  count,
  label,
  canProceed,
  onNext,
  buttonText = "다음",
}: {
  count?: number;
  label?: string;
  canProceed: boolean;
  onNext: () => void;
  buttonText?: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(248,249,252,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.04)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="max-w-[480px] mx-auto px-5 py-4 flex items-center justify-between">
        {/* 카운트 */}
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 12 }}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                  style={{
                    background: count > 0
                      ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)"
                      : "#C8CDD8",
                    color: "white",
                  }}
                >
                  {count}
                </motion.span>
              </AnimatePresence>
              <span className="text-xs text-[var(--text-secondary)]">{label || "개 선택됨"}</span>
            </>
          )}
        </div>

        {/* 다음 버튼 */}
        <motion.button
          onClick={onNext}
          disabled={!canProceed}
          whileHover={canProceed ? { y: -2 } : {}}
          whileTap={canProceed ? { scale: 0.95 } : {}}
          className="relative px-8 py-3 rounded-full text-sm font-bold text-white overflow-hidden
                     transition-all duration-200 disabled:cursor-not-allowed"
          style={{
            background: canProceed
              ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)"
              : "linear-gradient(135deg, #C8CDD8, #D4D8E0)",
            boxShadow: canProceed ? "0 4px 16px rgba(59,108,246,0.3)" : "none",
          }}
        >
          {/* Shine sweep on hover */}
          {canProceed && (
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                  animation: "shineSweep 2.5s ease-in-out infinite",
                }}
              />
            </span>
          )}
          <span className="relative z-10">{buttonText}</span>
        </motion.button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Step 4: 순차 등장 입력 필드
// ═══════════════════════════════════════════

const springPop = { type: "spring" as const, stiffness: 300, damping: 20 };

const GLASS_INPUT_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1.5px solid rgba(0,0,0,0.06)",
};

function Step4Content({
  formData,
  setFormData,
  handlePhoneChange,
  direction,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handlePhoneChange: (v: string) => void;
  direction: number;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const snsRef = useRef<HTMLInputElement>(null);

  // 순차 등장 상태
  const [showPhone, setShowPhone] = useState(formData.phone.length > 0);
  const [showSns, setShowSns] = useState(formData.sns.length > 0 || formData.phone.replace(/\D/g, "").length >= 10);

  // 강사명 완료 → 전화번호 등장
  const nameComplete = formData.instructorName.length >= 1;
  // 전화번호 완료 → SNS 등장
  const phoneDigits = formData.phone.replace(/\D/g, "").length;
  const phoneComplete = phoneDigits >= 10;

  // 자동 포커스: 화면 진입 시 강사명
  useEffect(() => {
    const t = setTimeout(() => nameRef.current?.focus(), 600);
    return () => clearTimeout(t);
  }, []);

  // 전화번호 등장 + 자동 포커스
  useEffect(() => {
    if (nameComplete && !showPhone) {
      // 이미 값이 있으면 바로 보여줌
    }
  }, [nameComplete, showPhone]);

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && nameComplete) {
      setShowPhone(true);
      setTimeout(() => phoneRef.current?.focus(), 450);
    }
  };

  // 전화번호 완료 시 SNS 등장
  useEffect(() => {
    if (phoneComplete && !showSns) {
      setShowSns(true);
      setTimeout(() => snsRef.current?.focus(), 450);
    }
  }, [phoneComplete, showSns]);

  return (
    <motion.div key="step4" custom={direction}
      variants={slideVariants} initial="enter" animate="center" exit="exit"
      transition={slideTransition} className="pt-4 space-y-4"
    >
      <AiBubble text="거의 다 됐어요!" />
      <AiBubble text="기본 정보만 입력해주시면 됩니다." delay={0.3} />

      <div className="space-y-4 mt-2">
        {/* ── 1. 강사명 (항상 보임) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ...springPop }}
        >
          <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-secondary)] mb-1.5">
            강사명 또는 업체명 <span className="text-red-400">*</span>
            {/* 완료 체크 */}
            <AnimatePresence>
              {nameComplete && showPhone && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 12 }}
                  className="text-green-500 ml-1"
                >✓</motion.span>
              )}
            </AnimatePresence>
          </label>
          <input
            ref={nameRef}
            type="text"
            value={formData.instructorName}
            onChange={(e) => setFormData((p) => ({ ...p, instructorName: e.target.value }))}
            onKeyDown={handleNameKeyDown}
            placeholder="이름 또는 업체명을 입력해주세요"
            className="w-full px-4 py-3.5 rounded-[14px] text-sm outline-none transition-all duration-300"
            style={{
              ...GLASS_INPUT_STYLE,
              borderColor: nameComplete && showPhone ? "rgba(34,197,94,0.3)" : undefined,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = MAIN_COLOR;
              e.target.style.boxShadow = "0 0 0 3px rgba(59,108,246,0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = nameComplete && showPhone ? "rgba(34,197,94,0.3)" : "rgba(0,0,0,0.06)";
              e.target.style.boxShadow = "none";
              // 값이 있으면 다음 필드 표시
              if (nameComplete && !showPhone) {
                setShowPhone(true);
                setTimeout(() => phoneRef.current?.focus(), 450);
              }
            }}
          />
        </motion.div>

        {/* ── 2. 전화번호 (순차 등장) ── */}
        <AnimatePresence>
          {showPhone && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ...springPop }}
            >
              <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-secondary)] mb-1.5">
                전화번호 <span className="text-red-400">*</span>
                <AnimatePresence>
                  {phoneComplete && showSns && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 12 }}
                      className="text-green-500 ml-1"
                    >✓</motion.span>
                  )}
                </AnimatePresence>
              </label>
              <input
                ref={phoneRef}
                type="tel"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full px-4 py-3.5 rounded-[14px] text-sm outline-none transition-all duration-300"
                style={{
                  ...GLASS_INPUT_STYLE,
                  borderColor: phoneComplete && showSns ? "rgba(34,197,94,0.3)" : undefined,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = MAIN_COLOR;
                  e.target.style.boxShadow = "0 0 0 3px rgba(59,108,246,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = phoneComplete ? "rgba(34,197,94,0.3)" : "rgba(0,0,0,0.06)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 3. SNS (순차 등장, 선택) ── */}
        <AnimatePresence>
          {showSns && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ...springPop }}
            >
              <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-1.5">
                SNS 계정 <span className="text-[var(--text-muted)] font-normal">(선택)</span>
              </label>
              <input
                ref={snsRef}
                type="url"
                value={formData.sns}
                onChange={(e) => setFormData((p) => ({ ...p, sns: e.target.value }))}
                placeholder="인스타그램, 블로그 등 URL"
                className="w-full px-4 py-3.5 rounded-[14px] text-sm outline-none transition-all duration-300"
                style={GLASS_INPUT_STYLE}
                onFocus={(e) => {
                  e.target.style.borderColor = MAIN_COLOR;
                  e.target.style.boxShadow = "0 0 0 3px rgba(59,108,246,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,0,0,0.06)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-[11px] text-[var(--text-muted)] mt-1.5 ml-1"
              >
                입력하시거나 건너뛰셔도 됩니다
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 메인 페이지
// ═══════════════════════════════════════════

export default function OnboardingPage() {
  const router = useRouter();

  // 세션 체크 — 로그인 안 됐으면 랜딩으로
  const { data: session, status: authStatus } = useSession();
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/");
    }
    // 이미 강사면 대시보드로
    if (authStatus === "authenticated" && (session?.user as { role?: string })?.role === "instructor") {
      router.replace("/instructor");
    }
  }, [authStatus, session, router]);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1=forward, -1=back
  const [submitting, setSubmitting] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>(() => {
    // localStorage에서 복구 (세션 만료 후 재로그인 시)
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("naisser_onboarding");
        if (saved) return JSON.parse(saved);
      } catch { /* */ }
    }
    return {
      topics: [],
      methods: [],
      regions: [],
      instructorName: "",
      phone: "",
      sns: "",
      lectureContent: "",
      agreedToTerms: false,
      agreedToPrivacy: false,
    };
  });

  // formData 변경 시 localStorage에 백업
  useEffect(() => {
    try {
      localStorage.setItem("naisser_onboarding", JSON.stringify(formData));
    } catch { /* */ }
  }, [formData]);

  // ── 네비게이션 ──
  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step]);

  const goBack = useCallback(() => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  // ── 칩 토글 (공통) ──
  const toggleChip = useCallback(
    (field: "topics" | "methods" | "regions", chipId: string) => {
      setFormData((prev) => {
        // 지역 "전국" 특수 처리
        if (field === "regions") {
          if (chipId === "nationwide") {
            const allIds = REGION_OPTIONS.map((r) => r.id);
            const allSelected = allIds.every((id) => prev.regions.includes(id));
            return { ...prev, regions: allSelected ? [] : allIds };
          }
          // 개별 선택 시 전국 해제
          let updated = prev.regions.includes(chipId)
            ? prev.regions.filter((id) => id !== chipId)
            : [...prev.regions, chipId];
          if (!updated.includes(chipId)) {
            updated = updated.filter((id) => id !== "nationwide");
          }
          return { ...prev, regions: updated };
        }

        const current = prev[field];
        const updated = current.includes(chipId)
          ? current.filter((id) => id !== chipId)
          : [...current, chipId];
        return { ...prev, [field]: updated };
      });
    },
    []
  );

  // ── 전화번호 자동 하이픈 ──
  const handlePhoneChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    setFormData((prev) => ({ ...prev, phone: formatted }));
  }, []);

  // ── 완료 제출 ──
  const handleComplete = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorName: formData.instructorName,
          phone: formData.phone,
          snsAccounts: formData.sns ? [`website:${formData.sns}`] : [],
          topics: formData.topics,
          methods: formData.methods,
          regions: formData.regions,
          lectureContent: formData.lectureContent || undefined,
          agreedToTerms: true,
          agreedToPrivacy: true,
        }),
      });
      if (res.ok) {
        localStorage.removeItem("naisser_onboarding");
        setStep(6); // 완료 화면
      } else if (res.status === 401) {
        // 세션 만료 → 재로그인 유도
        setErrorToast("세션이 만료되었습니다. 다시 로그인해주세요.");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        const err = await res.json();
        setErrorToast(err.error || "등록 중 오류가 발생했습니다.");
        setTimeout(() => setErrorToast(null), 4000);
      }
    } catch {
      setErrorToast("네트워크 오류가 발생했습니다.");
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
  }, [formData]);

  // ── 스크롤 리셋 ──
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [step]);

  // ── 완료 화면 (Step 6) ──
  if (step === 6) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
        style={{ background: "var(--bg-grouped)" }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "linear-gradient(135deg, #10B981, #34D399)" }}
        >
          <motion.svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <motion.path
              d="M10 18L16 24L26 12"
              stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            />
          </motion.svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-bold text-[var(--text-primary)] mb-2"
        >
          등록이 완료되었습니다!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-[var(--text-secondary)] text-center mb-8 leading-relaxed"
        >
          프로필을 완성하면 학교에서<br />더 쉽게 찾을 수 있어요.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={() => router.push("/instructor")}
          className="px-8 py-3 rounded-full text-sm font-bold text-white mb-3"
          style={{ background: `linear-gradient(135deg, ${MAIN_COLOR}, #5B8AFF)` }}
        >
          프로필 완성하기
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => router.push("/")}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          나중에 하기
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "var(--bg-grouped)" }}>
      {/* ─── 헤더 ─── */}
      <header className="sticky top-0 z-50 shrink-0 max-w-[480px] w-full mx-auto px-5 pt-[env(safe-area-inset-top)]"
        style={{ background: "var(--bg-grouped)", opacity: 0.95, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <div className="flex items-center gap-3 py-3">
          {step > 1 ? (
            <button onClick={goBack}
              aria-label="뒤로 가기"
              className="w-8 h-8 flex items-center justify-center rounded-full
                         hover:bg-[var(--bg-muted)] transition-colors touch-target"
            >
              <ArrowLeft className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            </button>
          ) : (
            <div className="w-8" />
          )}
          <div className="flex-1">
            <ProgressBar step={step} total={TOTAL_STEPS} />
          </div>
        </div>
      </header>

      {/* ─── 메인 컨텐츠 ─── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto pb-28 max-w-[480px] w-full mx-auto px-5">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ══════════════════════════════════
              STEP 1: 주제 선택
             ══════════════════════════════════ */}
          {step === 1 && (
            <motion.div key="step1" custom={direction}
              variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={slideTransition} className="pt-4 space-y-4"
            >
              <AiBubble text="반갑습니다. 나이써 등록을 도와드리겠습니다." />
              <AiBubble text="어떤 주제로 강의하시나요? 관련된 주제를 모두 선택해주세요." delay={0.3} />

              <GuideToggle>
                <p>보통 학교에서는 창의적체험활동의 일환으로 특강을 합니다. 주제가 명확한 프로그램이 유리합니다.</p>
                <div className="p-3 rounded-xl mt-1" style={{ background: "rgba(59,108,246,0.06)" }}>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    조향, 퍼스널컬러 → <strong>진로&직업</strong><br />
                    레진, 라탄 → <strong>인성&학폭예방</strong><br />
                    업사이클링 → <strong>환경&생태</strong>
                  </p>
                </div>
              </GuideToggle>

              {/* 칩 그리드 */}
              <div className="flex flex-wrap gap-2.5 mt-2">
                {SUBJECT_CATEGORIES.map((cat, i) => {
                  const cols = 3;
                  const rows = Math.ceil(SUBJECT_CATEGORIES.length / cols);
                  const row = Math.floor(i / cols);
                  const col = i % cols;
                  const dist = Math.hypot(col - (cols - 1) / 2, row - (rows - 1) / 2);
                  const maxDist = Math.hypot((cols - 1) / 2, (rows - 1) / 2) || 1;
                  const delay = 0.5 + (dist / maxDist) * 0.3;

                  return (
                    <BubbleChip
                      key={cat.id}
                      label={cat.label}
                      selected={formData.topics.includes(cat.id)}
                      delay={delay}
                      onClick={() => toggleChip("topics", cat.id)}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════
              STEP 2: 수업 방식
             ══════════════════════════════════ */}
          {step === 2 && (
            <motion.div key="step2" custom={direction}
              variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={slideTransition} className="pt-4 space-y-4"
            >
              <AiBubble text="잘 선택해주셨습니다." />
              <AiBubble text="어떤 방식으로 수업을 진행하시나요?" delay={0.3} />

              <GuideToggle>
                <p>무언가를 만들고 작업물이 나오는 프로그램이면 공예를 선택하세요 (음식, 원예 제외).</p>
                <div className="p-3 rounded-xl mt-1" style={{ background: "rgba(59,108,246,0.06)" }}>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    그림책 읽고 그림 그리기 → <strong>실습체험</strong><br />
                    레진 금연마크 뱃지 → <strong>공예</strong>
                  </p>
                </div>
              </GuideToggle>

              <div className="flex flex-wrap gap-2.5 mt-2">
                {METHOD_CATEGORIES.map((cat, i) => {
                  const cols = 3;
                  const rows = Math.ceil(METHOD_CATEGORIES.length / cols);
                  const row = Math.floor(i / cols);
                  const col = i % cols;
                  const dist = Math.hypot(col - (cols - 1) / 2, row - (rows - 1) / 2);
                  const maxDist = Math.hypot((cols - 1) / 2, (rows - 1) / 2) || 1;
                  const delay = 0.3 + (dist / maxDist) * 0.3;

                  return (
                    <BubbleChip
                      key={cat.id}
                      label={cat.label}
                      selected={formData.methods.includes(cat.id)}
                      delay={delay}
                      onClick={() => toggleChip("methods", cat.id)}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════
              STEP 3: 지역 선택
             ══════════════════════════════════ */}
          {step === 3 && (
            <motion.div key="step3" custom={direction}
              variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={slideTransition} className="pt-4 space-y-4"
            >
              <AiBubble text="좋습니다." />
              <AiBubble text="활동 가능하신 지역을 선택해주세요." delay={0.3} />

              <div className="grid grid-cols-4 gap-2.5 mt-3">
                {REGION_OPTIONS.map((region, i) => {
                  const isSelected = formData.regions.includes(region.id);
                  return (
                    <motion.button
                      key={region.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.4 + i * 0.04,
                        type: "spring",
                        stiffness: 320,
                        damping: 14,
                      }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => toggleChip("regions", region.id)}
                      className="aspect-square flex items-center justify-center text-[13px] font-medium
                                 rounded-xl transition-all duration-200 touch-target"
                      style={
                        isSelected
                          ? {
                              background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                              color: "white",
                              boxShadow: "0 4px 16px rgba(59,108,246,0.25)",
                            }
                          : {
                              background: "rgba(255,255,255,0.65)",
                              backdropFilter: "blur(12px)",
                              WebkitBackdropFilter: "blur(12px)",
                              border: "1.5px solid rgba(0,0,0,0.06)",
                              color: "#374151",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
                            }
                      }
                    >
                      {region.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════
              STEP 4: 기본 정보 (순차 등장)
             ══════════════════════════════════ */}
          {step === 4 && <Step4Content
            formData={formData}
            setFormData={setFormData}
            handlePhoneChange={handlePhoneChange}
            direction={direction}
          />}

          {/* ══════════════════════════════════
              STEP 5: 약관 동의
             ══════════════════════════════════ */}
          {step === 5 && (
            <motion.div key="step5" custom={direction}
              variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={slideTransition} className="pt-4 space-y-4"
            >
              <AiBubble text="마지막 단계입니다!" />
              <AiBubble text="서비스 이용을 위한 약관 동의를 부탁드립니다." delay={0.3} />

              <div className="space-y-3 mt-2">
                {/* 전체 동의 */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => {
                      const allChecked = formData.agreedToTerms && formData.agreedToPrivacy;
                      setFormData((p) => ({
                        ...p,
                        agreedToTerms: !allChecked,
                        agreedToPrivacy: !allChecked,
                      }));
                    }}
                    className="flex items-center gap-2 w-full py-2 text-sm font-bold text-[var(--text-primary)]"
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          formData.agreedToTerms && formData.agreedToPrivacy
                            ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)"
                            : "#E5E7EB",
                      }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    전체 동의
                  </button>
                  <div className="h-px bg-[var(--bg-muted)] my-2" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <GlassCheckbox
                    checked={formData.agreedToTerms}
                    onChange={() => setFormData((p) => ({ ...p, agreedToTerms: !p.agreedToTerms }))}
                    label="이용약관 동의 (필수)"
                    linkText="보기"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <GlassCheckbox
                    checked={formData.agreedToPrivacy}
                    onChange={() => setFormData((p) => ({ ...p, agreedToPrivacy: !p.agreedToPrivacy }))}
                    label="개인정보처리방침 동의 (필수)"
                    linkText="보기"
                  />
                </motion.div>

                {/* 안내 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center gap-2 p-3 rounded-xl text-[11px] text-[var(--text-muted)]"
                  style={{ background: "rgba(59,108,246,0.04)" }}
                >
                  <span>🛡</span>
                  개인정보는 안전하게 보호되며, 매칭 목적으로만 사용됩니다.
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 하단 바 ─── */}
      {step === 1 && (
        <BottomBar
          count={formData.topics.length}
          canProceed={formData.topics.length > 0}
          onNext={goNext}
        />
      )}
      {step === 2 && (
        <BottomBar
          count={formData.methods.length}
          canProceed={formData.methods.length > 0}
          onNext={goNext}
        />
      )}
      {step === 3 && (
        <BottomBar
          count={formData.regions.length}
          canProceed={formData.regions.length > 0}
          onNext={goNext}
        />
      )}
      {step === 4 && (
        <BottomBar
          canProceed={formData.instructorName.length >= 2 && formData.phone.length >= 12}
          onNext={goNext}
          buttonText="다음"
        />
      )}
      {step === 5 && (
        <BottomBar
          canProceed={formData.agreedToTerms && formData.agreedToPrivacy && !submitting}
          onNext={handleComplete}
          buttonText={submitting ? "등록 중..." : "등록 완료"}
        />
      )}

      {/* 에러 토스트 */}
      <AnimatePresence>
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-8 left-4 right-4 z-50 max-w-[480px] mx-auto"
          >
            <div className="px-4 py-3 rounded-xl text-sm text-white font-medium text-center"
              style={{ background: "rgba(239,68,68,0.9)", backdropFilter: "blur(12px)" }}
            >
              {errorToast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 글로벌 키프레임 */}
      <style jsx global>{`
        @keyframes orbSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes shineSweep {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
