import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { requestRespondSchema } from "@/lib/validations/request";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = requestRespondSchema.safeParse(body);
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

    // 의뢰 존재 + 본인 의뢰인지 확인
    const [existingRequest] = await db
      .select()
      .from(schema.lessonRequests)
      .where(eq(schema.lessonRequests.id, params.id));

    if (!existingRequest) {
      return NextResponse.json(
        { error: "해당 의뢰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existingRequest.instructorId !== instructor.id) {
      return NextResponse.json(
        { error: "본인에게 온 의뢰만 응답할 수 있습니다." },
        { status: 403 }
      );
    }

    if (existingRequest.status !== "pending" && existingRequest.status !== "viewed") {
      return NextResponse.json(
        { error: "이미 처리된 의뢰입니다." },
        { status: 400 }
      );
    }

    // 의뢰 상태 업데이트
    const [updated] = await db
      .update(schema.lessonRequests)
      .set({
        status: parsed.data.action,
        rejectReason: parsed.data.action === "rejected" ? (parsed.data.rejectReason ?? null) : null,
        instructorMessage: parsed.data.message ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.lessonRequests.id, params.id))
      .returning();

    // 교사에게 알림 생성
    const [teacher] = await db
      .select()
      .from(schema.teachers)
      .where(eq(schema.teachers.id, existingRequest.teacherId));

    if (teacher) {
      const isAccepted = parsed.data.action === "accepted";
      await db.insert(schema.notifications).values({
        userId: teacher.userId,
        type: isAccepted ? "request_accepted" : "request_rejected",
        referenceId: params.id,
        title: isAccepted ? "수업 의뢰가 수락되었습니다" : "수업 의뢰가 거절되었습니다",
        body: isAccepted
          ? `${instructor.instructorName} 강사님이 수업 의뢰를 수락했습니다.`
          : `${instructor.instructorName} 강사님이 수업 의뢰를 거절했습니다.`,
      });
    }

    return NextResponse.json({ data: { id: updated.id, status: updated.status } });
  } catch (error) {
    console.error("의뢰 응답 실패:", error);
    return NextResponse.json(
      { error: "의뢰 응답 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
