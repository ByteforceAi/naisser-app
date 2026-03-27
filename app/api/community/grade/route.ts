import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  GRADE_INFO,
  getNextGradeInfo,
} from "@/lib/utils/community-score";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const userId = session.user.id;

    let scoreRow = await db.query.userCommunityScores.findFirst({
      where: eq(schema.userCommunityScores.userId, userId),
    });

    // 레코드가 없으면 기본값 반환
    if (!scoreRow) {
      scoreRow = {
        userId,
        score: 0,
        postCount: 0,
        commentCount: 0,
        receivedLikes: 0,
        receivedHelpfuls: 0,
        schoolReviewCount: 0,
        grade: "sprout",
        updatedAt: null,
      };
    }

    const gradeKey = scoreRow.grade as keyof typeof GRADE_INFO;
    const gradeInfo = GRADE_INFO[gradeKey] || GRADE_INFO.sprout;
    const nextInfo = getNextGradeInfo(scoreRow.score);

    return NextResponse.json({
      data: {
        score: scoreRow.score,
        grade: scoreRow.grade,
        gradeEmoji: gradeInfo.emoji,
        gradeLabel: gradeInfo.label,
        gradeColor: gradeInfo.color,
        nextGrade: nextInfo.nextGrade
          ? {
              key: nextInfo.nextGrade,
              ...GRADE_INFO[nextInfo.nextGrade],
            }
          : null,
        remaining: nextInfo.remaining,
        progress: nextInfo.progress,
        breakdown: {
          postCount: scoreRow.postCount,
          commentCount: scoreRow.commentCount,
          receivedLikes: scoreRow.receivedLikes,
          receivedHelpfuls: scoreRow.receivedHelpfuls,
          schoolReviewCount: scoreRow.schoolReviewCount,
        },
      },
    });
  } catch (error) {
    console.error("등급 조회 실패:", error);
    return NextResponse.json(
      { error: "등급 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
