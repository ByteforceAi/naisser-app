/**
 * 출강확인 API — 교사가 출강 기록을 확인
 * PATCH: status → confirmed
 */

import { NextRequest, NextResponse } from "next/server";
import { requireTeacher, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { teachingRecords } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  void _req;
  const session = await requireTeacher();
  if (isErrorResponse(session)) return session;

  try {
    // 기록 조회
    const [record] = await db
      .select()
      .from(teachingRecords)
      .where(eq(teachingRecords.id, params.id))
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: "출강 기록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (record.status === "confirmed") {
      return NextResponse.json(
        { error: "이미 확인된 출강 기록입니다." },
        { status: 409 }
      );
    }

    // 문서번호 자동 채번
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    const documentNumber = `NSSR-${dateStr}-${seq}`;

    const [updated] = await db
      .update(teachingRecords)
      .set({
        status: "confirmed",
        confirmedAt: today,
        confirmedBy: session.user.id,
        documentNumber,
        updatedAt: today,
      })
      .where(eq(teachingRecords.id, params.id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/teaching-records/[id]/confirm]", error);
    return NextResponse.json(
      { error: "출강확인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
