import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const [updated] = await db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.notifications.id, params.id),
          eq(schema.notifications.userId, session.user.id)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "해당 알림을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { id: updated.id, isRead: true } });
  } catch (error) {
    console.error("알림 읽음 처리 실패:", error);
    return NextResponse.json(
      { error: "알림 읽음 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
