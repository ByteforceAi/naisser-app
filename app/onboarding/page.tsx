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
const TOTAL_STEPS = 9;

const STEP_PLACEHOLDERS: Record<number, string> = {
  1: "강사명을 입력하세요",
  2: "수업 내용을 소개해주세요",
  3: "010-0000-0000",
  4: "인스타그램 아이디 또는 URL (선택)",
  8: "건너뛰려면 엔터를 눌러주세요",
};

function getStepMessages(step: number): ChatMessage[] {
  switch (step) {
    case 1:
      return [
        { id: "s1-bot", type: "bot", text: "안녕하세요! 나이써에 오신 것을 환영합니다 😊" },
        { id: "s1-bot2", type: "bot", text: "먼저 강사명 또는 업체명을 알려주세요." },
        { id: "s1-input", type: "input", inputType: "text", placeholder: "강사명 또는 업체명" },
      ];
    case 2:
      return [
        { id: "s2-bot", type: "bot", text: "좋은 이름이네요! 👍" },
        { id: "s2-bot2", type: "bot", text: "어떤 수업을 하시나요?\n자유롭게 소개해주세요." },
        { id: "s2-input", type: "input", inputType: "textarea", placeholder: "강의 내용을 자유롭게 적어주세요..." },
      ];
    case 3:
      return [
        { id: "s3-bot", type: "bot", text: "멋진 수업이네요! 🎓" },
        { id: "s3-bot2", type: "bot", text: "이제 연락처를 알려주세요.\n학교에서 연락할 수 있는 전화번호예요." },
        { id: "s3-input", type: "input", inputType: "phone" },
      ];
    case 4:
      return [
        { id: "s4-bot", type: "bot", text: "감사합니다! 📱" },
        { id: "s4-bot2", type: "bot", text: "SNS 계정이 있으시면 알려주세요.\n없으면 건너뛰셔도 돼요!" },
        { id: "s4-input", type: "input", inputType: "text", placeholder: "인스타그램 아이디 또는 URL (선택)" },
      ];
    case 5:
      return [
        { id: "s5-bot", type: "bot", text: "이제 강의 주제를 선택할 차례예요! 📚" },
        { id: "s5-bot2", type: "bot", text: "여러 개 선택할 수 있어요.\n관련있는 주제를 모두 체크해주세요." },
        { id: "s5-chips", type: "chips", chips: SUBJECT_CATEGORIES.map((c) => ({ id: c.id, label: c.label })), multiSelect: true, guideType: "subject" },
      ];
    case 6:
      return [
        { id: "s6-bot", type: "bot", text: "좋아요! 주제를 잘 선택하셨어요 ✨" },
        { id: "s6-bot2", type: "bot", text: "이번엔 강의 방법을 선택해주세요." },
        { id: "s6-chips", type: "chips", chips: METHOD_CATEGORIES.map((c) => ({ id: c.id, label: c.label })), multiSelect: true, guideType: "method" },
      ];
    case 7:
      return [
        { id: "s7-bot", type: "bot", text: "거의 다 왔어요! 💪" },
        { id: "s7-bot2", type: "bot", text: "활동 가능한 지역을 선택해주세요." },
        { id: "s7-chips", type: "chips", chips: REGION_CATEGORIES.map((c) => ({ id: c.id, label: c.label })), multiSelect: true },
      ];
    case 8:
      return [
        { id: "s8-bot", type: "bot", text: "프로필 사진을 등록하시겠어요? 📸" },
        { id: "s8-bot2", type: "bot", text: "선택사항이에요. 나중에 추가하셔도 됩니다." },
        { id: "s8-input", type: "input", inputType: "text", placeholder: "나중에 등록할게요 (건너뛰기)" },
      ];
    case 9:
      return [
        { id: "s9-bot", type: "bot", text: "마지막 단계예요! 🎉" },
        { id: "s9-bot2", type: "bot", text: "서비스 이용을 위해 약관에 동의해주세요." },
        { id: "s9-consent", type: "consent" },
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

// ═══ 메인 컴포넌트 ═══
export default function OnboardingPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          // ① 오브 → typing (빠른 맥동 + 회전 가속)
          setOrbState("typing");
          setIsTyping(true);
          // 타이핑 인디케이터 대기 (메시지 길이 비례 800~1200ms)
          const typingDelay = 800 + Math.min((msg.text?.length || 0) * 10, 400);
          await new Promise((r) => setTimeout(r, typingDelay));
          setIsTyping(false);

          // ② 오브 → done (sparkle 반짝)
          setOrbState("done");
          await new Promise<void>((resolve) => {
            setMessages((prev) => [...prev, msg]);
            setTimeout(resolve, 200);
          });

          // ③ done 0.5초 후 → waiting (입력 대기 갸웃)
          setTimeout(() => setOrbState("waiting"), 500);
        } else {
          setMessages((prev) => [...prev, msg]);
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
    if (!val && currentStep !== 4 && currentStep !== 8) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${currentStep}`, type: "user", text: val || "(건너뛰기)" },
    ]);

    switch (currentStep) {
      case 1: setFormData((d) => ({ ...d, instructorName: val })); break;
      case 2: setFormData((d) => ({ ...d, lectureContent: val })); break;
      case 4: setFormData((d) => ({ ...d, sns: val })); break;
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
      case 5: setFormData((d) => ({ ...d, topics: [...selectedChips] })); break;
      case 6: setFormData((d) => ({ ...d, methods: [...selectedChips] })); break;
      case 7: setFormData((d) => ({ ...d, regions: [...selectedChips] })); break;
    }

    setTimeout(() => setCurrentStep((s) => s + 1), 400);
  }, [selectedChips, currentStep]);

  // ─── 칩 선택 시 자동 제출 (debounced) ───
  const chipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handleChipToggle = (chipId: string) => {
    setSelectedChips((prev) => {
      const next = prev.includes(chipId)
        ? prev.filter((c) => c !== chipId)
        : [...prev, chipId];

      // 선택이 있으면 1.5초 후 자동 제출
      if (chipTimerRef.current) clearTimeout(chipTimerRef.current);
      if (next.length > 0) {
        chipTimerRef.current = setTimeout(() => {
          handleSubmitChips();
        }, 1500);
      }

      return next;
    });
  };

  // handleSubmitChips가 바뀌면 타이머 정리
  useEffect(() => {
    return () => {
      if (chipTimerRef.current) clearTimeout(chipTimerRef.current);
    };
  }, []);

  const handleSubmitConsent = () => {
    if (!formData.agreedToTerms || !formData.agreedToPrivacy) return;
    setIsComplete(true);
  };

  // ═══ 완료 화면 ═══
  if (isComplete) {
    return <CompletionScreen instructorName={formData.instructorName} />;
  }

  // ═══ 렌더 ═══
  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--bg-primary)]">
      {/* ─── 헤더 ─── */}
      <header className="shrink-0 px-4 pt-3 pb-2 bg-[var(--bg-surface)]/95 backdrop-blur-lg
                          border-b border-[var(--glass-border)] z-10">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)]
                       transition-colors touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <AiOrb state={orbState} size={24} />
            <h1 className="text-base font-semibold">나이써 등록</h1>
          </div>
          <span className="ml-auto text-xs text-[var(--text-muted)]">
            {currentStep}/{TOTAL_STEPS}
          </span>
        </div>
        <ProgressBar current={currentStep} total={TOTAL_STEPS} />
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
                    state="idle"
                    size={32}
                    className="mb-1"
                  />
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-md
                                  bg-[var(--bg-surface)] border border-[var(--glass-border)]
                                  shadow-sm text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
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
                              shadow-sm flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-typing-dot" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-typing-dot" style={{ animationDelay: "200ms" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-typing-dot" style={{ animationDelay: "400ms" }} />
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
              const canSkip = currentStep === 4 || currentStep === 8;
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

            // ── 칩 선택 ──
            if (last.type === "chips") {
              return (
                <div className="px-4 py-3 max-h-[45vh] overflow-y-auto">
                  {last.guideType && <CategoryGuide type={last.guideType} />}
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {last.chips?.map((chip, i) => (
                      <BubbleChip
                        key={chip.id}
                        label={chip.label}
                        selected={selectedChips.includes(chip.id)}
                        delay={i * 0.04}
                        onClick={() => handleChipToggle(chip.id)}
                      />
                    ))}
                  </div>
                  {selectedChips.length > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-[var(--text-muted)]">
                        {selectedChips.length}개 선택됨 · 잠시 후 자동으로 넘어갑니다
                      </span>
                      <button
                        onClick={handleSubmitChips}
                        className="px-4 py-2 text-xs font-semibold text-[var(--accent-primary)]
                                   hover:bg-[var(--accent-primary)]/5 rounded-lg transition-colors"
                      >
                        바로 다음 →
                      </button>
                    </div>
                  )}
                </div>
              );
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
                    disabled={!formData.agreedToTerms || !formData.agreedToPrivacy}
                    className="mt-3 w-full py-3 bg-[var(--accent-primary)] text-white rounded-xl font-semibold
                               shadow-btn-primary transition-all duration-200 disabled:opacity-40 disabled:shadow-none
                               active:scale-[0.98] touch-target"
                  >
                    등록 완료 🎉
                  </button>
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
