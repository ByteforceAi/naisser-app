import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const notifications = await db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, session.user.id))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(50);

    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error("알림 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "알림 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
