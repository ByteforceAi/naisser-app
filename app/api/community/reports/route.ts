import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/**
 * POST /api/community/reports
 * body: { postId, reason, detail? }
 *
 * 게시글 신고 접수 → audit_logs에 기록 + 어드민 알림
 */
export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const { postId, reason, detail } = await req.json();

    if (!postId || !reason) {
      return NextResponse.json({ error: "postId와 reason은 필수입니다." }, { status: 400 });
    }

    // audit_logs에 신고 기록
    await db.insert(schema.auditLogs).values({
      action: "community_report",
      adminId: session.user.id,
      targetType: "post",
      targetId: postId,
      detail: JSON.stringify({ reason, detail: detail || "" }),
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("[POST /api/community/reports] Error:", error);
    return NextResponse.json({ error: "신고 접수 중 오류가 발생했습니다." }, { status: 500 });
  }
}
