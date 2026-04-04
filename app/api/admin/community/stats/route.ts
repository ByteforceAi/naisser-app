import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * GET /api/admin/community/stats
 *
 * 커뮤니티 통계 — 어드민 대시보드용
 * DAU, 총 게시글, 오늘 게시글, 총 댓글, 신고 수
 */
export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const [postsTotal] = await sql`SELECT COUNT(*) as count FROM community_posts`;
    const [postsToday] = await sql`SELECT COUNT(*) as count FROM community_posts WHERE created_at >= CURRENT_DATE`;
    const [commentsTotal] = await sql`SELECT COUNT(*) as count FROM community_comments`;
    const [likesTotal] = await sql`SELECT COUNT(*) as count FROM community_likes`;

    // DAU (오늘 활동한 유저 수)
    const [dau] = await sql`
      SELECT COUNT(DISTINCT author_id) as count
      FROM community_posts
      WHERE created_at >= CURRENT_DATE
    `;

    return NextResponse.json({
      data: {
        postsTotal: Number(postsTotal.count),
        postsToday: Number(postsToday.count),
        commentsTotal: Number(commentsTotal.count),
        likesTotal: Number(likesTotal.count),
        dau: Number(dau.count),
      },
    });
  } catch (err) {
    console.error("[admin/community/stats]", err);
    return NextResponse.json({ error: "통계 조회 실패" }, { status: 500 });
  }
}
