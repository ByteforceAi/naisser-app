import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { boardUpdateSchema } from "@/lib/validations/boards";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/community/boards/[id] — 보드 상세 + 핀 목록 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  try {
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

    // 공개 보드가 아니면 본인만 접근 가능
    if (!board.isPublic) {
      const session = await requireAuth();
      if (isErrorResponse(session)) return session;
      if (session.user.id !== board.userId) {
        return NextResponse.json(
          { error: "비공개 보드입니다." },
          { status: 403 }
        );
      }
    }

    const pins = await db
      .select()
      .from(schema.ideaPins)
      .where(eq(schema.ideaPins.boardId, id))
      .orderBy(desc(schema.ideaPins.createdAt));

    return NextResponse.json({ data: { ...board, pins } });
  } catch (error) {
    console.error("보드 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "보드 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/** PUT /api/community/boards/[id] — 보드 수정 (본인만) */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  const { id } = await context.params;

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

  if (board.userId !== session.user.id) {
    return NextResponse.json(
      { error: "본인의 보드만 수정할 수 있습니다." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = boardUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    const [updated] = await db
      .update(schema.ideaBoards)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(schema.ideaBoards.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("보드 수정 실패:", error);
    return NextResponse.json(
      { error: "보드 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/** DELETE /api/community/boards/[id] — 보드 삭제 (본인만) */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  const { id } = await context.params;

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

  if (board.userId !== session.user.id) {
    return NextResponse.json(
      { error: "본인의 보드만 삭제할 수 있습니다." },
      { status: 403 }
    );
  }

  try {
    await db
      .delete(schema.ideaBoards)
      .where(eq(schema.ideaBoards.id, id));

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("보드 삭제 실패:", error);
    return NextResponse.json(
      { error: "보드 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
