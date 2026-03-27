/**
 * 커뮤니티 등급 시스템 — 네이버카페 타마고치 스타일
 *
 * 점수 기준:
 *  - 글 작성: +5점
 *  - 댓글 작성: +2점
 *  - 받은 좋아요: +1점
 *  - 받은 도움됐어요: +3점
 *  - 학교 리뷰 작성: +10점
 *
 * 등급:
 *  🌱 새싹 (0~9점)
 *  🌿 활동 (10~49점)
 *  🌳 베테랑 (50~149점)
 *  ⭐ 멘토 (150점+)
 */

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// ── 등급 타입 ──

export type GradeKey = "sprout" | "active" | "veteran" | "mentor";

export interface GradeInfo {
  emoji: string;
  label: string;
  color: string;
  minScore: number;
}

// ── 등급 정보 ──

export const GRADE_INFO: Record<GradeKey, GradeInfo> = {
  sprout: { emoji: "🌱", label: "새싹", color: "#22C55E", minScore: 0 },
  active: { emoji: "🌿", label: "활동", color: "#10B981", minScore: 10 },
  veteran: { emoji: "🌳", label: "베테랑", color: "#059669", minScore: 50 },
  mentor: { emoji: "⭐", label: "멘토", color: "#F59E0B", minScore: 150 },
};

// 등급 순서 (다음 등급 계산용)
const GRADE_ORDER: GradeKey[] = ["sprout", "active", "veteran", "mentor"];

// ── 점수 → 등급 계산 ──

export function calculateGrade(score: number): GradeKey {
  if (score >= 150) return "mentor";
  if (score >= 50) return "veteran";
  if (score >= 10) return "active";
  return "sprout";
}

// ── 다음 등급까지 남은 점수 ──

export function getNextGradeInfo(score: number): {
  currentGrade: GradeKey;
  nextGrade: GradeKey | null;
  remaining: number;
  progress: number; // 0~100
} {
  const currentGrade = calculateGrade(score);
  const currentIdx = GRADE_ORDER.indexOf(currentGrade);

  if (currentIdx === GRADE_ORDER.length - 1) {
    // 최고 등급
    return { currentGrade, nextGrade: null, remaining: 0, progress: 100 };
  }

  const nextGrade = GRADE_ORDER[currentIdx + 1];
  const nextMin = GRADE_INFO[nextGrade].minScore;
  const currentMin = GRADE_INFO[currentGrade].minScore;
  const remaining = nextMin - score;
  const range = nextMin - currentMin;
  const progress = Math.round(((score - currentMin) / range) * 100);

  return { currentGrade, nextGrade, remaining, progress: Math.min(progress, 100) };
}

// ── 점수 업데이트 (비동기, fire-and-forget 안전) ──

export async function addScore(userId: string, points: number): Promise<void> {
  try {
    // upsert: 있으면 score 증가, 없으면 새로 생성
    await db
      .insert(schema.userCommunityScores)
      .values({
        userId,
        score: points,
        grade: calculateGrade(points),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.userCommunityScores.userId,
        set: {
          score: sql`${schema.userCommunityScores.score} + ${points}`,
          updatedAt: new Date(),
        },
      });

    // 등급 재계산 (score를 다시 읽어서 grade 업데이트)
    const row = await db.query.userCommunityScores.findFirst({
      where: eq(schema.userCommunityScores.userId, userId),
    });

    if (row) {
      const newGrade = calculateGrade(row.score);
      if (newGrade !== row.grade) {
        await db
          .update(schema.userCommunityScores)
          .set({ grade: newGrade })
          .where(eq(schema.userCommunityScores.userId, userId));
      }
    }
  } catch (error) {
    // 점수 업데이트 실패는 메인 로직에 영향을 주지 않음
    console.error("커뮤니티 점수 업데이트 실패:", error);
  }
}

// ── 카운터 증가 헬퍼 ──

export async function incrementCounter(
  userId: string,
  counter: "postCount" | "commentCount" | "receivedLikes" | "receivedHelpfuls" | "schoolReviewCount",
  points: number
): Promise<void> {
  try {
    const columnMap = {
      postCount: schema.userCommunityScores.postCount,
      commentCount: schema.userCommunityScores.commentCount,
      receivedLikes: schema.userCommunityScores.receivedLikes,
      receivedHelpfuls: schema.userCommunityScores.receivedHelpfuls,
      schoolReviewCount: schema.userCommunityScores.schoolReviewCount,
    };

    const column = columnMap[counter];

    // upsert 초기값 설정
    const initialValues: Record<string, number> = {
      postCount: 0,
      commentCount: 0,
      receivedLikes: 0,
      receivedHelpfuls: 0,
      schoolReviewCount: 0,
    };
    initialValues[counter] = 1;

    await db
      .insert(schema.userCommunityScores)
      .values({
        userId,
        score: points,
        ...initialValues,
        grade: calculateGrade(points),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.userCommunityScores.userId,
        set: {
          score: sql`${schema.userCommunityScores.score} + ${points}`,
          [counter]: sql`${column} + 1`,
          updatedAt: new Date(),
        },
      });

    // 등급 재계산
    const row = await db.query.userCommunityScores.findFirst({
      where: eq(schema.userCommunityScores.userId, userId),
    });

    if (row) {
      const newGrade = calculateGrade(row.score);
      if (newGrade !== row.grade) {
        await db
          .update(schema.userCommunityScores)
          .set({ grade: newGrade })
          .where(eq(schema.userCommunityScores.userId, userId));
      }
    }
  } catch (error) {
    console.error(`커뮤니티 카운터(${counter}) 업데이트 실패:`, error);
  }
}

// ── 카운터 감소 헬퍼 (좋아요 취소 등) ──

export async function decrementCounter(
  userId: string,
  counter: "receivedLikes" | "receivedHelpfuls",
  points: number
): Promise<void> {
  try {
    const columnMap = {
      receivedLikes: schema.userCommunityScores.receivedLikes,
      receivedHelpfuls: schema.userCommunityScores.receivedHelpfuls,
    };

    const column = columnMap[counter];

    await db
      .update(schema.userCommunityScores)
      .set({
        score: sql`GREATEST(${schema.userCommunityScores.score} - ${points}, 0)`,
        [counter]: sql`GREATEST(${column} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(schema.userCommunityScores.userId, userId));

    // 등급 재계산
    const row = await db.query.userCommunityScores.findFirst({
      where: eq(schema.userCommunityScores.userId, userId),
    });

    if (row) {
      const newGrade = calculateGrade(row.score);
      if (newGrade !== row.grade) {
        await db
          .update(schema.userCommunityScores)
          .set({ grade: newGrade })
          .where(eq(schema.userCommunityScores.userId, userId));
      }
    }
  } catch (error) {
    console.error(`커뮤니티 카운터(${counter}) 감소 실패:`, error);
  }
}

// ── 전체 점수 재계산 (관리자용) ──

export async function recalculateScore(userId: string): Promise<{
  score: number;
  grade: GradeKey;
}> {
  // 각 활동별 카운트 조회
  const [posts] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.communityPosts)
    .where(eq(schema.communityPosts.authorId, userId));

  const [comments] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.communityComments)
    .where(eq(schema.communityComments.authorId, userId));

  // 받은 좋아요: 내가 쓴 글에 달린 좋아요 수
  const [likes] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.communityLikes)
    .innerJoin(
      schema.communityPosts,
      eq(schema.communityLikes.postId, schema.communityPosts.id)
    )
    .where(eq(schema.communityPosts.authorId, userId));

  // 받은 도움됐어요: 내가 쓴 글에 달린 도움됐어요 수
  const [helpfuls] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.communityHelpfuls)
    .innerJoin(
      schema.communityPosts,
      eq(schema.communityHelpfuls.postId, schema.communityPosts.id)
    )
    .where(eq(schema.communityPosts.authorId, userId));

  // 학교 리뷰
  const instructorRow = await db.query.instructors.findFirst({
    where: eq(schema.instructors.userId, userId),
    columns: { id: true },
  });

  let schoolReviewCount = 0;
  if (instructorRow) {
    const [schoolReviews] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.schoolReviews)
      .where(eq(schema.schoolReviews.instructorId, instructorRow.id));
    schoolReviewCount = schoolReviews?.count ?? 0;
  }

  const postCount = posts?.count ?? 0;
  const commentCount = comments?.count ?? 0;
  const receivedLikes = likes?.count ?? 0;
  const receivedHelpfuls = helpfuls?.count ?? 0;

  const score =
    postCount * 5 +
    commentCount * 2 +
    receivedLikes * 1 +
    receivedHelpfuls * 3 +
    schoolReviewCount * 10;

  const grade = calculateGrade(score);

  // upsert
  await db
    .insert(schema.userCommunityScores)
    .values({
      userId,
      score,
      postCount,
      commentCount,
      receivedLikes,
      receivedHelpfuls,
      schoolReviewCount,
      grade,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.userCommunityScores.userId,
      set: {
        score,
        postCount,
        commentCount,
        receivedLikes,
        receivedHelpfuls,
        schoolReviewCount,
        grade,
        updatedAt: new Date(),
      },
    });

  return { score, grade };
}
