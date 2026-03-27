import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { teacherCreateSchema } from "@/lib/validations/teacher";
import { rateLimitStrict } from "@/lib/utils/rate-limit";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimited = await rateLimitStrict(ip);
  if (rateLimited) return rateLimited;

  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = teacherCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    // 1. 이미 교사로 등록되어 있는지 확인
    const existing = await db.query.teachers.findFirst({
      where: eq(schema.teachers.userId, session.user.id),
      columns: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "이미 교사로 등록되어 있습니다." },
        { status: 409 }
      );
    }

    // 2. 교사 등록
    const id = crypto.randomUUID();
    await db.insert(schema.teachers).values({
      id,
      userId: session.user.id,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      naisNumber: data.naisNumber || null,
      schoolName: data.schoolName,
      schoolCode: data.schoolCode || null,
      educationOffice: data.educationOffice || null,
      region: data.region || null,
      interestedTopics: data.interestedTopics || [],
    });

    // 3. 사용자 역할을 teacher로 변경
    await db
      .update(schema.users)
      .set({ role: "teacher", updatedAt: new Date() })
      .where(eq(schema.users.id, session.user.id));

    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/teachers] Error:", error);
    return NextResponse.json(
      { error: "등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
