import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * GET /api/landing/stats
 * 랜딩 페이지용 공개 통계 API
 * - 인증 불필요
 * - Vercel Edge에서 5분 캐시
 */
export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const [instructors, teachers, regions, topics] = await Promise.all([
      sql`SELECT COUNT(*)::int as cnt FROM instructors`,
      sql`SELECT COUNT(*)::int as cnt FROM teachers`,
      sql`SELECT COUNT(DISTINCT r)::int as cnt FROM instructors, LATERAL unnest(regions) AS r`,
      sql`SELECT COUNT(DISTINCT t)::int as cnt FROM instructors, LATERAL unnest(topics) AS t`,
    ]);

    return NextResponse.json(
      {
        data: {
          instructors: instructors[0].cnt,
          teachers: teachers[0].cnt,
          regions: regions[0].cnt,
          topics: topics[0].cnt,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Landing stats error:", error);
    return NextResponse.json(
      { error: "통계를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
