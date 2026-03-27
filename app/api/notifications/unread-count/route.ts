import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.notifications)
      .where(
        and(
          eq(schema.notifications.userId, session.user.id),
          eq(schema.notifications.isRead, false)
        )
      );

    return NextResponse.json({ data: { count: Number(result?.count ?? 0) } });
  } catch (error) {
    console.error("미읽음 알림 수 조회 실패:", error);
    return NextResponse.json(
      { error: "미읽음 알림 수 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
