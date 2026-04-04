/**
 * 프로모트 포스트 — 유료 부스트
 *
 * 자기 글을 유료로 상위 노출
 * 프리미엄 플랜 가입자만 사용 가능
 *
 * TODO: 실제 결제 연동 후 활성화
 */

export interface PromotionConfig {
  postId: string;
  budget: number; // 원
  duration: number; // 시간
  targetRegions?: string[];
  targetTopics?: string[];
}

export interface PromotionStats {
  impressions: number;
  clicks: number;
  spent: number;
  remainingBudget: number;
}

export function calculateReach(budget: number): { estimatedImpressions: number; estimatedClicks: number } {
  // 가격 모델: 1000원당 약 200 노출, 5% CTR
  const impressions = Math.floor((budget / 1000) * 200);
  const clicks = Math.floor(impressions * 0.05);
  return { estimatedImpressions: impressions, estimatedClicks: clicks };
}

export const PROMOTION_PRICES = [
  { budget: 5000, label: "5,000원", desc: "약 1,000회 노출" },
  { budget: 10000, label: "10,000원", desc: "약 2,000회 노출" },
  { budget: 30000, label: "30,000원", desc: "약 6,000회 노출" },
];
