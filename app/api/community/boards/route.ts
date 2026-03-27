import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { boardCreateSchema } from "@/lib/validations/boards";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

/** GET /api/community/boards — 공개 보드 목록 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "popular"; // popular | recent
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const userId = searchParams.get("userId"); // 특정 유저의 보드만

  try {
    const conditions = userId
      ? eq(schema.ideaBoards.userId, userId)
      : eq(schema.ideaBoards.isPublic, true);

    const orderBy =
      sort === "recent"
        ? desc(schema.ideaBoards.createdAt)
        : desc(schema.ideaBoards.pinCount);

    const boards = await db
      .select()
      .from(schema.ideaBoards)
      .where(conditions)
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.ideaBoards)
      .where(conditions);

    const total = countResult?.count || 0;

    return NextResponse.json({
      data: boards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("보드 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "보드 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/** POST /api/community/boards — 새 보드 생성 */
export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = boardCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    const [newBoard] = await db
      .insert(schema.ideaBoards)
      .values({
        userId: session.user.id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        coverImage: parsed.data.coverImage ?? null,
        isPublic: parsed.data.isPublic,
      })
      .returning();

    return NextResponse.json({ data: newBoard }, { status: 201 });
  } catch (error) {
    console.error("보드 생성 실패:", error);
    return NextResponse.json(
      { error: "보드 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
