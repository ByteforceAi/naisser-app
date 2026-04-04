/**
 * Core Web Vitals 모니터링
 *
 * LCP < 2.5s, FID < 100ms, CLS < 0.1
 *
 * Vercel Analytics가 이미 연동되어 있지만,
 * 추가 커스텀 메트릭 수집용
 */

export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: "web-vital" | "custom";
}) {
  // Vercel Analytics로 자동 전송됨 (next/third-parties)
  // 추가 로깅:
  if (process.env.NODE_ENV === "development") {
    const color =
      metric.name === "LCP" && metric.value > 2500 ? "red" :
      metric.name === "FID" && metric.value > 100 ? "red" :
      metric.name === "CLS" && metric.value > 0.1 ? "red" :
      "green";

    console.log(
      `%c[WebVital] ${metric.name}: ${metric.value.toFixed(2)}`,
      `color: ${color}; font-weight: bold;`
    );
  }

  // TODO: 커스텀 분석 서비스 전송
  // fetch("/api/analytics/vitals", {
  //   method: "POST",
  //   body: JSON.stringify(metric),
  // });
}

/**
 * 이미지 LCP 최적화 가이드
 *
 * - 히어로 이미지: priority={true} + fetchPriority="high"
 * - 피드 첫 2개 포스트 이미지: priority
 * - 나머지: lazy loading (기본)
 */
export function shouldPrioritizeImage(index: number): boolean {
  return index < 2; // 첫 2개만 priority
}
