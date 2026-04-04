"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A13: 슬롯머신 숫자 — 숫자가 바뀔 때 슬롯 머신처럼 굴러감
 * 타임스탬프, 카운터, 통계에 사용
 */
interface SlotNumberProps {
  value: number;
  className?: string;
  duration?: number;
}

export function SlotNumber({ value, className, duration = 600 }: SlotNumberProps) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (prevRef.current === value) return;
    prevRef.current = value;
    setAnimating(true);

    const start = performance.now();
    const from = display;
    const diff = value - from;

    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setDisplay(Math.round(from + diff * eased));
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        setAnimating(false);
      }
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span
      className={`inline-block tabular-nums transition-transform ${animating ? "scale-105" : "scale-100"} ${className || ""}`}
      style={{ transitionDuration: "150ms" }}
    >
      {display.toLocaleString()}
    </span>
  );
}
