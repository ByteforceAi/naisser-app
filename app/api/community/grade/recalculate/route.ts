import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { recalculateScore } from "@/lib/utils/community-score";

export async function POST(request: NextRequest) {
  const adminResult = await requireAdmin();
  if (isErrorResponse(adminResult)) return adminResult;

  try {
    const body = await request.json().catch(() => ({}));
    const targetUserId = body.userId as string | undefined;

    if (targetUserId) {
      // 특정 유저 재계산
      const result = await recalculateScore(targetUserId);
      return NextResponse.json({
        data: {
          userId: targetUserId,
          ...result,
          message: "점수가 재계산되었습니다.",
        },
      });
    }

    // 전체 유저 재계산
    // 커뮤니티 활동이 있는 모든 유저 ID 수집
    const postAuthors = await db
      .selectDistinct({ userId: schema.communityPosts.authorId })
      .from(schema.communityPosts);

    const commentAuthors = await db
      .selectDistinct({ userId: schema.communityComments.authorId })
      .from(schema.communityComments);

    const allUserIds = new Set<string>();
    for (const row of postAuthors) allUserIds.add(row.userId);
    for (const row of commentAuthors) allUserIds.add(row.userId);

    let processed = 0;
    const errors: string[] = [];

    for (const userId of allUserIds) {
      try {
        await recalculateScore(userId);
        processed++;
      } catch (err) {
        errors.push(userId);
        console.error(`유저 ${userId} 점수 재계산 실패:`, err);
      }
    }

    return NextResponse.json({
      data: {
        totalUsers: allUserIds.size,
        processed,
        errors: errors.length,
        errorUserIds: errors.length > 0 ? errors : undefined,
        message: `${processed}명의 점수가 재계산되었습니다.`,
      },
    });
  } catch (error) {
    console.error("점수 재계산 실패:", error);
    return NextResponse.json(
      { error: "점수 재계산 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
