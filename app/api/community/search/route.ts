import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { neon } from "@neondatabase/serverless";

/**
 * GET /api/community/search?q=검색어&limit=20
 *
 * 커뮤니티 게시글 전문 검색
 * body, tags에서 검색 + 작성자명 매칭
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ data: [], error: "검색어는 2자 이상 입력해주세요" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const searchTerm = `%${q.trim()}%`;
    const tagTerm = q.trim();

    const posts = await sql`
      SELECT
        p.id, p.body, p.category, p.images, p.tags,
        p.like_count, p.helpful_count, p.comment_count,
        p.created_at,
        i.instructor_name as author_name,
        i.profile_image as author_image,
        i.topics as author_topics,
        i.regions as author_regions
      FROM community_posts p
      LEFT JOIN instructors i ON p.author_id = i.user_id
      WHERE p.body ILIKE ${searchTerm}
        OR i.instructor_name ILIKE ${searchTerm}
        OR ${tagTerm} = ANY(p.tags)
      ORDER BY p.created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({ data: posts });
  } catch (err) {
    console.error("[community/search]", err);
    return NextResponse.json({ data: [], error: "검색 중 오류 발생" }, { status: 500 });
  }
}
