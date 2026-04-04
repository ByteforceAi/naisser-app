import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse, getOptionalSession } from "@/lib/auth/middleware";
import { rateLimitGeneral } from "@/lib/utils/rate-limit";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { maskInstructorProfile } from "@/lib/utils/masking";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimited = await rateLimitGeneral(ip);
  if (rateLimited) return rateLimited;

  try {
    const session = await getOptionalSession();

    // ID 또는 userId로 조회
    const [instructor] = await db
      .select()
      .from(schema.instructors)
      .where(eq(schema.instructors.id, params.id))
      .limit(1);

    // ID로 못 찾으면 userId로 재시도
    if (!instructor) {
      const [byUserId] = await db
        .select()
        .from(schema.instructors)
        .where(eq(schema.instructors.userId, params.id))
        .limit(1);

      if (!byUserId) {
        return NextResponse.json(
          { data: null, error: "강사를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: maskInstructorProfile(byUserId, session),
      });
    }

    return NextResponse.json({
      data: maskInstructorProfile(instructor, session),
    });
  } catch (error) {
    console.error("[GET /api/instructors/:id] Error:", error);
    return NextResponse.json(
      { error: "강사 정보 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const body = await request.json();

    // 본인 또는 관리자만 수정 가능
    const [instructor] = await db
      .select()
      .from(schema.instructors)
      .where(eq(schema.instructors.id, params.id))
      .limit(1);

    if (!instructor) {
      return NextResponse.json(
        { error: "강사를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (instructor.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "수정 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 허용된 필드만 업데이트
    const allowedFields = [
      "instructorName", "bio", "lectureContent", "career",
      "topics", "methods", "regions", "targetGrades",
      "snsAccounts", "profileImage", "phone", "email",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) updateData[key] = body[key];
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "수정할 내용이 없습니다." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(schema.instructors)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.instructors.id, params.id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PUT /api/instructors/:id] Error:", error);
    return NextResponse.json(
      { error: "강사 정보 수정 중 오류가 발생했습니다." },
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

  // 관리자만 삭제 가능
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "관리자만 삭제할 수 있습니다." },
      { status: 403 }
    );
  }

  try {
    await db
      .delete(schema.instructors)
      .where(eq(schema.instructors.id, params.id));

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("[DELETE /api/instructors/:id] Error:", error);
    return NextResponse.json(
      { error: "강사 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
