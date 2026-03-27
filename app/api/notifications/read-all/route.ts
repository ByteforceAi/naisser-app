import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    await db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.notifications.userId, session.user.id),
          eq(schema.notifications.isRead, false)
        )
      );

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("전체 알림 읽음 처리 실패:", error);
    return NextResponse.json(
      { error: "전체 알림 읽음 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
