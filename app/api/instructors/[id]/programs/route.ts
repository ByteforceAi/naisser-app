import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/instructors/[id]/programs
 * 강사의 수업 프로그램 목록 (공개)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // instructors.userId로 programs.authorId를 매칭
    const [instructor] = await db
      .select({ userId: schema.instructors.userId })
      .from(schema.instructors)
      .where(eq(schema.instructors.id, params.id))
      .limit(1);

    if (!instructor?.userId) {
      return NextResponse.json({ data: [] });
    }

    const programs = await db
      .select()
      .from(schema.programs)
      .where(
        and(
          eq(schema.programs.authorId, instructor.userId),
          eq(schema.programs.status, "active")
        )
      )
      .orderBy(desc(schema.programs.createdAt))
      .limit(5);

    return NextResponse.json({ data: programs });
  } catch (error) {
    console.error("[GET /api/instructors/:id/programs] Error:", error);
    return NextResponse.json({ data: [] });
  }
}
