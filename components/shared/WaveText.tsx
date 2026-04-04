"use client";

/**
 * A14: 대기 웨이브 루프 — 빈 상태 텍스트에 물결치는 글자 효과
 * 각 글자가 시차를 두고 살짝 올랐다 내려오는 물결 애니메이션
 */
interface WaveTextProps {
  text: string;
  className?: string;
}

export function WaveText({ text, className }: WaveTextProps) {
  return (
    <span className={`animate-wait-wave ${className || ""}`}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            animationDelay: `${i * 0.08}s`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}
