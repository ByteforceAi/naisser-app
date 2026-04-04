/**
 * 제휴 마켓플레이스 — 교구/재료 공동구매
 *
 * 커뮤니티 내에서 교구, 재료, 보험 등을 공동구매할 수 있는 구조
 * 추후 별도 탭이나 페이지로 확장
 */

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category: "교구" | "재료" | "보험" | "교통" | "기타";
  sellerName: string;
  sellerUrl: string;
  minParticipants: number;
  currentParticipants: number;
  deadline: string; // ISO
  isActive: boolean;
}

// 플레이스홀더 — 실제로는 DB에서
export const SAMPLE_ITEMS: MarketplaceItem[] = [
  {
    id: "mp-1",
    title: "흡연예방 교구 세트 (폐 모형)",
    description: "실제 크기 폐 모형 + 타르 병 세트. 10개 이상 주문 시 30% 할인",
    price: 45000,
    originalPrice: 65000,
    category: "교구",
    sellerName: "에듀몰",
    sellerUrl: "https://example.com",
    minParticipants: 10,
    currentParticipants: 7,
    deadline: "2026-04-15T00:00:00Z",
    isActive: true,
  },
];
