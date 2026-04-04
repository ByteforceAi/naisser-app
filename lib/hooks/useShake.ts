"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * useShake — 디바이스 흔들기 감지
 *
 * 강사 목록에서 흔들면 랜덤 셔플.
 * threshold: 가속도 임계값 (기본 15)
 * cooldown: 연속 감지 방지 (기본 2000ms)
 */
export function useShake(
  onShake: () => void,
  { threshold = 15, cooldown = 2000 } = {}
) {
  const lastShake = useRef(0);
  const lastAcc = useRef({ x: 0, y: 0, z: 0 });

  const handleMotion = useCallback(
    (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc?.x || !acc?.y || !acc?.z) return;

      const dx = Math.abs(acc.x - lastAcc.current.x);
      const dy = Math.abs(acc.y - lastAcc.current.y);
      const dz = Math.abs(acc.z - lastAcc.current.z);

      lastAcc.current = { x: acc.x, y: acc.y, z: acc.z };

      if (dx + dy + dz > threshold) {
        const now = Date.now();
        if (now - lastShake.current > cooldown) {
          lastShake.current = now;
          onShake();
        }
      }
    },
    [onShake, threshold, cooldown]
  );

  useEffect(() => {
    if (typeof DeviceMotionEvent === "undefined") return;

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [handleMotion]);
}
