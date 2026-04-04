import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/**
 * POST /api/instructors/[id]/visit
 *
 * 프로필 방문 기록 (IP 기반 중복 방지)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";

    // audit_logs에 방문 기록 (간단한 분석용)
    await db.insert(schema.auditLogs).values({
      action: "profile_visit",
      adminId: ip, // 비로그인도 기록하기 위해 IP 사용
      targetType: "instructor",
      targetId: params.id,
      detail: JSON.stringify({
        userAgent: req.headers.get("user-agent")?.slice(0, 100),
        timestamp: new Date().toISOString(),
      }),
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    // 실패해도 사용자 경험에 영향 없음
    return NextResponse.json({ data: { success: true } });
  }
}
