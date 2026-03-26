import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // TODO: requireAdmin check
  // TODO: Drizzle aggregate queries
  return NextResponse.json({
    data: {
      totalInstructors: 127,
      totalTeachers: 89,
      weeklyNew: 15,
      statusBreakdown: {
        new: 45,
        contacted: 20,
        active: 50,
        inactive: 12,
      },
      weeklyTrend: [],
    },
  });
}
