import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schoolReviewSchema = z.object({
  schoolName: z.string().min(2, "학교명을 입력해주세요."),
  schoolCode: z.string().optional(),
  region: z.string().optional(),
  facilityRating: z.number().int().min(1).max(5, "1~5점으로 평가해주세요."),
  cooperationRating: z.number().int().min(1).max(5),
  accessibilityRating: z.number().int().min(1).max(5),
  content: z.string().min(10, "리뷰는 10자 이상 작성해주세요.").max(1000),
  visitDate: z.string().optional(),
  wouldReturn: z.boolean().optional(),
  tips: z.string().max(500).optional(),
  isAnonymous: z.boolean().optional(),
});

/** POST — 학교 리뷰 작성 (강사 전용) */
export async function POST(request: NextRequest) {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = schoolReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    // 강사 프로필 조회
    const [instructor] = await db
      .select({ id: schema.instructors.id })
      .from(schema.instructors)
      .where(eq(schema.instructors.userId, session.user.id));

    if (!instructor) {
      return NextResponse.json({ error: "강사 프로필을 찾을 수 없습니다." }, { status: 404 });
    }

    const d = parsed.data;
    const overall = ((d.facilityRating + d.cooperationRating + d.accessibilityRating) / 3).toFixed(1);

    const [review] = await db
      .insert(schema.schoolReviews)
      .values({
        instructorId: instructor.id,
        schoolName: d.schoolName,
        schoolCode: d.schoolCode ?? null,
        region: d.region ?? null,
        facilityRating: d.facilityRating,
        cooperationRating: d.cooperationRating,
        accessibilityRating: d.accessibilityRating,
        overallRating: overall,
        content: d.content,
        visitDate: d.visitDate ?? null,
        wouldReturn: d.wouldReturn ?? true,
        tips: d.tips ?? null,
        isAnonymous: d.isAnonymous ?? true,
      })
      .returning();

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/schools/reviews] Error:", error);
    return NextResponse.json({ error: "리뷰 등록 중 오류가 발생했습니다." }, { status: 500 });
  }
}

/** GET — 학교 리뷰 목록 (전체 또는 학교명 필터) */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const school = searchParams.get("school");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  try {
    const conditions = school
      ? eq(schema.schoolReviews.schoolName, school)
      : undefined;

    const [countResult] = await db
      .select({ total: sql<number>`count(*)` })
      .from(schema.schoolReviews)
      .where(conditions);

    const total = Number(countResult?.total ?? 0);
    const reviews = await db
      .select()
      .from(schema.schoolReviews)
      .where(conditions)
      .orderBy(desc(schema.schoolReviews.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // 학교별 통계 (특정 학교 조회 시)
    let stats = null;
    if (school && total > 0) {
      const [s] = await db
        .select({
          avgFacility: sql<string>`ROUND(AVG(facility_rating), 1)`,
          avgCooperation: sql<string>`ROUND(AVG(cooperation_rating), 1)`,
          avgAccessibility: sql<string>`ROUND(AVG(accessibility_rating), 1)`,
          avgOverall: sql<string>`ROUND(AVG(overall_rating::numeric), 1)`,
          wouldReturnPct: sql<string>`ROUND(AVG(CASE WHEN would_return THEN 100 ELSE 0 END), 0)`,
        })
        .from(schema.schoolReviews)
        .where(eq(schema.schoolReviews.schoolName, school));
      stats = s;
    }

    return NextResponse.json({
      data: reviews,
      stats,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/schools/reviews] Error:", error);
    return NextResponse.json({ error: "리뷰 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
