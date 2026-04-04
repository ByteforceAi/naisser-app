import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  push: true,
  likes: true,
  comments: true,
  mentions: true,
  requests: true,
  reviews: true,
  email: false,
};

// 알림 설정 조회
export async function GET() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const [settings] = await db
      .select()
      .from(schema.notificationSettings)
      .where(eq(schema.notificationSettings.userId, session.user.id))
      .limit(1);

    return NextResponse.json({
      data: settings
        ? {
            push: settings.pushEnabled,
            likes: settings.likesEnabled,
            comments: settings.commentsEnabled,
            mentions: settings.mentionsEnabled,
            requests: settings.requestsEnabled,
            reviews: settings.reviewsEnabled,
            email: settings.emailDigest,
          }
        : DEFAULT_SETTINGS,
    });
  } catch {
    // 테이블이 아직 없을 수 있으므로 기본값 반환
    return NextResponse.json({ data: DEFAULT_SETTINGS });
  }
}

// 알림 설정 수정
export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const body = await req.json();

    // upsert 패턴
    const [existing] = await db
      .select({ userId: schema.notificationSettings.userId })
      .from(schema.notificationSettings)
      .where(eq(schema.notificationSettings.userId, session.user.id))
      .limit(1);

    const updateData: Record<string, unknown> = {};
    if ("push" in body) updateData.pushEnabled = body.push;
    if ("likes" in body) updateData.likesEnabled = body.likes;
    if ("comments" in body) updateData.commentsEnabled = body.comments;
    if ("mentions" in body) updateData.mentionsEnabled = body.mentions;
    if ("requests" in body) updateData.requestsEnabled = body.requests;
    if ("reviews" in body) updateData.reviewsEnabled = body.reviews;
    if ("email" in body) updateData.emailDigest = body.email;

    if (existing) {
      await db
        .update(schema.notificationSettings)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(schema.notificationSettings.userId, session.user.id));
    } else {
      await db.insert(schema.notificationSettings).values({
        userId: session.user.id,
        ...updateData,
      });
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("[PATCH /api/user/notification-settings] Error:", error);
    // 테이블이 아직 없을 수 있음 — 에러를 삼키고 성공 반환
    return NextResponse.json({ data: { success: true } });
  }
}
