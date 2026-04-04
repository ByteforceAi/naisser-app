"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { preloadPretext } from "@/lib/utils/textMeasure";

/**
 * SplashScreen — Apple/Pixel 스타일
 *
 * Orb + NAISSER 로고만. 로딩 바 없음.
 * Orb의 breathing이 "살아있다"는 표시.
 * 깔끔하게 fade-out → 메인 콘텐츠.
 */
interface SplashScreenProps {
  isReady: boolean;
  onComplete: () => void;
}

const SPARKLES = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: Math.cos((i / 6) * Math.PI * 2) * 55 + (Math.random() - 0.5) * 15,
  y: Math.sin((i / 6) * Math.PI * 2) * 55 + (Math.random() - 0.5) * 15,
  size: 1.5 + Math.random() * 1.5,
  delay: Math.random() * 2,
  duration: 1.5 + Math.random() * 1,
}));

export function SplashScreen({ isReady, onComplete }: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // 최소 5초 표시 — 브랜드 각인 + 세션 체크 시간 확보
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 5000);
    // 스플래시 동안 Pretext 프리로드 (텍스트 측정 라이브러리)
    preloadPretext().catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimeElapsed && isReady) {
      const fadeTimer = setTimeout(() => {
        setShowSplash(false);
        setTimeout(onComplete, 500);
      }, 200);
      return () => clearTimeout(fadeTimer);
    }
  }, [minTimeElapsed, isReady, onComplete]);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#F8FAFF" }}
        >
          {/* 배경 — 미세한 메시 */}
          <motion.div className="absolute inset-0"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              background: "radial-gradient(ellipse at 30% 40%, rgba(0,136,255,0.08), transparent 55%), radial-gradient(ellipse at 70% 25%, rgba(97,85,245,0.06), transparent 55%)",
              backgroundSize: "200% 200%",
            }}
          />

          {/* ═══ Orb + 스파클 ═══ */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10 mb-7"
          >
            {/* 스파클 */}
            {SPARKLES.map((s) => (
              <motion.div key={s.id} className="absolute rounded-full"
                style={{
                  width: s.size, height: s.size,
                  left: `calc(50% + ${s.x}px)`, top: `calc(50% + ${s.y}px)`,
                  background: "white",
                  boxShadow: "0 0 4px rgba(0,136,255,0.5)",
                }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
              />
            ))}

            {/* Liquid Glass 프레임 — breathing */}
            <motion.div
              animate={{ scale: [1, 1.015, 1], y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 h-28 rounded-[28px] relative" style={{
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(16px) saturate(1.5)",
                WebkitBackdropFilter: "blur(16px) saturate(1.5)",
                boxShadow: "0 12px 48px rgba(0,136,255,0.1), 0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.7)",
                border: "0.5px solid rgba(255,255,255,0.6)",
              }}>
              {/* 내부 Orb — 원형 */}
              <div className="absolute inset-4 rounded-full overflow-hidden">
                <motion.div className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ background: "conic-gradient(from 0deg, #0088ff, #6155f5, #cb30e0, #34c759, #0088ff)" }}
                />
                <div className="absolute inset-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)" }} />
                <motion.div className="absolute inset-[6px] rounded-full"
                  animate={{
                    background: [
                      "radial-gradient(circle at 30% 30%, rgba(0,136,255,0.5), rgba(97,85,245,0.3), transparent 70%)",
                      "radial-gradient(circle at 70% 40%, rgba(97,85,245,0.5), rgba(203,48,224,0.3), transparent 70%)",
                      "radial-gradient(circle at 30% 30%, rgba(0,136,255,0.5), rgba(97,85,245,0.3), transparent 70%)",
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ opacity: 0.5 }}
                />
              </div>
              {/* 상단 하이라이트 */}
              <div className="absolute inset-x-4 top-2.5 h-10 rounded-t-[20px] opacity-25 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.9), transparent)" }} />
            </motion.div>

            {/* 외곽 글로우 — breathing */}
            <motion.div className="absolute inset-0 rounded-[28px] -z-10"
              animate={{
                boxShadow: [
                  "0 0 50px rgba(0,136,255,0.12), 0 0 25px rgba(97,85,245,0.08)",
                  "0 0 70px rgba(0,136,255,0.2), 0 0 35px rgba(97,85,245,0.12)",
                  "0 0 50px rgba(0,136,255,0.12), 0 0 25px rgba(97,85,245,0.08)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* ═══ NAISSER 로고 — 글자별 스태거 ═══ */}
          <motion.div className="relative z-10 text-center">
            <div className="flex justify-center gap-[2px]">
              {"NAISSER".split("").map((char, i) => (
                <motion.span key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[20px] font-bold tracking-[0.15em]"
                  style={{ color: "#0088ff" }}>
                  {char}
                </motion.span>
              ))}
            </div>

            {/* 서브 텍스트 — 3초 후 fade in */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="text-[12px] mt-3 tracking-wide"
              style={{ color: "#b0b8c8" }}
            >
              학교와 강사를 연결합니다
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
