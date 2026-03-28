/**
 * AI 매칭 추천 API
 * POST: 조건 입력 → 스코어링 → 상위 3명 추천 + 추천 이유
 *
 * 스코어링 가중치:
 * - 조건 매칭 (필수 필터) → 통과한 강사 중
 * - 후기 평점 (40%)
 * - 서류 완비 여부 (20%)
 * - 해당 학교 출강 경험 (20%) — "단골 보너스"
 * - 프로필 완성도 (10%)
 * - 최근 활동도 (10%)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireTeacher, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { instructors, teachingRecords, documents } from "@/lib/db/schema";
import { eq, sql, and, arrayContains } from "drizzle-orm";

interface RecommendRequest {
  category: string;
  targetGrade?: string;
  schoolName?: string;
  date?: string;
}

interface ScoredInstructor {
  id: string;
  instructorName: string;
  profileImage: string | null;
  topics: string[];
  regions: string[];
  averageRating: string;
  reviewCount: number;
  bio: string | null;
  isEarlyBird: boolean;
  // 스코어링 결과
  score: number;
  reasons: string[];
}

export async function POST(request: NextRequest) {
  const session = await requireTeacher();
  if (isErrorResponse(session)) return session;

  try {
    const body: RecommendRequest = await request.json();
    const { category, schoolName } = body;

    if (!category) {
      return NextResponse.json(
        { error: "수업 분야를 선택해주세요." },
        { status: 400 }
      );
    }

    // 1단계: 조건 매칭 — 해당 카테고리 강사 필터
    const candidates = await db
      .select()
      .from(instructors)
      .where(
        sql`${instructors.status} = 'approved' AND ${instructors.topics} @> ARRAY[${category}]::text[]`
      );

    if (candidates.length === 0) {
      return NextResponse.json({
        data: [],
        message: `'${category}' 분야의 강사가 아직 없습니다.`,
      });
    }

    // 2단계: 각 강사 스코어링
    const scored: ScoredInstructor[] = [];

    for (const inst of candidates) {
      let score = 0;
      const reasons: string[] = [];

      // (1) 후기 평점 — 40%
      const rating = parseFloat(inst.averageRating || "0");
      const ratingScore = (rating / 5) * 40;
      score += ratingScore;
      if (rating >= 4.5) reasons.push(`평점 ${rating.toFixed(1)}`);

      // (2) 서류 완비 — 20%
      const [docResult] = await db
        .select({ count: sql<number>`count(distinct doc_type)::int` })
        .from(documents)
        .where(eq(documents.instructorId, inst.id));

      const docCount = docResult?.count || 0;
      const requiredDocs = 3; // 범죄경력, 통장, 이력서
      const docScore = Math.min(docCount / requiredDocs, 1) * 20;
      score += docScore;
      if (docCount >= requiredDocs) reasons.push("서류 완비");

      // (3) 해당 학교 출강 경험 — 20%
      if (schoolName) {
        const [schoolExp] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(teachingRecords)
          .where(
            and(
              eq(teachingRecords.instructorId, inst.id),
              eq(teachingRecords.schoolName, schoolName),
              eq(teachingRecords.status, "confirmed")
            )
          );
        const expCount = schoolExp?.count || 0;
        if (expCount > 0) {
          score += Math.min(expCount / 3, 1) * 20;
          reasons.push(`${schoolName} ${expCount}회 출강`);
        }
      }

      // (4) 프로필 완성도 — 10%
      let completeness = 0;
      if (inst.instructorName) completeness += 20;
      if (inst.topics?.length) completeness += 20;
      if (inst.bio) completeness += 20;
      if (inst.career) completeness += 15;
      if (inst.profileImage) completeness += 15;
      if (inst.phone) completeness += 10;
      score += (completeness / 100) * 10;

      // (5) 최근 활동도 — 10%
      const [recent] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(teachingRecords)
        .where(
          and(
            eq(teachingRecords.instructorId, inst.id),
            sql`${teachingRecords.date} >= (current_date - interval '30 days')::text`
          )
        );
      if ((recent?.count || 0) > 0) {
        score += 10;
        reasons.push("최근 활동");
      }

      // 주제 전문성 표시
      const topicLabels = inst.topics || [];
      if (topicLabels.includes(category)) {
        reasons.unshift(`${category} 전문`);
      }

      scored.push({
        id: inst.id,
        instructorName: inst.instructorName,
        profileImage: inst.profileImage,
        topics: inst.topics || [],
        regions: inst.regions || [],
        averageRating: inst.averageRating || "0",
        reviewCount: inst.reviewCount || 0,
        bio: inst.bio,
        isEarlyBird: inst.isEarlyBird || false,
        score: Math.round(score * 10) / 10,
        reasons: reasons.slice(0, 4),
      });
    }

    // 3단계: 점수 내림차순 정렬 → 상위 3명
    scored.sort((a, b) => b.score - a.score);
    const top3 = scored.slice(0, 3);

    return NextResponse.json({
      data: top3,
      totalCandidates: candidates.length,
      message: `${category} 분야 ${candidates.length}명 중 상위 ${top3.length}명을 추천합니다.`,
    });
  } catch (error) {
    console.error("[POST /api/instructors/recommend]", error);
    return NextResponse.json(
      { error: "추천 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
