import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/instructors/[id]/portfolio
 * 강사 포트폴리오 공개 조회
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // portfolio는 JSON string으로 저장됨 (스키마에 미정의, raw SQL로 조회)
    const [result] = await db
      .select({
        portfolio: sql<string>`${instructors.id}`.as("portfolio"),
      })
      .from(instructors)
      .where(eq(instructors.id, params.id))
      .limit(1);

    // 실제로는 portfolio 컬럼을 직접 읽어야 함
    const rawResult = await db.execute(
      sql`SELECT portfolio FROM instructors WHERE id = ${params.id} LIMIT 1`
    );
    const rows = (rawResult as unknown as Record<string, unknown>[]);
    const raw = rows?.[0];

    if (!raw?.portfolio) {
      return NextResponse.json({ data: { items: [] } });
    }

    try {
      const parsed = JSON.parse(raw.portfolio as string);
      return NextResponse.json({ data: parsed });
    } catch {
      return NextResponse.json({ data: { items: [] } });
    }
  } catch (error) {
    console.error("[GET /api/instructors/:id/portfolio] Error:", error);
    return NextResponse.json({ data: { items: [] } });
  }
}
