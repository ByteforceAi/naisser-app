"use client";

import { useEffect, useState } from "react";

/**
 * useDeviceTilt — 디바이스 기울기 감지
 *
 * 디지털 명함의 3D 패럴랙스 효과에 사용.
 * 기울기에 따라 x(-1~1), y(-1~1) 값 반환.
 * 데스크톱에서는 마우스 위치로 폴백.
 */
export function useDeviceTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 모바일: DeviceOrientation
    function handleOrientation(e: DeviceOrientationEvent) {
      const x = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
      const y = Math.max(-1, Math.min(1, (e.beta || 0 - 45) / 30));
      setTilt({ x, y });
    }

    // 데스크톱: 마우스 위치
    function handleMouse(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setTilt({ x, y });
    }

    if (typeof DeviceOrientationEvent !== "undefined" && "ontouchstart" in window) {
      window.addEventListener("deviceorientation", handleOrientation);
      return () => window.removeEventListener("deviceorientation", handleOrientation);
    } else {
      window.addEventListener("mousemove", handleMouse);
      return () => window.removeEventListener("mousemove", handleMouse);
    }
  }, []);

  return tilt;
}
