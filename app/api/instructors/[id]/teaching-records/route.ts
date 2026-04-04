import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/instructors/[id]/teaching-records
 * 강사 출강이력 공개 조회 (confirmed 상태만)
 *
 * 비로그인: 총 횟수 + 평점만 (학교명 비공개)
 * 로그인 교사: 학교명 포함 전체 공개
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getOptionalSession();
    const isLoggedIn = !!session?.user;

    const records = await db
      .select({
        id: schema.teachingRecords.id,
        schoolName: schema.teachingRecords.schoolName,
        date: schema.teachingRecords.date,
        subject: schema.teachingRecords.subject,
        hours: schema.teachingRecords.hours,
        status: schema.teachingRecords.status,
      })
      .from(schema.teachingRecords)
      .where(
        and(
          eq(schema.teachingRecords.instructorId, params.id),
          eq(schema.teachingRecords.status, "confirmed")
        )
      )
      .orderBy(desc(schema.teachingRecords.date))
      .limit(20);

    // 비로그인 시 학교명 마스킹
    const masked = records.map((r) => ({
      ...r,
      schoolName: isLoggedIn ? r.schoolName : "***학교",
    }));

    return NextResponse.json({
      data: masked,
      stats: {
        totalRecords: records.length,
        totalHours: records.reduce(
          (sum, r) => sum + (parseFloat(r.hours || "0") || 0),
          0
        ),
      },
    });
  } catch (error) {
    console.error("[GET /api/instructors/:id/teaching-records] Error:", error);
    return NextResponse.json({ data: [], stats: { totalRecords: 0, totalHours: 0 } });
  }
}
