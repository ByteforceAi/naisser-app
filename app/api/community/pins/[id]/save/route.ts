import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { pinSaveSchema } from "@/lib/validations/boards";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

/** POST /api/community/pins/[id]/save — 핀을 내 보드에 저장 (토글) */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  const { id: pinId } = await context.params;

  const body = await request.json();
  const parsed = pinSaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  const { boardId } = parsed.data;

  // 핀 존재 확인
  const [pin] = await db
    .select()
    .from(schema.ideaPins)
    .where(eq(schema.ideaPins.id, pinId))
    .limit(1);

  if (!pin) {
    return NextResponse.json(
      { error: "핀을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  // 보드가 본인 것인지 확인
  const [board] = await db
    .select()
    .from(schema.ideaBoards)
    .where(eq(schema.ideaBoards.id, boardId))
    .limit(1);

  if (!board || board.userId !== session.user.id) {
    return NextResponse.json(
      { error: "본인의 보드에만 저장할 수 있습니다." },
      { status: 403 }
    );
  }

  try {
    // 이미 저장했는지 확인
    const [existing] = await db
      .select()
      .from(schema.ideaPinSaves)
      .where(
        and(
          eq(schema.ideaPinSaves.pinId, pinId),
          eq(schema.ideaPinSaves.userId, session.user.id),
          eq(schema.ideaPinSaves.boardId, boardId)
        )
      )
      .limit(1);

    if (existing) {
      // 이미 저장됨 → 저장 취소
      await db
        .delete(schema.ideaPinSaves)
        .where(eq(schema.ideaPinSaves.id, existing.id));

      // 저장 카운트 감소
      await db
        .update(schema.ideaPins)
        .set({ savedCount: sql`GREATEST(${schema.ideaPins.savedCount} - 1, 0)` })
        .where(eq(schema.ideaPins.id, pinId));

      return NextResponse.json({ data: { saved: false } });
    }

    // 저장
    await db.insert(schema.ideaPinSaves).values({
      pinId,
      userId: session.user.id,
      boardId,
    });

    // 저장 카운트 증가
    await db
      .update(schema.ideaPins)
      .set({ savedCount: sql`${schema.ideaPins.savedCount} + 1` })
      .where(eq(schema.ideaPins.id, pinId));

    return NextResponse.json({ data: { saved: true } }, { status: 201 });
  } catch (error) {
    console.error("핀 저장 토글 실패:", error);
    return NextResponse.json(
      { error: "핀 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
