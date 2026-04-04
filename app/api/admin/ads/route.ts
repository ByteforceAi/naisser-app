import { NextRequest, NextResponse } from "next/server";

/**
 * 광고 관리 API
 *
 * GET  /api/admin/ads — 활성 광고 목록
 * POST /api/admin/ads — 새 광고 등록
 *
 * 피드 내 AdSlot에서 활성 광고를 가져와서 표시
 */

// 현재는 하드코딩된 플레이스홀더 광고
const PLACEHOLDER_ADS = [
  {
    id: "ad-1",
    type: "community_feed",
    content: "강사 프로필을 완성하면 더 많은 수업 기회를 받을 수 있어요",
    ctaText: "바로가기",
    ctaUrl: "/instructor/profile/edit",
    isActive: true,
  },
];

export async function GET() {
  // TODO: DB에서 활성 광고 조회
  return NextResponse.json({
    data: PLACEHOLDER_ADS.filter((ad) => ad.isActive),
  });
}

export async function POST(req: NextRequest) {
  // TODO: 관리자 인증 + DB INSERT
  const body = await req.json();
  console.log("[ad/create]", body);
  return NextResponse.json({ data: { success: true } });
}
