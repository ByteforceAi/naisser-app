import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * GET /api/community/trending
 *
 * 트렌딩 해시태그 (최근 7일 가장 많이 사용된 태그 5개)
 */
export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const tags = await sql`
      SELECT unnest(tags) as tag, COUNT(*) as count
      FROM community_posts
      WHERE created_at >= NOW() - INTERVAL '7 days'
        AND tags IS NOT NULL
        AND array_length(tags, 1) > 0
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 5
    `;

    return NextResponse.json({
      data: (tags as { tag: string; count: string }[]).map((t) => ({
        tag: t.tag,
        count: Number(t.count),
      })),
    });
  } catch {
    // 폴백: 하드코딩 트렌딩
    return NextResponse.json({
      data: [
        { tag: "흡연예방", count: 0 },
        { tag: "서울시교육청", count: 0 },
        { tag: "단가인상", count: 0 },
        { tag: "AI수업", count: 0 },
        { tag: "진로직업", count: 0 },
      ],
    });
  }
}
