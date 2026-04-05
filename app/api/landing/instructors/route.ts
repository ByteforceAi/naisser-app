import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

/**
 * GET /api/landing/instructors
 * 랜딩 페이지용 강사 미리보기 API (공개)
 * - 상위 3명 강사 (등록순, 프로필 이미지 있는 강사 우선)
 * - 연락처 마스킹 (이름, 주제, 지역, 평점만 반환)
 */
export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const instructors = await sql`
      SELECT
        instructor_name,
        topics,
        regions,
        COALESCE(average_rating, '0') as average_rating,
        COALESCE(review_count, 0)::int as review_count,
        profile_image
      FROM instructors
      WHERE instructor_name IS NOT NULL
        AND instructor_name != ''
      ORDER BY
        CASE WHEN profile_image IS NOT NULL THEN 0 ELSE 1 END,
        review_count DESC,
        created_at ASC
      LIMIT 3
    `;

    // 공개 필드만 반환 (연락처/SNS 절대 노출 금지)
    const data = instructors.map((inst) => ({
      name: inst.instructor_name,
      topics: inst.topics || [],
      regions: inst.regions || [],
      rating: parseFloat(inst.average_rating) || 0,
      reviews: inst.review_count,
      hasImage: !!inst.profile_image,
    }));

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Landing instructors error:", error);
    return NextResponse.json(
      { error: "강사 목록을 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
