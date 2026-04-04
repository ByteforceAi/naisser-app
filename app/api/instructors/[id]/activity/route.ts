import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * GET /api/instructors/[id]/activity
 *
 * 강사의 최근 커뮤니티 활동 (게시글 + 댓글)
 * 프로필 페이지 타임라인에 사용
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 최근 게시글 5개
    const posts = await sql`
      SELECT id, body, category, like_count, comment_count, created_at
      FROM community_posts
      WHERE author_id = ${params.id}
      ORDER BY created_at DESC
      LIMIT 5
    `;

    // 최근 댓글 5개
    const comments = await sql`
      SELECT c.id, c.content, c.created_at, p.id as post_id
      FROM community_comments c
      JOIN community_posts p ON c.post_id = p.id
      WHERE c.author_id = ${params.id}
      ORDER BY c.created_at DESC
      LIMIT 5
    `;

    // 합쳐서 시간순 정렬
    const activity = [
      ...posts.map((p: Record<string, unknown>) => ({ type: "post" as const, ...p }) as Record<string, unknown> & { type: "post" }),
      ...comments.map((c: Record<string, unknown>) => ({ type: "comment" as const, ...c }) as Record<string, unknown> & { type: "comment" }),
    ].sort((a, b) => {
      const aTime = new Date(a.created_at as string).getTime();
      const bTime = new Date(b.created_at as string).getTime();
      return bTime - aTime;
    }).slice(0, 10);

    return NextResponse.json({ data: activity });
  } catch (err) {
    console.error("[activity]", err);
    return NextResponse.json({ data: [] });
  }
}
