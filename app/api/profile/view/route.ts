import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * POST /api/profile/view
 * body: { instructorId, eventType? }
 *
 * 프로필 조회/클릭 이벤트 기록
 * IP 기반 24시간 중복 방지 (view 타입만)
 */
export async function POST(req: NextRequest) {
  try {
    const { instructorId, eventType = "view", metadata } = await req.json();

    if (!instructorId) {
      return NextResponse.json({ error: "instructorId 필수" }, { status: 400 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";

    // view 타입만 24시간 중복 방지
    if (eventType === "view") {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existing = await db.query.profileEvents.findFirst({
        where: and(
          eq(schema.profileEvents.instructorId, instructorId),
          eq(schema.profileEvents.eventType, "view"),
          eq(schema.profileEvents.visitorIp, ip),
          gte(schema.profileEvents.createdAt, oneDayAgo)
        ),
        columns: { id: true },
      });

      if (existing) {
        return NextResponse.json({ data: { deduplicated: true } });
      }
    }

    // 이벤트 기록
    await db.insert(schema.profileEvents).values({
      instructorId,
      eventType,
      visitorIp: ip,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("[POST /api/profile/view] Error:", error);
    // 실패해도 사용자 경험에 영향 없음
    return NextResponse.json({ data: { success: true } });
  }
}
