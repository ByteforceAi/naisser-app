import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth/middleware";

/**
 * 관리자 공지사항 API
 *
 * GET  — 활성 공지 목록
 * POST — 새 공지 작성
 *
 * 카테고리별 공지: 전체, 단가, 노하우, 정보, 수다
 */

// 현재는 하드코딩 — 추후 DB로
const ANNOUNCEMENTS = [
  {
    id: "ann-1",
    category: "all",
    title: "강사 라운지 오픈",
    content: "동료 강사님들과 경험과 정보를 자유롭게 나눠보세요.",
    isActive: true,
    createdAt: "2026-03-01T00:00:00Z",
  },
];

export async function GET(req: NextRequest) {
  const authError = requireAdminToken(req);
  if (authError) return authError;

  return NextResponse.json({
    data: ANNOUNCEMENTS.filter((a) => a.isActive),
  });
}

export async function POST(req: NextRequest) {
  const authError = requireAdminToken(req);
  if (authError) return authError;

  const body = await req.json();
  console.log("[announcement/create]", body);
  return NextResponse.json({ data: { success: true } });
}
