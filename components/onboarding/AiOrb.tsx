"use client";

import { cn } from "@/lib/utils/cn";

export type OrbState = "idle" | "typing" | "waiting" | "listening" | "done";

interface AiOrbProps {
  state?: OrbState;
  size?: number;
  className?: string;
}

/**
 * AI 오브 — 랜딩페이지와 100% 동일한 코드 기반
 * 상태별로 animation 속도만 다르게
 */
export function AiOrb({ state = "idle", size = 34, className }: AiOrbProps) {
  // 상태별 animation 속도
  const spinSpeed = state === "typing" ? "3s" : "8s";
  const floatAnim =
    state === "typing"
      ? "orbPulseChat 1.2s ease-in-out infinite"
      : state === "listening"
        ? "orbListenChat 1.5s ease-in-out infinite"
        : "orbFloatChat 3s ease-in-out infinite";

  const glowSize = state === "typing" ? 0.6 : state === "listening" ? 0.5 : 0.35;
  const pad = Math.max(2, Math.round(size * 0.1));

  return (
    <div
      className={cn("relative shrink-0 rounded-full transition-shadow duration-500", className)}
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 ${Math.round(size * glowSize)}px rgba(37,99,235,${glowSize * 0.5})`,
      }}
    >
      {/* 그라데이션 링 — 랜딩과 동일 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #2563eb, #7c3aed, #2563eb)",
          animation: `orbSpinChat ${spinSpeed} linear infinite, ${floatAnim}`,
        }}
      />
      {/* 흰색 내부 — 랜딩과 동일 */}
      <div
        className="absolute rounded-full bg-white/90 backdrop-blur-sm"
        style={{ inset: pad }}
      />
      {/* 빛 반사 — 랜딩과 동일 */}
      <div
        className="absolute rounded-full opacity-60"
        style={{
          inset: pad * 2,
          background: "radial-gradient(circle at 35% 35%, rgba(37,99,235,0.4), rgba(124,58,237,0.2), transparent 70%)",
        }}
      />

      <style jsx>{`
        @keyframes orbSpinChat { to { transform: rotate(360deg); } }
        @keyframes orbFloatChat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.03); }
        }
        @keyframes orbPulseChat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes orbListenChat {
          0%, 100% { transform: scale(1.01); }
          50% { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
