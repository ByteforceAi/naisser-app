import { NextRequest, NextResponse } from "next/server";
import { requireTeacher, isErrorResponse } from "@/lib/auth/middleware";
import { reviewCreateSchema } from "@/lib/validations/review";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 리뷰 목록 + 교사 이름 JOIN
    const reviewsWithTeacher = await db
      .select({
        id: schema.reviews.id,
        instructorId: schema.reviews.instructorId,
        teacherId: schema.reviews.teacherId,
        rating: schema.reviews.rating,
        content: schema.reviews.content,
        createdAt: schema.reviews.createdAt,
        updatedAt: schema.reviews.updatedAt,
        teacherName: schema.teachers.name,
        schoolName: schema.teachers.schoolName,
      })
      .from(schema.reviews)
      .leftJoin(schema.teachers, eq(schema.reviews.teacherId, schema.teachers.id))
      .where(eq(schema.reviews.instructorId, params.id))
      .orderBy(desc(schema.reviews.createdAt));

    return NextResponse.json({ data: reviewsWithTeacher });
  } catch (error) {
    console.error("리뷰 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "리뷰 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireTeacher();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = reviewCreateSchema.safeParse({ ...body, instructorId: params.id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    // 교사 프로필 조회
    const [teacher] = await db
      .select()
      .from(schema.teachers)
      .where(eq(schema.teachers.userId, session.user.id));

    if (!teacher) {
      return NextResponse.json(
        { error: "교사 프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 강사 존재 확인
    const [instructor] = await db
      .select()
      .from(schema.instructors)
      .where(eq(schema.instructors.id, params.id));

    if (!instructor) {
      return NextResponse.json(
        { error: "해당 강사를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 리뷰 생성 (unique constraint로 중복 방지)
    let newReview;
    try {
      [newReview] = await db
        .insert(schema.reviews)
        .values({
          instructorId: params.id,
          teacherId: teacher.id,
          rating: parsed.data.rating,
          content: parsed.data.content ?? null,
        })
        .returning();
    } catch (err: unknown) {
      // unique constraint violation (교사당 강사 1개 리뷰)
      const message = err instanceof Error ? err.message : "";
      if (message.includes("unique") || message.includes("duplicate")) {
        return NextResponse.json(
          { error: "이미 이 강사에 대한 리뷰를 작성하셨습니다." },
          { status: 409 }
        );
      }
      throw err;
    }

    // 강사 averageRating, reviewCount 업데이트
    await db
      .update(schema.instructors)
      .set({
        reviewCount: sql`${schema.instructors.reviewCount} + 1`,
        averageRating: sql`(
          SELECT ROUND(AVG(${schema.reviews.rating})::numeric, 1)
          FROM ${schema.reviews}
          WHERE ${schema.reviews.instructorId} = ${params.id}
        )`,
        updatedAt: new Date(),
      })
      .where(eq(schema.instructors.id, params.id));

    return NextResponse.json({ data: { id: newReview.id } }, { status: 201 });
  } catch (error) {
    console.error("리뷰 작성 실패:", error);
    return NextResponse.json(
      { error: "리뷰 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
