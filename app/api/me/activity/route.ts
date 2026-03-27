import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { GRADE_INFO, getNextGradeInfo } from "@/lib/utils/community-score";
import type { GradeKey } from "@/lib/utils/community-score";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const userId = session.user.id;

    // 강사 프로필 조회
    const instructor = await db.query.instructors.findFirst({
      where: eq(schema.instructors.userId, userId),
      columns: { id: true },
    });

    // ── 이번 달 수업 통계 ──
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let lessonCount = 0;
    let schoolCount = 0;
    let studentCount = 0;

    if (instructor) {
      // 이번 달 accepted 수업 요청
      const lessons = await db
        .select({
          schoolName: schema.lessonRequests.schoolName,
          studentCount: schema.lessonRequests.studentCount,
        })
        .from(schema.lessonRequests)
        .where(
          and(
            eq(schema.lessonRequests.instructorId, instructor.id),
            eq(schema.lessonRequests.status, "accepted"),
            gte(schema.lessonRequests.createdAt, monthStart)
          )
        );

      lessonCount = lessons.length;
      const uniqueSchools = new Set(lessons.map((l) => l.schoolName));
      schoolCount = uniqueSchools.size;
      studentCount = lessons.reduce((sum, l) => sum + (l.studentCount || 0), 0);
    }

    // ── 연속 활동일 계산 ──
    // 게시글 + 댓글의 날짜를 합쳐서 연속일 계산
    const postsDateRows = await db
      .selectDistinct({
        day: sql<string>`TO_CHAR(${schema.communityPosts.createdAt}, 'YYYY-MM-DD')`,
      })
      .from(schema.communityPosts)
      .where(eq(schema.communityPosts.authorId, userId));

    const commentsDateRows = await db
      .selectDistinct({
        day: sql<string>`TO_CHAR(${schema.communityComments.createdAt}, 'YYYY-MM-DD')`,
      })
      .from(schema.communityComments)
      .where(eq(schema.communityComments.authorId, userId));

    const allDays = new Set<string>();
    for (const row of postsDateRows) if (row.day) allDays.add(row.day);
    for (const row of commentsDateRows) if (row.day) allDays.add(row.day);

    const streak = calculateStreak(allDays);

    // ── 이번 달 커뮤니티 활동 비율 (히트맵 바) ──
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const monthDays = new Set<string>();
    for (const day of allDays) {
      if (day >= formatDate(monthStart) && day <= formatDate(now)) {
        monthDays.add(day);
      }
    }
    const monthActivityRate = daysPassed > 0
      ? Math.round((monthDays.size / daysPassed) * 100)
      : 0;

    // ── 등급 정보 ──
    const scoreRow = await db.query.userCommunityScores.findFirst({
      where: eq(schema.userCommunityScores.userId, userId),
    });

    const score = scoreRow?.score ?? 0;
    const gradeKey = (scoreRow?.grade ?? "sprout") as GradeKey;
    const gradeInfo = GRADE_INFO[gradeKey] || GRADE_INFO.sprout;
    const nextInfo = getNextGradeInfo(score);

    return NextResponse.json({
      data: {
        // 이번 달 수업 통계
        monthlyStats: {
          lessonCount,
          schoolCount,
          studentCount,
        },
        // 연속 활동
        streak,
        // 이번 달 활동 히트맵
        monthActivity: {
          activeDays: monthDays.size,
          totalDays: daysInMonth,
          daysPassed,
          rate: monthActivityRate,
        },
        // 등급 정보
        grade: {
          key: gradeKey,
          emoji: gradeInfo.emoji,
          label: gradeInfo.label,
          color: gradeInfo.color,
          score,
          nextGrade: nextInfo.nextGrade
            ? {
                key: nextInfo.nextGrade,
                ...GRADE_INFO[nextInfo.nextGrade],
              }
            : null,
          remaining: nextInfo.remaining,
          progress: nextInfo.progress,
        },
      },
    });
  } catch (error) {
    console.error("활동 통계 조회 실패:", error);
    return NextResponse.json(
      { error: "활동 통계를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// ── 연속 활동일 계산 (오늘부터 역순) ──

function calculateStreak(days: Set<string>): number {
  if (days.size === 0) return 0;

  const today = new Date();
  let streak = 0;

  // 오늘 또는 어제부터 시작
  const todayStr = formatDate(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // 오늘 활동이 있으면 오늘부터, 없으면 어제부터 체크
  let checkDate: Date;
  if (days.has(todayStr)) {
    checkDate = new Date(today);
  } else if (days.has(yesterdayStr)) {
    checkDate = new Date(yesterday);
  } else {
    return 0;
  }

  while (days.has(formatDate(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
