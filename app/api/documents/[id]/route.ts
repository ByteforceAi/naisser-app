/**
 * 서류 개별 API
 * DELETE: 서류 삭제 (Vercel Blob + DB)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { documents, instructors } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  void _req;
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  try {
    // 강사 프로필 확인
    const [instructor] = await db
      .select({ id: instructors.id })
      .from(instructors)
      .where(eq(instructors.userId, session.user.id))
      .limit(1);

    if (!instructor) {
      return NextResponse.json(
        { error: "강사 프로필이 없습니다." },
        { status: 404 }
      );
    }

    // 서류 조회 (본인 것만)
    const [doc] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, params.id),
          eq(documents.instructorId, instructor.id)
        )
      )
      .limit(1);

    if (!doc) {
      return NextResponse.json(
        { error: "서류를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Vercel Blob 삭제
    try {
      await del(doc.fileUrl);
    } catch {
      // Blob 삭제 실패해도 DB는 정리
      console.warn("[DELETE /api/documents] Blob delete failed:", doc.fileUrl);
    }

    // DB 삭제
    await db.delete(documents).where(eq(documents.id, params.id));

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[DELETE /api/documents/[id]]", error);
    return NextResponse.json(
      { error: "서류 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
