/**
 * Dynamic Import 헬퍼
 *
 * 큰 컴포넌트를 코드 스플리팅하여 초기 번들 크기를 줄임
 *
 * 사용:
 *   const Celebration = dynamicComponent(() => import("@/components/shared/Celebration"));
 *   <Celebration show={true} title="축하!" />
 */

import dynamic from "next/dynamic";

// 마일스톤 축하 (컨페티 파티클 — 큰 컴포넌트)
export const DynamicCelebration = dynamic(
  () => import("@/components/shared/Celebration").then((m) => m.Celebration),
  { ssr: false }
);

// 신고 바텀시트
export const DynamicReportSheet = dynamic(
  () => import("@/components/community/ReportSheet").then((m) => m.ReportSheet),
  { ssr: false }
);

// 이미지 줌 모달 (터치 핸들링 무거움)
// 필요 시 커뮤니티 페이지에서 dynamic import로 전환
