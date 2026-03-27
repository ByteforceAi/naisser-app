import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { reviewReplySchema } from "@/lib/validations/review";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = reviewReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    // 강사 프로필 조회
    const [instructor] = await db
      .select()
      .from(schema.instructors)
      .where(eq(schema.instructors.userId, session.user.id));

    if (!instructor) {
      return NextResponse.json(
        { error: "강사 프로필을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 리뷰 존재 확인 + 본인 강사 리뷰인지 확인
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

    if (review.instructorId !== instructor.id) {
      return NextResponse.json(
        { error: "본인에게 달린 리뷰에만 답글을 작성할 수 있습니다." },
        { status: 403 }
      );
    }

    // 이미 답글이 있는지 확인 (1 reply per review)
    const existingReplies = await db
      .select()
      .from(schema.reviewReplies)
      .where(eq(schema.reviewReplies.reviewId, params.id));

    if (existingReplies.length > 0) {
      return NextResponse.json(
        { error: "이미 답글을 작성하셨습니다." },
        { status: 409 }
      );
    }

    const [newReply] = await db
      .insert(schema.reviewReplies)
      .values({
        reviewId: params.id,
        instructorId: instructor.id,
        content: parsed.data.content,
      })
      .returning();

    return NextResponse.json({ data: { id: newReply.id } }, { status: 201 });
  } catch (error) {
    console.error("리뷰 답글 작성 실패:", error);
    return NextResponse.json(
      { error: "리뷰 답글 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
