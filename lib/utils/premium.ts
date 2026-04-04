/**
 * 프리미엄 기능 체크 — 모네타이제이션 기반
 *
 * 현재는 모두 무료. 추후 유료 전환 시 여기서 제어.
 *
 * 프리미엄 기능:
 * - 프로필 상위 노출
 * - 글 프로모트 (유료 부스트)
 * - 상세 분석 (게시글 통계)
 * - 예약 게시
 * - 광고 제거
 */

export interface PremiumPlan {
  id: string;
  name: string;
  price: number; // 월 원
  features: string[];
}

export const PLANS: PremiumPlan[] = [
  {
    id: "free",
    name: "무료",
    price: 0,
    features: ["프로필 등록", "커뮤니티 이용", "수업 의뢰 수신"],
  },
  {
    id: "pro",
    name: "프로",
    price: 9900,
    features: [
      "프로필 상위 노출",
      "게시글 통계 분석",
      "예약 게시",
      "프로필 커스텀 테마",
      "광고 없는 피드",
    ],
  },
  {
    id: "business",
    name: "비즈니스",
    price: 29900,
    features: [
      "프로 기능 전부",
      "글 프로모트 (월 3회)",
      "우선 고객 지원",
      "팀 관리 (강사 그룹)",
      "수업 자동 매칭",
    ],
  },
];

/**
 * 유저의 프리미엄 상태 확인
 * TODO: 실제 결제 시스템 연동 후 서버에서 체크
 */
export function isPremium(_userId?: string): boolean {
  // 현재 모두 무료
  return false;
}

export function canUseFeature(feature: string, _userId?: string): boolean {
  const FREE_FEATURES = ["profile", "community", "requests", "reviews", "documents"];
  if (FREE_FEATURES.includes(feature)) return true;
  return isPremium(_userId);
}
