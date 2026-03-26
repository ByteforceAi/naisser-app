"use client";

import { cn } from "@/lib/utils/cn";

interface AiOrbProps {
  state?: "idle" | "thinking" | "done";
  size?: number;
  className?: string;
}

/**
 * AI 오브 아바타 — 살아있는 그라데이션 구체
 *
 * 3가지 상태:
 * - idle: 은은하게 떠다니며 천천히 회전
 * - thinking: 빠르게 pulse + 글로우 밝아짐
 * - done: 잠깐 밝게 빛나고 다시 차분하게
 *
 * CSS only — 이미지 파일 없음
 */
export function AiOrb({ state = "idle", size = 34, className }: AiOrbProps) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* 글로우 레이어 (외곽 빛) */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-opacity duration-500",
          state === "thinking" ? "orb-glow-active" : "orb-glow-idle",
          state === "done" && "orb-glow-flash"
        )}
      />

      {/* 메인 구체 */}
      <div
        className={cn(
          "absolute inset-0 rounded-full orb-gradient",
          state === "idle" && "orb-float",
          state === "thinking" && "orb-think",
          state === "done" && "orb-done"
        )}
      />

      {/* 하이라이트 (구체 위 빛 반사) */}
      <div
        className="absolute rounded-full bg-white/30"
        style={{
          width: size * 0.35,
          height: size * 0.2,
          top: size * 0.15,
          left: size * 0.2,
          filter: "blur(2px)",
        }}
      />

      <style jsx>{`
        /* ─── 그라데이션 회전 (8초) ─── */
        .orb-gradient {
          background: conic-gradient(
            from var(--orb-angle, 0deg),
            #2563eb,
            #7c3aed,
            #3b82f6,
            #8b5cf6,
            #2563eb
          );
          animation: orbRotate 8s linear infinite;
        }

        @keyframes orbRotate {
          to { --orb-angle: 360deg; }
        }

        @property --orb-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        /* ─── idle: 떠다니는 느낌 (3초) ─── */
        .orb-float {
          animation:
            orbRotate 8s linear infinite,
            orbFloat 3s ease-in-out infinite;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        /* ─── thinking: 빠른 pulse (1.2초) ─── */
        .orb-think {
          animation:
            orbRotate 4s linear infinite,
            orbPulse 1.2s ease-in-out infinite;
        }

        @keyframes orbPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        /* ─── done: 밝게 빛나고 되돌아옴 ─── */
        .orb-done {
          animation:
            orbRotate 8s linear infinite,
            orbFlash 0.6s ease-out forwards,
            orbFloat 3s ease-in-out infinite 0.6s;
        }

        @keyframes orbFlash {
          0% { transform: scale(1); filter: brightness(1); }
          40% { transform: scale(1.12); filter: brightness(1.4); }
          100% { transform: scale(1); filter: brightness(1); }
        }

        /* ─── 글로우 (외곽 빛) ─── */
        .orb-glow-idle {
          box-shadow: 0 0 12px 2px rgba(37, 99, 235, 0.2);
          opacity: 0.6;
        }

        .orb-glow-active {
          box-shadow: 0 0 18px 4px rgba(124, 58, 237, 0.35);
          opacity: 1;
          animation: glowPulse 1.2s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 12px 2px rgba(124, 58, 237, 0.25); }
          50% { box-shadow: 0 0 20px 6px rgba(124, 58, 237, 0.45); }
        }

        .orb-glow-flash {
          animation: glowFlash 0.6s ease-out forwards;
        }

        @keyframes glowFlash {
          0% { box-shadow: 0 0 12px 2px rgba(37, 99, 235, 0.2); }
          40% { box-shadow: 0 0 24px 8px rgba(59, 130, 246, 0.5); }
          100% { box-shadow: 0 0 12px 2px rgba(37, 99, 235, 0.2); }
        }
      `}</style>
    </div>
  );
}
