import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// 의뢰 상세 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const [request_] = await db
      .select()
      .from(schema.lessonRequests)
      .where(eq(schema.lessonRequests.id, params.id))
      .limit(1);

    if (!request_) {
      return NextResponse.json(
        { data: null, error: "의뢰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 교사 또는 해당 강사만 조회 가능
    const userId = session.user.id;
    const [teacher] = await db
      .select({ id: schema.teachers.id })
      .from(schema.teachers)
      .where(eq(schema.teachers.userId, userId))
      .limit(1);

    const [instructor] = await db
      .select({ id: schema.instructors.id })
      .from(schema.instructors)
      .where(eq(schema.instructors.userId, userId))
      .limit(1);

    const isTeacher = teacher?.id === request_.teacherId;
    const isInstructor = instructor?.id === request_.instructorId;

    if (!isTeacher && !isInstructor && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "조회 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 강사가 처음 조회하면 viewed 상태로 변경
    if (isInstructor && request_.status === "pending") {
      await db
        .update(schema.lessonRequests)
        .set({ status: "viewed", updatedAt: new Date() })
        .where(eq(schema.lessonRequests.id, params.id));
    }

    return NextResponse.json({ data: request_ });
  } catch (error) {
    console.error("[GET /api/requests/:id] Error:", error);
    return NextResponse.json(
      { error: "의뢰 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 의뢰 취소 (교사만, pending/viewed 상태에서만)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const [request_] = await db
      .select()
      .from(schema.lessonRequests)
      .where(eq(schema.lessonRequests.id, params.id))
      .limit(1);

    if (!request_) {
      return NextResponse.json(
        { error: "의뢰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 교사만 취소 가능
    const [teacher] = await db
      .select({ id: schema.teachers.id })
      .from(schema.teachers)
      .where(eq(schema.teachers.userId, session.user.id))
      .limit(1);

    if (teacher?.id !== request_.teacherId) {
      return NextResponse.json(
        { error: "취소 권한이 없습니다." },
        { status: 403 }
      );
    }

    if (!["pending", "viewed"].includes(request_.status || "")) {
      return NextResponse.json(
        { error: "이미 처리된 의뢰는 취소할 수 없습니다." },
        { status: 400 }
      );
    }

    await db
      .update(schema.lessonRequests)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(schema.lessonRequests.id, params.id));

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("[DELETE /api/requests/:id] Error:", error);
    return NextResponse.json(
      { error: "의뢰 취소 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
