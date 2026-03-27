import { NextRequest, NextResponse } from "next/server";
import { requireTeacher, isErrorResponse } from "@/lib/auth/middleware";
import { lessonRequestSchema } from "@/lib/validations/request";
import { rateLimitStrict } from "@/lib/utils/rate-limit";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimited = await rateLimitStrict(ip);
  if (rateLimited) return rateLimited;

  const session = await requireTeacher();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = lessonRequestSchema.safeParse(body);
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
      .where(eq(schema.instructors.id, parsed.data.instructorId));

    if (!instructor) {
      return NextResponse.json(
        { error: "해당 강사를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 의뢰 생성
    const [newRequest] = await db
      .insert(schema.lessonRequests)
      .values({
        teacherId: teacher.id,
        instructorId: parsed.data.instructorId,
        preferredDates: parsed.data.preferredDates,
        topic: parsed.data.topic,
        method: parsed.data.method ?? null,
        studentCount: parsed.data.studentCount,
        targetGrade: parsed.data.targetGrade,
        schoolName: teacher.schoolName,
        message: parsed.data.message ?? null,
        status: "pending",
      })
      .returning();

    // 강사에게 알림 생성
    if (instructor.userId) {
      await db.insert(schema.notifications).values({
        userId: instructor.userId,
        type: "request_new",
        referenceId: newRequest.id,
        title: "새로운 수업 의뢰",
        body: `${teacher.name} 선생님(${teacher.schoolName})이 수업을 의뢰했습니다.`,
      });
    }

    return NextResponse.json({ data: { id: newRequest.id } }, { status: 201 });
  } catch (error) {
    console.error("의뢰 생성 실패:", error);
    return NextResponse.json(
      { error: "의뢰 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
