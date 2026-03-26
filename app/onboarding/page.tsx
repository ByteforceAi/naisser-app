"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { AiOrb } from "@/components/onboarding/AiOrb";
import { BubbleChip } from "@/components/onboarding/BubbleChip";
import { PhoneInput } from "@/components/onboarding/PhoneInput";
import { CategoryGuide } from "@/components/onboarding/CategoryGuide";
import { ConsentStep } from "@/components/onboarding/ConsentStep";
import { CompletionScreen } from "@/components/onboarding/CompletionScreen";
import {
  SUBJECT_CATEGORIES,
  METHOD_CATEGORIES,
  REGION_CATEGORIES,
} from "@/lib/constants/categories";

// ═══ 타입 ═══
type MessageType = "bot" | "user" | "input" | "chips" | "consent";

interface ChatMessage {
  id: string;
  type: MessageType;
  text?: string;
  inputType?: "text" | "phone" | "textarea";
  chips?: { id: string; label: string }[];
  multiSelect?: boolean;
  guideType?: "subject" | "method";
  placeholder?: string;
}

// ═══ 단계별 메시지 + placeholder ═══
const TOTAL_STEPS = 8;

const STEP_PLACEHOLDERS: Record<number, string> = {
  4: "강사명 또는 업체명",
  5: "010-0000-0000",
  6: "인스타그램 아이디 또는 URL (선택)",
  7: "수업 내용을 자유롭게 적어주세요",
};

function getStepMessages(step: number): ChatMessage[] {
  switch (step) {
    // ═══ Phase 1: 선택형 (버블칩) — 재밌고 빠름 ═══
    case 1:
      return [
        { id: "s1-bot", type: "bot", text: "반갑습니다.\n나이써 등록을 도와드리겠습니다." },
        { id: "s1-bot2", type: "bot", text: "어떤 주제로 강의하시나요?\n관련된 주제를 모두 선택해주세요." },
        { id: "s1-chips", type: "chips", chips: SUBJECT_CATEGORIES.map((c) => ({ id: c.id, label: c.label })), multiSelect: true, guideType: "subject" },
      ];
    case 2:
      return [
        { id: "s2-bot", type: "bot", text: "잘 선택해주셨습니다." },
        { id: "s2-bot2", type: "bot", text: "어떤 방식으로 수업을 진행하시나요?" },
        { id: "s2-chips", type: "chips", chips: METHOD_CATEGORIES.map((c) => ({ id: c.id, label: c.label })), multiSelect: true, guideType: "method" },
      ];
    case 3:
      return [
        { id: "s3-bot", type: "bot", text: "좋습니다." },
        { id: "s3-bot2", type: "bot", text: "활동 가능하신 지역을 선택해주세요." },
        { id: "s3-chips", type: "chips", chips: REGION_CATEGORIES.map((c) => ({ id: c.id, label: c.label })), multiSelect: true },
      ];
    // ═══ Phase 2: 입력형 (타이핑) ═══
    case 4:
      return [
        { id: "s4-bot", type: "bot", text: "잘 선택해주셨습니다.\n이제 몇 가지 정보만 더 입력해주세요." },
        { id: "s4-bot2", type: "bot", text: "강사명 또는 업체명을 알려주시겠어요?" },
        { id: "s4-input", type: "input", inputType: "text", placeholder: "강사명 또는 업체명" },
      ];
    case 5:
      return [
        { id: "s5-bot", type: "bot", text: "감사합니다." },
        { id: "s5-bot2", type: "bot", text: "학교에서 연락드릴 수 있도록\n전화번호를 알려주시겠어요?" },
        { id: "s5-input", type: "input", inputType: "phone" },
      ];
    case 6:
      return [
        { id: "s6-bot", type: "bot", text: "감사합니다." },
        { id: "s6-bot2", type: "bot", text: "SNS 계정이 있으시다면 알려주세요.\n없으시면 건너뛰셔도 괜찮습니다." },
        { id: "s6-input", type: "input", inputType: "text", placeholder: "인스타그램 아이디 또는 URL (선택)" },
      ];
    case 7:
      return [
        { id: "s7-bot", type: "bot", text: "거의 마무리 단계입니다." },
        { id: "s7-bot2", type: "bot", text: "진행하시는 수업에 대해\n자유롭게 소개해주시면 감사하겠습니다." },
        { id: "s7-input", type: "input", inputType: "textarea", placeholder: "강의 내용을 자유롭게 적어주세요" },
      ];
    // ═══ Phase 3: 마무리 ═══
    case 8:
      return [
        { id: "s8-bot", type: "bot", text: "마지막 단계입니다." },
        { id: "s8-bot2", type: "bot", text: "서비스 이용을 위한\n약관 동의를 부탁드립니다." },
        { id: "s8-consent", type: "consent" },
      ];
    default:
      return [];
  }
}

// ═══ 메시지 애니메이션 ═══
const botBubbleVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
} as const;
const userBubbleVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 15 },
  },
} as const;

// ═══ 인트로 화면 — Edge Glow + 랜딩 동일 오브 ═══
function IntroScreen({ onReady }: { onReady: () => void }) {
  const [phase, setPhase] = useState<"glow" | "text" | "fade">("glow");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 1000);
    const t2 = setTimeout(() => setPhase("fade"), 3000);
    const t3 = setTimeout(onReady, 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onReady]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
      animate={phase === "fade" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ═══ Apple Intelligence Edge Glow ═══ */}
      <div className="edge-glow-container">
        {/* Top edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px]">
          <div className="w-full h-full edge-line-h" />
          <div className="absolute top-0 left-0 right-0 h-[60px] edge-blur-h" style={{ filter: "blur(25px)" }} />
          <div className="absolute top-0 left-0 right-0 h-[100px] edge-blur-h-soft" style={{ filter: "blur(50px)" }} />
        </div>
        {/* Bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]">
          <div className="w-full h-full edge-line-h-rev" />
          <div className="absolute bottom-0 left-0 right-0 h-[60px] edge-blur-h-rev" style={{ filter: "blur(25px)" }} />
        </div>
        {/* Left edge */}
        <div className="absolute top-0 left-0 bottom-0 w-[2px]">
          <div className="w-full h-full edge-line-v" />
          <div className="absolute left-0 top-0 bottom-0 w-[60px] edge-blur-v" style={{ filter: "blur(25px)" }} />
        </div>
        {/* Right edge */}
        <div className="absolute top-0 right-0 bottom-0 w-[2px]">
          <div className="w-full h-full edge-line-v-rev" />
          <div className="absolute right-0 top-0 bottom-0 w-[60px] edge-blur-v-rev" style={{ filter: "blur(25px)" }} />
        </div>
        {/* Corner glows */}
        <div className="edge-corner top-[-60px] left-[-60px] bg-red-400/20" style={{ animationDelay: "0s" }} />
        <div className="edge-corner top-[-60px] right-[-60px] bg-blue-400/20" style={{ animationDelay: "1s" }} />
        <div className="edge-corner bottom-[-60px] left-[-60px] bg-purple-400/20" style={{ animationDelay: "2s" }} />
        <div className="edge-corner bottom-[-60px] right-[-60px] bg-green-400/20" style={{ animationDelay: "3s" }} />
      </div>

      {/* ═══ 랜딩과 100% 동일한 오브 (큰 사이즈) ═══ */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="w-20 h-20 rounded-full relative" style={{ boxShadow: "0 0 60px rgba(37,99,235,0.3)" }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #2563eb, #7c3aed, #2563eb)",
              animation: "introOrbSpin 4s linear infinite, introOrbFloat 2s ease-in-out infinite",
            }}
          />
          <div className="absolute inset-[3px] rounded-full bg-white/90 backdrop-blur-sm" />
          <div
            className="absolute inset-[6px] rounded-full opacity-60"
            style={{
              background: "radial-gradient(circle at 35% 35%, rgba(37,99,235,0.4), rgba(124,58,237,0.2), transparent 70%)",
            }}
          />
        </div>
      </motion.div>

      {/* 텍스트 */}
      <AnimatePresence>
        {(phase === "text" || phase === "fade") && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-[15px] text-[var(--text-secondary)] font-medium tracking-tight">
              등록을 도와드릴 준비를 하고 있습니다
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes introOrbSpin { to { transform: rotate(360deg); } }
        @keyframes introOrbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.04); }
        }
        /* Edge Glow */
        .edge-glow-container {
          position: fixed; inset: 0; pointer-events: none; z-index: 100;
          animation: edgeFadeIn 0.8s ease forwards;
        }
        @keyframes edgeFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .edge-line-h {
          background: linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ec4899, #ef4444);
          background-size: 200% 100%;
          animation: flowR 3.5s linear infinite;
        }
        .edge-line-h-rev {
          background: linear-gradient(90deg, #a855f7, #ec4899, #ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7);
          background-size: 200% 100%;
          animation: flowL 3.5s linear infinite;
        }
        .edge-line-v {
          background: linear-gradient(180deg, #ef4444, #a855f7, #3b82f6, #22c55e, #f59e0b, #ef4444);
          background-size: 100% 200%;
          animation: flowD 3.5s linear infinite;
        }
        .edge-line-v-rev {
          background: linear-gradient(180deg, #3b82f6, #22c55e, #f59e0b, #ef4444, #a855f7, #3b82f6);
          background-size: 100% 200%;
          animation: flowU 3.5s linear infinite;
        }
        .edge-blur-h {
          background: linear-gradient(90deg, rgba(239,68,68,0.2), rgba(245,158,11,0.15), rgba(34,197,94,0.2), rgba(59,130,246,0.15), rgba(168,85,247,0.2), rgba(239,68,68,0.15));
          background-size: 200% 100%;
          animation: flowR 3.5s linear infinite;
        }
        .edge-blur-h-soft {
          background: linear-gradient(90deg, rgba(239,68,68,0.08), rgba(34,197,94,0.06), rgba(168,85,247,0.08), rgba(239,68,68,0.06));
          background-size: 200% 100%;
          animation: flowR 3.5s linear infinite;
        }
        .edge-blur-h-rev {
          background: linear-gradient(90deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15), rgba(239,68,68,0.2), rgba(59,130,246,0.15), rgba(168,85,247,0.15));
          background-size: 200% 100%;
          animation: flowL 3.5s linear infinite;
        }
        .edge-blur-v {
          background: linear-gradient(180deg, rgba(239,68,68,0.2), rgba(168,85,247,0.15), rgba(59,130,246,0.2), rgba(34,197,94,0.15), rgba(239,68,68,0.15));
          background-size: 100% 200%;
          animation: flowD 3.5s linear infinite;
        }
        .edge-blur-v-rev {
          background: linear-gradient(180deg, rgba(59,130,246,0.2), rgba(34,197,94,0.15), rgba(245,158,11,0.2), rgba(168,85,247,0.15), rgba(59,130,246,0.15));
          background-size: 100% 200%;
          animation: flowU 3.5s linear infinite;
        }
        .edge-corner {
          position: absolute; width: 180px; height: 180px;
          border-radius: 50%; filter: blur(60px);
          animation: cPulse 4s ease-in-out infinite;
        }
        @keyframes flowR { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }
        @keyframes flowL { 0% { background-position: 200% 0; } 100% { background-position: 0% 0; } }
        @keyframes flowD { 0% { background-position: 0 0%; } 100% { background-position: 0 200%; } }
        @keyframes flowU { 0% { background-position: 0 200%; } 100% { background-position: 0 0%; } }
        @keyframes cPulse {
          0%, 100% { opacity: 0.15; transform: scale(0.85); }
          50% { opacity: 0.45; transform: scale(1.1); }
        }
      `}</style>
    </motion.div>
  );
}

// ═══ 타이프라이터 버블 ═══
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const completedRef = useRef(false);

  useEffect(() => {
    let i = 0;
    completedRef.current = false;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }
    }, 25); // 25ms per char
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <span className="whitespace-pre-wrap">
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-[1.5px] h-[1em] bg-[var(--accent-primary)] ml-0.5 opacity-70 animate-pulse align-middle" />
      )}
    </span>
  );
}

// ═══ 메인 컴포넌트 ═══
export default function OnboardingPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showIntro, setShowIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [orbState, setOrbState] = useState<"idle" | "typing" | "waiting" | "listening" | "done">("idle");

  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // 인풋 변경 시 오브 상태 → listening
  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (val.trim().length > 0) {
      setOrbState("listening");
    } else {
      setOrbState("waiting");
    }
  };
  const [phoneValue, setPhoneValue] = useState("010--");
  const [phoneError, setPhoneError] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const [formData, setFormData] = useState({
    instructorName: "",
    lectureContent: "",
    phone: "",
    sns: "",
    topics: [] as string[],
    methods: [] as string[],
    regions: [] as string[],
    agreedToTerms: false,
    agreedToPrivacy: false,
  });

  // ─── 순차적 메시지 표출 (오브 상태 연동) ───
  const showMessagesSequentially = useCallback(
    async (msgs: ChatMessage[]) => {
      for (const msg of msgs) {
        if (msg.type === "bot") {
          // ① 오브 → typing + 타이핑 인디케이터 표시
          setOrbState("typing");
          setIsTyping(true);
          await new Promise((r) => setTimeout(r, 900));
          setIsTyping(false);

          // ② 메시지 추가 (타이프라이터가 시작됨)
          setOrbState("idle");
          setMessages((prev) => [...prev, msg]);

          // ③ 타이프라이터가 끝날 때까지 대기 (글자 수 × 25ms + 여유 300ms)
          const typewriterTime = (msg.text?.length || 0) * 25 + 300;
          await new Promise((r) => setTimeout(r, typewriterTime));

          // ④ 다음 메시지 전 잠깐 대기 (자연스러운 간격)
          await new Promise((r) => setTimeout(r, 400));
        } else {
          // input/chips/consent는 바로 추가
          setMessages((prev) => [...prev, msg]);
          setOrbState("waiting");
        }
      }
    },
    []
  );

  // ─── StrictMode guard ───
  const stepInitRef = useRef<number>(0);

  useEffect(() => {
    if (stepInitRef.current === currentStep) return;
    stepInitRef.current = currentStep;

    setSelectedChips([]);
    setInputValue("");
    setPhoneValue("010--");
    setPhoneError("");
    showMessagesSequentially(getStepMessages(currentStep));
  }, [currentStep, showMessagesSequentially]);

  // ─── 자동 스크롤 ───
  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, isTyping]);

  // ─── 봇 메시지 완료 후 자동 포커스 ───
  useEffect(() => {
    if (isTyping) return;
    const last = messages[messages.length - 1];
    if (!last) return;

    if (last.type === "input") {
      setTimeout(() => {
        if (last.inputType === "textarea") {
          textareaRef.current?.focus();
        } else if (last.inputType === "text") {
          inputRef.current?.focus();
        }
      }, 200);
    }
  }, [messages, isTyping]);

  // ─── 사용자 응답 처리 ───
  const handleSubmitText = () => {
    const val = inputValue.trim();
    if (!val && currentStep !== 6 && currentStep !== 7) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${currentStep}`, type: "user", text: val || "(건너뛰기)" },
    ]);

    switch (currentStep) {
      case 4: setFormData((d) => ({ ...d, instructorName: val })); break;
      case 6: setFormData((d) => ({ ...d, sns: val })); break;
      case 7: setFormData((d) => ({ ...d, lectureContent: val })); break;
    }

    setInputValue("");
    setTimeout(() => setCurrentStep((s) => s + 1), 400);
  };

  const handleSubmitPhone = () => {
    if (!/^01[016789]-\d{3,4}-\d{4}$/.test(phoneValue)) {
      setPhoneError("올바른 전화번호 형식이 아닙니다.");
      return;
    }
    setPhoneError("");
    setMessages((prev) => [
      ...prev,
      { id: `user-${currentStep}`, type: "user", text: phoneValue },
    ]);
    setFormData((d) => ({ ...d, phone: phoneValue }));
    setTimeout(() => setCurrentStep((s) => s + 1), 400);
  };

  const handleSubmitChips = useCallback(() => {
    if (selectedChips.length === 0) return;

    const labels = selectedChips
      .map((id) => {
        const all = [...SUBJECT_CATEGORIES, ...METHOD_CATEGORIES, ...REGION_CATEGORIES];
        return all.find((c) => c.id === id)?.label ?? id;
      })
      .join(", ");

    setMessages((prev) => [
      ...prev,
      { id: `user-${currentStep}`, type: "user", text: labels },
    ]);

    switch (currentStep) {
      case 1: setFormData((d) => ({ ...d, topics: [...selectedChips] })); break;
      case 2: setFormData((d) => ({ ...d, methods: [...selectedChips] })); break;
      case 3: setFormData((d) => ({ ...d, regions: [...selectedChips] })); break;
    }

    setTimeout(() => setCurrentStep((s) => s + 1), 400);
  }, [selectedChips, currentStep]);

  // ─── 칩 토글 (자동 제출 없음 — 사용자가 "다음" 누름) ───
  const handleChipToggle = (chipId: string) => {
    setSelectedChips((prev) =>
      prev.includes(chipId)
        ? prev.filter((c) => c !== chipId)
        : [...prev, chipId]
    );
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmitConsent = async () => {
    if (!formData.agreedToTerms || !formData.agreedToPrivacy) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorName: formData.instructorName,
          phone: formData.phone,
          snsAccounts: formData.sns ? [`other:${formData.sns}`] : [],
          topics: formData.topics,
          methods: formData.methods,
          regions: formData.regions,
          lectureContent: formData.lectureContent || undefined,
          agreedToTerms: true,
          agreedToPrivacy: true,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error || "등록 중 오류가 발생했습니다.");
        setIsSubmitting(false);
        return;
      }

      setIsComplete(true);
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setIsSubmitting(false);
    }
  };

  // ═══ 완료 화면 ═══
  if (isComplete) {
    return <CompletionScreen instructorName={formData.instructorName} />;
  }

  // ═══ 인트로 화면 ═══
  if (showIntro) {
    return <IntroScreen onReady={() => setShowIntro(false)} />;
  }

  // ═══ 렌더 ═══
  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--bg-primary)]">
      {/* ─── 미니멀 상단바 (프로그레스만) ─── */}
      <header className="shrink-0 px-4 pt-[env(safe-area-inset-top)] bg-[var(--bg-primary)]">
        <div className="flex items-center gap-3 py-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       hover:bg-[var(--bg-elevated)] transition-colors touch-target"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <div className="flex-1">
            <ProgressBar current={currentStep} total={TOTAL_STEPS} />
          </div>
        </div>
      </header>

      {/* ─── 채팅 영역 ─── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            if (msg.type === "bot") {
              return (
                <motion.div
                  key={msg.id}
                  variants={botBubbleVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-end gap-2 max-w-[85%]"
                >
                  <AiOrb
                    state={orbState}
                    size={28}
                    className="mb-1"
                  />
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-md
                                  bg-[var(--bg-surface)] border border-[var(--glass-border)]
                                  shadow-sm text-sm leading-relaxed">
                    <TypewriterText text={msg.text || ""} />
                  </div>
                </motion.div>
              );
            }

            if (msg.type === "user") {
              return (
                <motion.div
                  key={msg.id}
                  variants={userBubbleVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex justify-end"
                >
                  <div className="px-4 py-2.5 rounded-2xl rounded-br-[4px] max-w-[80%]
                                  bg-[var(--accent-primary)] text-white
                                  shadow-btn-primary text-sm leading-relaxed">
                    {msg.text}
                  </div>
                </motion.div>
              );
            }

            // ── 칩 선택 (채팅 본문에 표시) ──
            if (msg.type === "chips") {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" as const }}
                  className="py-2"
                >
                  {msg.guideType && <CategoryGuide type={msg.guideType} />}
                  <div className="flex flex-wrap gap-2.5 mt-3">
                    {msg.chips?.map((chip, i) => (
                      <BubbleChip
                        key={chip.id}
                        label={chip.label}
                        selected={selectedChips.includes(chip.id)}
                        delay={i * 0.03}
                        onClick={() => handleChipToggle(chip.id)}
                      />
                    ))}
                  </div>
                  {/* 선택 카운트 + 다음 버튼 */}
                  {selectedChips.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--glass-border)]"
                    >
                      <span className="text-xs text-[var(--text-muted)]">
                        {selectedChips.length}개 선택됨
                      </span>
                      <motion.button
                        onClick={handleSubmitChips}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2.5 text-sm font-bold text-white
                                   bg-[var(--accent-primary)] rounded-full shadow-btn-primary
                                   hover:shadow-btn-primary-hover transition-all"
                      >
                        다음
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              );
            }

            return null;
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-end gap-2"
            >
              <AiOrb state="typing" size={32} className="mb-1" />
              <div className="px-4 py-3 rounded-2xl rounded-bl-md
                              bg-[var(--bg-surface)] border border-[var(--glass-border)]
                              shadow-sm flex gap-1.5 items-center">
                {/* 신경망 펄스 — 점이 물결처럼 */}
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-[6px] h-[6px] rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                      animation: `neuralPulse 1.4s ease-in-out ${delay}ms infinite`,
                    }}
                  />
                ))}
                <style jsx>{`
                  @keyframes neuralPulse {
                    0%, 80%, 100% {
                      opacity: 0.25;
                      transform: scale(0.8) translateY(0);
                    }
                    40% {
                      opacity: 1;
                      transform: scale(1.1) translateY(-3px);
                    }
                  }
                `}</style>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 입력 영역 (하단 고정) — slideUp 등장 ─── */}
      <AnimatePresence>
      {!isTyping && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="shrink-0 border-t border-[var(--glass-border)] bg-[var(--bg-surface)]/95
                        backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
          {(() => {
            const last = messages[messages.length - 1];
            if (!last) return null;

            // ── 전화번호 입력 ──
            if (last.type === "input" && last.inputType === "phone") {
              return (
                <div className="px-4 py-3">
                  <PhoneInput value={phoneValue} onChange={setPhoneValue} error={phoneError} />
                  <button
                    onClick={handleSubmitPhone}
                    className="mt-3 w-full py-3 bg-[var(--accent-primary)] text-white rounded-xl font-semibold
                               shadow-btn-primary transition-all duration-200 active:scale-[0.98] touch-target"
                  >
                    다음
                  </button>
                </div>
              );
            }

            // ── 텍스트에어리어 ──
            if (last.type === "input" && last.inputType === "textarea") {
              return (
                <div className="px-4 py-3">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={STEP_PLACEHOLDERS[currentStep] || last.placeholder}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-primary)]
                               text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30
                               focus:border-[var(--accent-primary)] transition-all"
                  />
                  <button
                    onClick={handleSubmitText}
                    disabled={!inputValue.trim()}
                    className="mt-2 w-full py-3 bg-[var(--accent-primary)] text-white rounded-xl font-semibold
                               shadow-btn-primary transition-all duration-200 disabled:opacity-40 disabled:shadow-none
                               active:scale-[0.98] touch-target"
                  >
                    다음
                  </button>
                </div>
              );
            }

            // ── 텍스트 입력 ──
            if (last.type === "input" && last.inputType === "text") {
              const canSkip = currentStep === 6 || currentStep === 7;
              const hasValue = inputValue.trim().length > 0;

              return (
                <div className="px-4 py-3">
                  <div className="flex gap-2 items-end">
                    <input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          handleSubmitText();
                        }
                      }}
                      placeholder={STEP_PLACEHOLDERS[currentStep] || last.placeholder}
                      className="flex-1 px-4 py-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-primary)]
                                 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30
                                 focus:border-[var(--accent-primary)] transition-all"
                    />
                    <motion.button
                      onClick={handleSubmitText}
                      disabled={!hasValue && !canSkip}
                      animate={{
                        scale: hasValue || canSkip ? 1 : 0.9,
                        opacity: hasValue || canSkip ? 1 : 0.3,
                      }}
                      whileTap={hasValue || canSkip ? { scale: 0.85 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className={`w-11 h-11 flex items-center justify-center rounded-full
                                  touch-target shrink-0 transition-colors duration-200
                                  ${hasValue || canSkip
                                    ? "bg-[var(--accent-primary)] text-white shadow-btn-primary"
                                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                                  }`}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                  {canSkip && !hasValue && (
                    <button
                      onClick={() => { setInputValue(""); handleSubmitText(); }}
                      className="mt-2 w-full py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                                 transition-colors"
                    >
                      건너뛰기
                    </button>
                  )}
                </div>
              );
            }

            // ── 칩 선택은 채팅 본문에서 렌더링됨 ──
            if (last.type === "chips") {
              return null; // 하단 바에서는 표시 안 함
            }

            // ── 약관 동의 ──
            if (last.type === "consent") {
              return (
                <div className="px-4 py-3">
                  <ConsentStep
                    agreedToTerms={formData.agreedToTerms}
                    agreedToPrivacy={formData.agreedToPrivacy}
                    onToggleTerms={() => setFormData((d) => ({ ...d, agreedToTerms: !d.agreedToTerms }))}
                    onTogglePrivacy={() => setFormData((d) => ({ ...d, agreedToPrivacy: !d.agreedToPrivacy }))}
                  />
                  <button
                    onClick={handleSubmitConsent}
                    disabled={!formData.agreedToTerms || !formData.agreedToPrivacy || isSubmitting}
                    className="mt-3 w-full py-3 bg-[var(--accent-primary)] text-white rounded-xl font-semibold
                               shadow-btn-primary transition-all duration-200 disabled:opacity-40 disabled:shadow-none
                               active:scale-[0.98] touch-target"
                  >
                    {isSubmitting ? "등록 중..." : "등록 완료"}
                  </button>
                  {submitError && (
                    <p className="mt-2 text-xs text-red-500 text-center">{submitError}</p>
                  )}
                </div>
              );
            }

            return null;
          })()}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
