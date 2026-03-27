import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

/** POST /api/community/programs/[id]/upvote — 업보트 토글 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  const { id: programId } = await context.params;

  // 프로그램 존재 확인
  const [program] = await db
    .select()
    .from(schema.programs)
    .where(eq(schema.programs.id, programId))
    .limit(1);

  if (!program) {
    return NextResponse.json(
      { error: "프로그램을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  try {
    // 이미 업보트했는지 확인
    const [existing] = await db
      .select()
      .from(schema.programUpvotes)
      .where(
        and(
          eq(schema.programUpvotes.programId, programId),
          eq(schema.programUpvotes.userId, session.user.id)
        )
      )
      .limit(1);

    if (existing) {
      // 이미 업보트 → 취소
      await db
        .delete(schema.programUpvotes)
        .where(eq(schema.programUpvotes.id, existing.id));

      await db
        .update(schema.programs)
        .set({
          upvoteCount: sql`GREATEST(${schema.programs.upvoteCount} - 1, 0)`,
        })
        .where(eq(schema.programs.id, programId));

      return NextResponse.json({ data: { upvoted: false } });
    }

    // 업보트
    await db.insert(schema.programUpvotes).values({
      programId,
      userId: session.user.id,
    });

    await db
      .update(schema.programs)
      .set({
        upvoteCount: sql`${schema.programs.upvoteCount} + 1`,
      })
      .where(eq(schema.programs.id, programId));

    return NextResponse.json({ data: { upvoted: true } }, { status: 201 });
  } catch (error) {
    console.error("업보트 토글 실패:", error);
    return NextResponse.json(
      { error: "업보트 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
