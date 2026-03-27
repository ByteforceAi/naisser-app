import { NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

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

    const requests = await db
      .select()
      .from(schema.lessonRequests)
      .where(eq(schema.lessonRequests.instructorId, instructor.id))
      .orderBy(desc(schema.lessonRequests.createdAt));

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error("받은 의뢰 조회 실패:", error);
    return NextResponse.json(
      { error: "의뢰 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
