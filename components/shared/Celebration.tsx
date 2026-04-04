"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Celebration — 마일스톤 달성 시 축하 오버레이
 *
 * 사용: <Celebration show={true} title="첫 글 작성!" desc="강사 라운지에 오신 걸 환영합니다" />
 *
 * 컨페티 파티클 + 제목 + 설명 + 자동 닫힘(3초)
 */
interface CelebrationProps {
  show: boolean;
  title: string;
  desc?: string;
  onDone?: () => void;
}

const CONFETTI_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#EC4899"];

export function Celebration({ show, title, desc, onDone }: CelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => { setVisible(false); onDone?.(); }, 3000);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  const confetti = Array.from({ length: 24 }, (_, i) => ({
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 400 + 100),
    r: Math.random() * 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 0.3,
    size: 4 + Math.random() * 6,
  }));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          {/* 컨페티 파티클 */}
          {confetti.map((c, i) => (
            <motion.div
              key={i}
              className="absolute rounded-sm"
              style={{
                width: c.size,
                height: c.size * 0.6,
                background: c.color,
                top: "50%",
                left: "50%",
              }}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{
                x: c.x,
                y: c.y,
                rotate: c.r,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: c.delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* 메시지 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center px-8 py-6 rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-4xl mb-3"
            >
              🎉
            </motion.div>
            <h2 className="text-[18px] font-bold text-[var(--text-primary)] mb-1">{title}</h2>
            {desc && (
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{desc}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══ 마일스톤 체크 유틸 ═══

const MILESTONE_KEY = "naisser_milestones";

export function checkMilestone(type: string): boolean {
  try {
    const achieved = JSON.parse(localStorage.getItem(MILESTONE_KEY) || "{}");
    if (achieved[type]) return false;
    achieved[type] = Date.now();
    localStorage.setItem(MILESTONE_KEY, JSON.stringify(achieved));
    return true;
  } catch { return false; }
}

export const MILESTONES = {
  FIRST_POST: { type: "first_post", title: "첫 글 작성 완료!", desc: "강사 라운지에 오신 걸 환영합니다" },
  FIRST_LIKE: { type: "first_like", title: "첫 좋아요!", desc: "다른 강사님의 글에 공감을 표현했어요" },
  FIRST_COMMENT: { type: "first_comment", title: "첫 답글!", desc: "대화에 참여해주셔서 감사합니다" },
  LIKES_10: { type: "likes_10", title: "좋아요 10개 달성!", desc: "많은 분들이 공감하고 있어요" },
  LIKES_100: { type: "likes_100", title: "좋아요 100개!", desc: "인기 강사 반열에 올랐습니다" },
  HELPFUL_10: { type: "helpful_10", title: "도움 10회!", desc: "동료 강사들에게 큰 도움이 되고 있어요" },
  STREAK_7: { type: "streak_7", title: "7일 연속 활동!", desc: "꾸준함이 실력입니다" },
} as const;
