import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    // 리뷰 조회
    const [review] = await db
      .select()
      .from(schema.reviews)
      .where(eq(schema.reviews.id, params.id));

    if (!review) {
      return NextResponse.json(
        { error: "해당 리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 본인 확인: 리뷰 작성자(교사)의 userId와 세션 userId 비교
    const [teacher] = await db
      .select()
      .from(schema.teachers)
      .where(eq(schema.teachers.id, review.teacherId));

    if (!teacher || teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "본인이 작성한 리뷰만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rating, content } = body;

    // 최소한의 검증
    if (rating !== undefined && (typeof rating !== "number" || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "별점은 1~5점 사이여야 합니다." },
        { status: 400 }
      );
    }
    if (content !== undefined && typeof content === "string" && content.length > 500) {
      return NextResponse.json(
        { error: "리뷰는 500자 이하로 작성해주세요." },
        { status: 400 }
      );
    }

    // 리뷰 업데이트
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (rating !== undefined) updateData.rating = rating;
    if (content !== undefined) updateData.content = content;

    const [updated] = await db
      .update(schema.reviews)
      .set(updateData)
      .where(eq(schema.reviews.id, params.id))
      .returning();

    // 별점이 바뀌었으면 강사 averageRating 재계산
    if (rating !== undefined) {
      await db
        .update(schema.instructors)
        .set({
          averageRating: sql`(
            SELECT ROUND(AVG(${schema.reviews.rating})::numeric, 1)
            FROM ${schema.reviews}
            WHERE ${schema.reviews.instructorId} = ${review.instructorId}
          )`,
          updatedAt: new Date(),
        })
        .where(eq(schema.instructors.id, review.instructorId));
    }

    return NextResponse.json({ data: { id: updated.id } });
  } catch (error) {
    console.error("리뷰 수정 실패:", error);
    return NextResponse.json(
      { error: "리뷰 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    // 리뷰 조회
    const [review] = await db
      .select()
      .from(schema.reviews)
      .where(eq(schema.reviews.id, params.id));

    if (!review) {
      return NextResponse.json(
        { error: "해당 리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 본인 확인
    const [teacher] = await db
      .select()
      .from(schema.teachers)
      .where(eq(schema.teachers.id, review.teacherId));

    if (!teacher || teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "본인이 작성한 리뷰만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    const instructorId = review.instructorId;

    // 리뷰 삭제
    await db
      .delete(schema.reviews)
      .where(eq(schema.reviews.id, params.id));

    // 강사 reviewCount -1 + averageRating 재계산
    await db
      .update(schema.instructors)
      .set({
        reviewCount: sql`GREATEST(${schema.instructors.reviewCount} - 1, 0)`,
        averageRating: sql`COALESCE(
          (SELECT ROUND(AVG(${schema.reviews.rating})::numeric, 1)
           FROM ${schema.reviews}
           WHERE ${schema.reviews.instructorId} = ${instructorId}),
          0
        )`,
        updatedAt: new Date(),
      })
      .where(eq(schema.instructors.id, instructorId));

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("리뷰 삭제 실패:", error);
    return NextResponse.json(
      { error: "리뷰 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
