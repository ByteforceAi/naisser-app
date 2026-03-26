"use client";

import { cn } from "@/lib/utils/cn";

export type OrbState = "idle" | "typing" | "waiting" | "listening" | "done";

interface AiOrbProps {
  state?: OrbState;
  size?: number;
  className?: string;
}

/**
 * AI 오브 — 랜딩페이지 app/page.tsx의 AiOrb 함수와 100% 동일한 구조
 *
 * 랜딩 코드:
 *   <div className="w-20 h-20 rounded-full shadow-[...] relative">
 *     <div style={{ background: "conic-gradient(...)", animation: "orbSpin 8s..., orbFloat 3s..." }} />
 *     <div className="absolute inset-[3px] rounded-full bg-white/90 backdrop-blur-sm" />
 *     <div className="absolute inset-[6px] rounded-full opacity-60" style={{ background: "radial-gradient(...)" }} />
 *   </div>
 *
 * 이 컴포넌트는 사이즈와 상태별 애니메이션 속도만 다르게 합니다.
 */
export function AiOrb({ state = "idle", size = 34, className }: AiOrbProps) {
  const spinSpeed = state === "typing" ? 3 : state === "listening" ? 5 : 8;
  const floatSpeed = state === "typing" ? 1.2 : state === "waiting" ? 4 : 3;
  const floatAnim = state === "typing" ? "orbPulseOnb" : "orbFloatOnb";
  const glowAlpha = state === "typing" ? 0.3 : state === "listening" ? 0.25 : 0.2;

  return (
    <div
      className={cn("rounded-full relative shrink-0", className)}
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 ${Math.round(size * 0.75)}px rgba(37,99,235,${glowAlpha})`,
        transition: "box-shadow 0.5s ease",
      }}
    >
      {/* 그라데이션 링 — 랜딩과 동일 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #2563eb, #7c3aed, #2563eb)",
          animation: `orbSpinOnb ${spinSpeed}s linear infinite, ${floatAnim} ${floatSpeed}s ease-in-out infinite`,
        }}
      />
      {/* 흰색 내부 — 랜딩과 동일 (inset-[3px]) */}
      <div
        className="absolute rounded-full bg-white/90 backdrop-blur-sm"
        style={{ inset: Math.max(2, Math.round(size * 0.075)) }}
      />
      {/* 빛 반사 — 랜딩과 동일 (inset-[6px]) */}
      <div
        className="absolute rounded-full opacity-60"
        style={{
          inset: Math.max(3, Math.round(size * 0.15)),
          background: "radial-gradient(circle at 35% 35%, rgba(37,99,235,0.4), rgba(124,58,237,0.2), transparent 70%)",
        }}
      />

      <style jsx>{`
        @keyframes orbSpinOnb { to { transform: rotate(360deg); } }
        @keyframes orbFloatOnb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.03); }
        }
        @keyframes orbPulseOnb {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
