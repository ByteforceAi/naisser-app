/**
 * 포트폴리오 항목 삭제 API
 * DELETE: 특정 포트폴리오 항목 삭제
 */

import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  void _req;
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  try {
    const [inst] = await db
      .select({ id: instructors.id, portfolio: sql<string>`portfolio` })
      .from(instructors)
      .where(eq(instructors.userId, session.user.id))
      .limit(1);

    if (!inst) {
      return NextResponse.json({ error: "강사 프로필이 없습니다." }, { status: 404 });
    }

    let items = [];
    try {
      const parsed = typeof inst.portfolio === "string"
        ? JSON.parse(inst.portfolio)
        : inst.portfolio;
      items = parsed?.items || [];
    } catch {
      items = [];
    }

    const filtered = items.filter(
      (item: { id: string }) => item.id !== params.itemId
    );

    if (filtered.length === items.length) {
      return NextResponse.json({ error: "항목을 찾을 수 없습니다." }, { status: 404 });
    }

    await db
      .update(instructors)
      .set({ portfolio: JSON.stringify({ items: filtered }) } as Record<string, unknown>)
      .where(eq(instructors.id, inst.id));

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[DELETE /api/instructors/me/portfolio/[itemId]]", error);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }
}
