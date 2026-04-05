"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, CheckCircle2, Sparkles, X,
  FileCheck, History, BarChart3, MessageCircle,
  Star, Trophy, Zap,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  instruction: string;
  icon: React.ElementType;
  color: string;
  reward: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "profile",
    title: "프로필 만들기",
    description: "이름, 주제, 지역만 입력하면 30초 만에 완성!",
    instruction: "아래 프로필 카드를 탭하세요",
    icon: Star,
    color: "#2563EB",
    reward: "🎉 프로필 생성 완료!",
  },
  {
    id: "documents",
    title: "서류함 등록",
    description: "범죄경력·통장·보험을 한 번 올리면 어디서든 제출",
    instruction: "서류함 카드를 탭하세요",
    icon: FileCheck,
    color: "#7C3AED",
    reward: "📄 서류 관리 마스터!",
  },
  {
    id: "history",
    title: "출강이력 확인",
    description: "수업할수록 자동으로 경력이 쌓여요",
    instruction: "출강이력 카드를 탭하세요",
    icon: History,
    color: "#059669",
    reward: "📊 경력 관리 시작!",
  },
  {
    id: "insights",
    title: "인사이트 확인",
    description: "내 프로필 조회수, 문의, 공유 통계를 분석하세요",
    instruction: "인사이트 카드를 탭하세요",
    icon: BarChart3,
    color: "#DC2626",
    reward: "📈 데이터 분석가!",
  },
  {
    id: "community",
    title: "커뮤니티 참여",
    description: "단가 정보, 노하우, 구인구직 — 강사끼리만의 공간",
    instruction: "커뮤니티 카드를 탭하세요",
    icon: MessageCircle,
    color: "#0891B2",
    reward: "💬 커뮤니티 합류!",
  },
];

interface InteractiveTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function InteractiveTutorial({ onComplete, onSkip }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showReward, setShowReward] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewardText, setRewardText] = useState("");
  const totalSteps = TUTORIAL_STEPS.length;

  const completeStep = useCallback((stepId: string) => {
    if (completedSteps.has(stepId)) return;

    const step = TUTORIAL_STEPS.find((s) => s.id === stepId);
    if (!step) return;

    setCompletedSteps((prev) => new Set(prev).add(stepId));
    setRewardText(step.reward);
    setShowReward(true);
    setShowConfetti(true);

    // 햅틱 피드백
    if (navigator.vibrate) navigator.vibrate(50);

    setTimeout(() => {
      setShowReward(false);
      setShowConfetti(false);
      if (currentStep < totalSteps - 1) {
        setCurrentStep((p) => p + 1);
      } else {
        // 전체 완료
        setTimeout(() => onComplete(), 800);
      }
    }, 1500);
  }, [completedSteps, currentStep, totalSteps, onComplete]);

  const progress = (completedSteps.size / totalSteps) * 100;

  return (
    <>
      {/* ═══ 튜토리얼 HUD (상단 고정) ═══ */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-14 left-0 right-0 z-40 px-4 py-2"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        {/* 프로그레스 바 */}
        <div className="flex items-center gap-3 mb-1.5">
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease }}
            />
          </div>
          <span className="text-[11px] font-black text-blue-600 tabular-nums min-w-[36px]">
            {completedSteps.size}/{totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-[11px] text-[var(--text-muted)] font-medium px-2 py-1 rounded-lg
                       active:bg-gray-100 transition-colors touch-target"
          >
            건너뛰기
          </button>
        </div>

        {/* 현재 미션 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: `${TUTORIAL_STEPS[currentStep].color}15` }}>
              {(() => {
                const Icon = TUTORIAL_STEPS[currentStep].icon;
                return <Icon className="w-3.5 h-3.5" style={{ color: TUTORIAL_STEPS[currentStep].color }} />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[var(--text-primary)]">
                미션 {currentStep + 1}: {TUTORIAL_STEPS[currentStep].title}
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">
                {TUTORIAL_STEPS[currentStep].instruction}
              </p>
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              <ChevronRight className="w-4 h-4 text-blue-400" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ═══ 인터랙티브 미션 카드 그리드 ═══ */}
      <div className="pt-24 px-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {TUTORIAL_STEPS.map((step, i) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = i === currentStep && !isCompleted;
            const Icon = step.icon;

            return (
              <motion.button
                key={step.id}
                whileTap={!isCompleted ? { scale: 0.92 } : {}}
                onClick={() => !isCompleted && completeStep(step.id)}
                disabled={isCompleted}
                className={`relative p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden
                  ${isCompleted ? "opacity-60" : ""}`}
                style={{
                  background: isCurrent
                    ? `linear-gradient(135deg, ${step.color}08, ${step.color}18)`
                    : isCompleted
                    ? "rgba(240,240,240,0.6)"
                    : "rgba(255,255,255,0.7)",
                  border: isCurrent
                    ? `2px solid ${step.color}40`
                    : "1px solid rgba(0,0,0,0.04)",
                  boxShadow: isCurrent
                    ? `0 4px 20px ${step.color}20, 0 0 0 4px ${step.color}08`
                    : "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                {/* 펄스 링 (현재 미션) */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{ boxShadow: [
                      `0 0 0 0px ${step.color}30`,
                      `0 0 0 8px ${step.color}00`,
                    ]}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                    ${isCompleted ? "bg-green-100" : ""}`}
                    style={!isCompleted ? { background: `${step.color}12` } : {}}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Icon className="w-5 h-5" style={{ color: step.color }} />
                    )}
                  </div>
                  {isCurrent && (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: step.color, background: `${step.color}15` }}
                    >
                      TAP!
                    </motion.span>
                  )}
                </div>
                <h4 className={`font-bold text-[13px] mb-1
                  ${isCompleted ? "text-gray-400 line-through" : "text-[var(--text-primary)]"}`}>
                  {step.title}
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
                  {step.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* 전체 완료 시 보너스 */}
        {completedSteps.size === totalSteps && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-5 rounded-2xl text-center"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(124,58,237,0.06))",
              border: "1.5px solid rgba(37,99,235,0.1)",
            }}
          >
            <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h3 className="text-lg font-extrabold text-[var(--text-primary)] mb-1">튜토리얼 완료! 🎉</h3>
            <p className="text-[13px] text-[var(--text-secondary)] mb-4">
              이 모든 기능이 무료로 제공됩니다
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onComplete()}
              className="px-6 py-3 rounded-xl text-white font-bold text-[14px] touch-target"
              style={{
                background: "linear-gradient(135deg, #3B6CF6, #7C3AED)",
                boxShadow: "0 4px 16px rgba(59,108,246,0.3)",
              }}
            >
              <Sparkles className="w-4 h-4 inline mr-1.5" />
              강사로 시작하기
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* ═══ 리워드 토스트 ═══ */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
                       px-5 py-3 rounded-2xl text-[14px] font-bold text-white
                       flex items-center gap-2 whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #3B6CF6, #7C3AED)",
              boxShadow: "0 8px 32px rgba(59,108,246,0.4)",
            }}
          >
            {rewardText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ 컨페티 파티클 ═══ */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: "50vw",
                  y: "50vh",
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `${20 + Math.random() * 60}vw`,
                  y: `${Math.random() * 100}vh`,
                  scale: [0, 1, 0.5],
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ["#3B6CF6", "#7C3AED", "#059669", "#D97706", "#DC2626", "#F472B6"][i % 6],
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
