import { NextResponse } from "next/server";
import { requireTeacher, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireTeacher();
  if (isErrorResponse(session)) return session;

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

    const requests = await db
      .select()
      .from(schema.lessonRequests)
      .where(eq(schema.lessonRequests.teacherId, teacher.id))
      .orderBy(desc(schema.lessonRequests.createdAt));

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error("보낸 의뢰 조회 실패:", error);
    return NextResponse.json(
      { error: "의뢰 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
