import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { programCreateSchema } from "@/lib/validations/programs";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

/** GET /api/community/programs — 프로그램 목록 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "popular"; // popular | recent
  const topic = searchParams.get("topic");
  const priceType = searchParams.get("priceType"); // free | paid
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

  try {
    const conditions = [eq(schema.programs.status, "active")];
    if (topic) conditions.push(eq(schema.programs.topic, topic));
    if (priceType) conditions.push(eq(schema.programs.priceType, priceType));

    const where = conditions.length === 1 ? conditions[0] : and(...conditions);

    const orderBy =
      sort === "recent"
        ? desc(schema.programs.createdAt)
        : desc(schema.programs.upvoteCount);

    const programList = await db
      .select()
      .from(schema.programs)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.programs)
      .where(where);

    const total = countResult?.count || 0;

    return NextResponse.json({
      data: programList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("프로그램 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "프로그램 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/** POST /api/community/programs — 프로그램 등록 */
export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = programCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    const [newProgram] = await db
      .insert(schema.programs)
      .values({
        authorId: session.user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        topic: parsed.data.topic ?? null,
        targetGrade: parsed.data.targetGrade ?? null,
        duration: parsed.data.duration ?? null,
        maxStudents: parsed.data.maxStudents ?? null,
        materialsCost: parsed.data.materialsCost ?? null,
        includes: parsed.data.includes ?? null,
        images: parsed.data.images ?? null,
        price: parsed.data.price,
        priceType: parsed.data.priceType,
        downloadUrl: parsed.data.downloadUrl ?? null,
      })
      .returning();

    return NextResponse.json({ data: newProgram }, { status: 201 });
  } catch (error) {
    console.error("프로그램 등록 실패:", error);
    return NextResponse.json(
      { error: "프로그램 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
