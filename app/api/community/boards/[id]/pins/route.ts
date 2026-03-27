import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { pinCreateSchema } from "@/lib/validations/boards";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/community/boards/[id]/pins — 보드의 핀 목록 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

  try {
    // 보드 존재 확인
    const [board] = await db
      .select()
      .from(schema.ideaBoards)
      .where(eq(schema.ideaBoards.id, id))
      .limit(1);

    if (!board) {
      return NextResponse.json(
        { error: "보드를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const pins = await db
      .select()
      .from(schema.ideaPins)
      .where(eq(schema.ideaPins.boardId, id))
      .orderBy(desc(schema.ideaPins.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.ideaPins)
      .where(eq(schema.ideaPins.boardId, id));

    const total = countResult?.count || 0;

    return NextResponse.json({
      data: pins,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("핀 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "핀 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/** POST /api/community/boards/[id]/pins — 새 핀 추가 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  const { id } = await context.params;

  // 보드 존재 확인
  const [board] = await db
    .select()
    .from(schema.ideaBoards)
    .where(eq(schema.ideaBoards.id, id))
    .limit(1);

  if (!board) {
    return NextResponse.json(
      { error: "보드를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  // 본인 보드에만 핀 추가 가능
  if (board.userId !== session.user.id) {
    return NextResponse.json(
      { error: "본인의 보드에만 핀을 추가할 수 있습니다." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = pinCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    const [newPin] = await db
      .insert(schema.ideaPins)
      .values({
        boardId: id,
        userId: session.user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        images: parsed.data.images ?? null,
        topic: parsed.data.topic ?? null,
        targetGrade: parsed.data.targetGrade ?? null,
        duration: parsed.data.duration ?? null,
        materials: parsed.data.materials ?? null,
        tips: parsed.data.tips ?? null,
        sourceUrl: parsed.data.sourceUrl ?? null,
      })
      .returning();

    // 보드 핀 카운트 업데이트
    await db
      .update(schema.ideaBoards)
      .set({
        pinCount: sql`${schema.ideaBoards.pinCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(schema.ideaBoards.id, id));

    return NextResponse.json({ data: newPin }, { status: 201 });
  } catch (error) {
    console.error("핀 추가 실패:", error);
    return NextResponse.json(
      { error: "핀 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
