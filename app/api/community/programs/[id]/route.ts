import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { programUpdateSchema } from "@/lib/validations/programs";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/community/programs/[id] — 프로그램 상세 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  try {
    const [program] = await db
      .select()
      .from(schema.programs)
      .where(eq(schema.programs.id, id))
      .limit(1);

    if (!program) {
      return NextResponse.json(
        { error: "프로그램을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 후기 목록
    const reviews = await db
      .select()
      .from(schema.programReviews)
      .where(eq(schema.programReviews.programId, id))
      .orderBy(desc(schema.programReviews.createdAt));

    // 평균 별점 계산
    const [ratingResult] = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${schema.programReviews.rating}), 0)::numeric(2,1)`,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.programReviews)
      .where(eq(schema.programReviews.programId, id));

    return NextResponse.json({
      data: {
        ...program,
        reviews,
        averageRating: Number(ratingResult?.avg || 0),
        reviewCount: ratingResult?.count || 0,
      },
    });
  } catch (error) {
    console.error("프로그램 상세 조회 실패:", error);
    return NextResponse.json(
      { error: "프로그램 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/** PUT /api/community/programs/[id] — 프로그램 수정 (본인만) */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  const { id } = await context.params;

  const [program] = await db
    .select()
    .from(schema.programs)
    .where(eq(schema.programs.id, id))
    .limit(1);

  if (!program) {
    return NextResponse.json(
      { error: "프로그램을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  if (program.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "본인의 프로그램만 수정할 수 있습니다." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = programUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    const [updated] = await db
      .update(schema.programs)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(schema.programs.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("프로그램 수정 실패:", error);
    return NextResponse.json(
      { error: "프로그램 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
