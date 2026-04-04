import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * POST /api/community/posts/[id]/view
 *
 * 게시글 조회수 +1 (중복 방지 없이 단순 증가)
 * 포스트 상세 페이지 진입 시 호출
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      UPDATE community_posts
      SET view_count = COALESCE(view_count, 0) + 1
      WHERE id = ${params.id}
    `;
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json({ error: "조회수 업데이트 실패" }, { status: 500 });
  }
}
