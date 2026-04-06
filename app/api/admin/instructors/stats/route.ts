import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAdminToken } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authError = requireAdminToken(req);
  if (authError) return authError;

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const [instructors, teachers, weeklyNew, statusBreakdown] = await Promise.all([
      sql`SELECT COUNT(*)::int as cnt FROM instructors`,
      sql`SELECT COUNT(*)::int as cnt FROM teachers`,
      sql`SELECT COUNT(*)::int as cnt FROM instructors WHERE created_at >= NOW() - INTERVAL '7 days'`,
      sql`SELECT status, COUNT(*)::int as cnt FROM instructors GROUP BY status`,
    ]);

    const breakdown: Record<string, number> = {};
    statusBreakdown.forEach((row) => {
      breakdown[row.status || "unknown"] = row.cnt;
    });

    return NextResponse.json({
      data: {
        totalInstructors: instructors[0].cnt,
        totalTeachers: teachers[0].cnt,
        weeklyNew: weeklyNew[0].cnt,
        statusBreakdown: breakdown,
        weeklyTrend: [],
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "통계를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
