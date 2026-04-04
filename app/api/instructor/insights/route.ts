import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gte, lt, sql, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/instructor/insights?month=2026-03
 *
 * 강사 프로필 인사이트 데이터
 * - 이번 달 이벤트 집계 (view, share, cta_click, sns_click, phone_click, kakao_share, favorite)
 * - 전월 대비 변화율
 */
export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    // 현재 강사 ID 찾기
    const [instructor] = await db
      .select({ id: schema.instructors.id })
      .from(schema.instructors)
      .where(eq(schema.instructors.userId, session.user.id))
      .limit(1);

    if (!instructor) {
      return NextResponse.json({ error: "강사 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get("month"); // "2026-03" 형식

    // 이번 달 범위 계산
    const now = new Date();
    let thisMonthStart: Date;
    let thisMonthEnd: Date;

    if (monthStr) {
      const [y, m] = monthStr.split("-").map(Number);
      thisMonthStart = new Date(y, m - 1, 1);
      thisMonthEnd = new Date(y, m, 1);
    } else {
      thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // 전월 범위
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(thisMonthStart);

    // 이번 달 이벤트 집계
    const thisMonthData = await db
      .select({
        eventType: schema.profileEvents.eventType,
        count: count(),
      })
      .from(schema.profileEvents)
      .where(
        and(
          eq(schema.profileEvents.instructorId, instructor.id),
          gte(schema.profileEvents.createdAt, thisMonthStart),
          lt(schema.profileEvents.createdAt, thisMonthEnd)
        )
      )
      .groupBy(schema.profileEvents.eventType);

    // 전월 이벤트 집계
    const lastMonthData = await db
      .select({
        eventType: schema.profileEvents.eventType,
        count: count(),
      })
      .from(schema.profileEvents)
      .where(
        and(
          eq(schema.profileEvents.instructorId, instructor.id),
          gte(schema.profileEvents.createdAt, lastMonthStart),
          lt(schema.profileEvents.createdAt, lastMonthEnd)
        )
      )
      .groupBy(schema.profileEvents.eventType);

    // 집계 변환
    const thisMonth: Record<string, number> = {};
    for (const row of thisMonthData) {
      thisMonth[row.eventType] = Number(row.count);
    }

    const lastMonth: Record<string, number> = {};
    for (const row of lastMonthData) {
      lastMonth[row.eventType] = Number(row.count);
    }

    // 변화율 계산 헬퍼
    function calcChange(current: number, previous: number) {
      if (previous === 0) return current > 0 ? { diff: current, percent: null, isNew: true } : { diff: 0, percent: 0, isNew: false };
      const diff = current - previous;
      const percent = Math.round((diff / previous) * 100);
      return { diff, percent, isNew: false };
    }

    const EVENT_TYPES = ["view", "share", "cta_click", "sns_click", "phone_click", "kakao_share", "favorite"];
    const insights: Record<string, { count: number; diff: number; percent: number | null; isNew: boolean }> = {};

    for (const type of EVENT_TYPES) {
      const current = thisMonth[type] || 0;
      const previous = lastMonth[type] || 0;
      insights[type] = { count: current, ...calcChange(current, previous) };
    }

    return NextResponse.json({
      data: {
        month: thisMonthStart.toISOString().slice(0, 7),
        insights,
        summary: {
          totalViews: thisMonth["view"] || 0,
          totalCTA: (thisMonth["cta_click"] || 0) + (thisMonth["phone_click"] || 0),
          totalShares: (thisMonth["share"] || 0) + (thisMonth["kakao_share"] || 0),
          totalFavorites: thisMonth["favorite"] || 0,
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/instructor/insights] Error:", error);
    return NextResponse.json({ error: "인사이트 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
