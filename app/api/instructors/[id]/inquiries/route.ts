import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * POST /api/instructors/[id]/inquiries
 * 수업 문의 제출 (비로그인도 가능하지만, 이름+연락처 필수)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { senderName, senderPhone, senderEmail, schoolName, message } = body;

    if (!senderName?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "이름과 문의 내용은 필수입니다." },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "문의 내용은 1000자 이내로 작성해주세요." },
        { status: 400 }
      );
    }

    // 강사 존재 확인
    const [instructor] = await db
      .select({ id: schema.instructors.id })
      .from(schema.instructors)
      .where(eq(schema.instructors.id, params.id))
      .limit(1);

    if (!instructor) {
      return NextResponse.json({ error: "강사를 찾을 수 없습니다." }, { status: 404 });
    }

    const [inquiry] = await db
      .insert(schema.inquiries)
      .values({
        instructorId: params.id,
        senderName: senderName.trim(),
        senderPhone: senderPhone?.trim() || null,
        senderEmail: senderEmail?.trim() || null,
        schoolName: schoolName?.trim() || null,
        message: message.trim(),
        status: "new",
      })
      .returning();

    // 이벤트 기록
    await db.insert(schema.profileEvents).values({
      instructorId: params.id,
      eventType: "cta_click",
      metadata: JSON.stringify({ channel: "inquiry_form" }),
    });

    return NextResponse.json({ data: inquiry }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/instructors/:id/inquiries] Error:", error);
    return NextResponse.json(
      { error: "문의 제출 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/instructors/[id]/inquiries
 * 강사 본인만 받은 문의 목록 조회
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getOptionalSession();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    // 본인 확인
    const [instructor] = await db
      .select({ id: schema.instructors.id, userId: schema.instructors.userId })
      .from(schema.instructors)
      .where(eq(schema.instructors.id, params.id))
      .limit(1);

    if (!instructor || instructor.userId !== session.user.id) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const inquiries = await db
      .select()
      .from(schema.inquiries)
      .where(eq(schema.inquiries.instructorId, params.id))
      .orderBy(desc(schema.inquiries.createdAt))
      .limit(50);

    return NextResponse.json({ data: inquiries });
  } catch (error) {
    console.error("[GET /api/instructors/:id/inquiries] Error:", error);
    return NextResponse.json({ error: "문의 목록 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
