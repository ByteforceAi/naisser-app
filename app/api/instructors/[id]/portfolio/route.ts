import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/instructors/[id]/portfolio
 * 강사 포트폴리오 링크 공개 조회
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [result] = await db
      .select({
        portfolioLinks: instructors.portfolioLinks,
      })
      .from(instructors)
      .where(eq(instructors.id, params.id))
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { data: null, error: "강사를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const links = result.portfolioLinks ?? [];

    return NextResponse.json({ data: { links } });
  } catch (error) {
    console.error("[GET /api/instructors/:id/portfolio] Error:", error);
    return NextResponse.json(
      { data: null, error: "포트폴리오 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
