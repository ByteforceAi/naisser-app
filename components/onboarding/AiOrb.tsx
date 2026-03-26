"use client";

import { cn } from "@/lib/utils/cn";

export type OrbState = "idle" | "typing" | "waiting" | "listening" | "done";

interface AiOrbProps {
  state?: OrbState;
  size?: number;
  className?: string;
}

/**
 * AI 오브 — 랜딩페이지와 동일한 구체 + 상태별 변화
 *
 * 구조: 그라데이션 링 + 흰색 내부 + 내부 빛 반사 + 외부 글로우
 *
 * 상태:
 * - idle:      은은하게 떠다니며 (3s) 천천히 회전 (8s)
 * - typing:    맥동 빨라짐 (1.2s) + 회전 가속 (3s) + 글로우 밝아짐
 * - waiting:   느리게 숨쉬기 (4s) + 살짝 갸웃
 * - listening: 살짝 커짐 + 글로우 밝기 증가
 * - done:      부드럽게 밝아졌다 돌아옴
 */
export function AiOrb({ state = "idle", size = 34, className }: AiOrbProps) {
  // 상태별 글로우 강도
  const glowMap: Record<OrbState, string> = {
    idle: `0 0 ${size * 0.5}px rgba(37,99,235,0.15)`,
    typing: `0 0 ${size * 0.7}px rgba(124,58,237,0.3)`,
    waiting: `0 0 ${size * 0.4}px rgba(37,99,235,0.12)`,
    listening: `0 0 ${size * 0.6}px rgba(37,99,235,0.25)`,
    done: `0 0 ${size * 0.8}px rgba(59,130,246,0.35)`,
  };

  // 상태별 애니메이션 클래스
  const animClass: Record<OrbState, string> = {
    idle: "orb-anim-idle",
    typing: "orb-anim-typing",
    waiting: "orb-anim-waiting",
    listening: "orb-anim-listening",
    done: "orb-anim-done",
  };

  const pad = Math.max(2, size * 0.08); // 그라데이션 링 두께

  return (
    <div
      className={cn("relative shrink-0 transition-shadow duration-500", className)}
      style={{
        width: size,
        height: size,
        boxShadow: glowMap[state],
        borderRadius: "50%",
      }}
    >
      {/* ① 그라데이션 링 (회전) */}
      <div
        className={cn("absolute inset-0 rounded-full", animClass[state])}
        style={{
          background: "conic-gradient(from 0deg, #2563eb, #7c3aed, #3b82f6, #8b5cf6, #2563eb)",
        }}
      />

      {/* ② 흰색 내부 (링만 보이게) */}
      <div
        className="absolute rounded-full bg-white/92 backdrop-blur-sm"
        style={{
          inset: pad,
        }}
      />

      {/* ③ 내부 빛 반사 (은은한 그라데이션) */}
      <div
        className="absolute rounded-full opacity-40"
        style={{
          inset: pad * 1.5,
          background: "radial-gradient(circle at 35% 35%, rgba(37,99,235,0.3), rgba(124,58,237,0.15), transparent 70%)",
        }}
      />

      <style jsx>{`
        /* ─── idle: 떠다니기 3s + 느린 회전 8s ─── */
        .orb-anim-idle {
          animation: orbSpin 8s linear infinite, orbFloat 3s ease-in-out infinite;
        }

        /* ─── typing: 맥동 1.2s + 빠른 회전 3s ─── */
        .orb-anim-typing {
          animation: orbSpin 3s linear infinite, orbPulse 1.2s ease-in-out infinite;
        }

        /* ─── waiting: 느린 숨쉬기 4s + 갸웃 ─── */
        .orb-anim-waiting {
          animation: orbSpin 8s linear infinite, orbWait 4s ease-in-out infinite;
        }

        /* ─── listening: 살짝 커짐 + 미세 맥동 ─── */
        .orb-anim-listening {
          animation: orbSpin 5s linear infinite, orbListen 1.5s ease-in-out infinite;
        }

        /* ─── done: 밝게 빛나고 돌아옴 ─── */
        .orb-anim-done {
          animation: orbSpin 8s linear infinite, orbDone 0.5s ease-out forwards;
        }

        @keyframes orbSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: rotate(var(--r, 0deg)) translateY(0) scale(1); }
          50% { transform: rotate(var(--r, 0deg)) translateY(-2px) scale(1.03); }
        }
        @keyframes orbPulse {
          0%, 100% { transform: rotate(var(--r, 0deg)) scale(1); }
          50% { transform: rotate(var(--r, 0deg)) scale(1.06); }
        }
        @keyframes orbWait {
          0%, 100% { transform: rotate(var(--r, 0deg)) translateY(0); }
          30% { transform: rotate(calc(var(--r, 0deg) - 2deg)) translateY(-1px); }
          70% { transform: rotate(calc(var(--r, 0deg) + 2deg)) translateY(-1px); }
        }
        @keyframes orbListen {
          0%, 100% { transform: rotate(var(--r, 0deg)) scale(1.01); }
          50% { transform: rotate(var(--r, 0deg)) scale(1.04); }
        }
        @keyframes orbDone {
          0% { transform: rotate(var(--r, 0deg)) scale(1); filter: brightness(1); }
          30% { transform: rotate(var(--r, 0deg)) scale(1.08); filter: brightness(1.3); }
          100% { transform: rotate(var(--r, 0deg)) scale(1); filter: brightness(1); }
        }
      `}</style>
    </div>
  );
}
