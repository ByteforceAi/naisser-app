"use client";

import { cn } from "@/lib/utils/cn";

export type OrbState = "idle" | "typing" | "waiting" | "listening" | "done";

interface AiOrbProps {
  state?: OrbState;
  size?: number;
  className?: string;
}

/**
 * AI 오브 아바타 — NAISSER Interaction Spec v2.0
 *
 * 5가지 상태:
 * - idle:      숨쉬기 (3s) + 느린 회전 + 은은한 글로우
 * - typing:    빠른 맥동 (0.8s) + 회전 가속 + 글로우 밝아짐
 * - waiting:   느린 숨쉬기 (4s) + 갸웃 (rotate ±3deg)
 * - listening: 살짝 커짐 (scale 1.02) + 글로우 밝기 증가
 * - done:      sparkle 반짝 (0.3s) → idle로 복귀
 */
export function AiOrb({ state = "idle", size = 34, className }: AiOrbProps) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* 글로우 레이어 */}
      <div
        className={cn(
          "absolute inset-[-4px] rounded-full transition-all duration-500",
          state === "idle" && "orb-glow-idle",
          state === "typing" && "orb-glow-typing",
          state === "waiting" && "orb-glow-idle",
          state === "listening" && "orb-glow-listening",
          state === "done" && "orb-glow-done"
        )}
      />

      {/* 메인 구체 */}
      <div
        className={cn(
          "absolute inset-0 rounded-full orb-gradient",
          state === "idle" && "orb-idle",
          state === "typing" && "orb-typing",
          state === "waiting" && "orb-waiting",
          state === "listening" && "orb-listening",
          state === "done" && "orb-done"
        )}
      />

      {/* 하이라이트 (빛 반사) */}
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
        /* ─── 그라데이션 ─── */
        .orb-gradient {
          background: conic-gradient(
            from var(--orb-angle, 0deg),
            #2563eb, #7c3aed, #3b82f6, #8b5cf6, #2563eb
          );
        }

        @property --orb-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        /* ─── ① idle: 숨쉬기 3s + 느린 회전 8s ─── */
        .orb-idle {
          animation:
            orbSpin 8s linear infinite,
            orbBreathe 3s ease-in-out infinite;
        }
        @keyframes orbSpin { to { --orb-angle: 360deg; } }
        @keyframes orbBreathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.05); }
        }

        /* ─── ② typing: 빠른 맥동 0.8s + 회전 가속 2s ─── */
        .orb-typing {
          animation:
            orbSpin 2s linear infinite,
            orbTypingPulse 0.8s ease-in-out infinite;
        }
        @keyframes orbTypingPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        /* ─── ③ waiting: 느린 숨쉬기 4s + 갸웃 ─── */
        .orb-waiting {
          animation:
            orbSpin 8s linear infinite,
            orbWait 4s ease-in-out infinite;
        }
        @keyframes orbWait {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-2px) rotate(-3deg) scale(1.02); }
          75% { transform: translateY(-2px) rotate(3deg) scale(1.02); }
        }

        /* ─── ④ listening: 살짝 커짐 + 미세 맥동 ─── */
        .orb-listening {
          animation:
            orbSpin 5s linear infinite,
            orbListen 1.5s ease-in-out infinite;
        }
        @keyframes orbListen {
          0%, 100% { transform: scale(1.02); }
          50% { transform: scale(1.06); }
        }

        /* ─── ⑤ done: sparkle 반짝 → idle ─── */
        .orb-done {
          animation:
            orbSpin 8s linear infinite,
            orbDone 0.5s ease-out forwards;
        }
        @keyframes orbDone {
          0% { transform: scale(1); filter: brightness(1); }
          30% { transform: scale(1.15); filter: brightness(1.5); }
          100% { transform: scale(1); filter: brightness(1); }
        }

        /* ─── 글로우 상태별 ─── */
        .orb-glow-idle {
          box-shadow: 0 0 15px 3px rgba(37,99,235,0.2);
          animation: glowIdle 3s ease-in-out infinite;
        }
        @keyframes glowIdle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.3; }
        }

        .orb-glow-typing {
          animation: glowTyping 0.8s ease-in-out infinite;
        }
        @keyframes glowTyping {
          0%, 100% { box-shadow: 0 0 15px 3px rgba(124,58,237,0.25); }
          50% { box-shadow: 0 0 25px 8px rgba(124,58,237,0.5); }
        }

        .orb-glow-listening {
          box-shadow: 0 0 20px 5px rgba(37,99,235,0.35);
          opacity: 0.9;
        }

        .orb-glow-done {
          animation: glowDone 0.5s ease-out forwards;
        }
        @keyframes glowDone {
          0% { box-shadow: 0 0 15px 3px rgba(37,99,235,0.2); }
          30% { box-shadow: 0 0 30px 10px rgba(59,130,246,0.6); }
          100% { box-shadow: 0 0 15px 3px rgba(37,99,235,0.2); }
        }
      `}</style>
    </div>
  );
}
