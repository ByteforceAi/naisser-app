/**
 * 즐겨찾기 API
 * GET: 내 즐겨찾기 목록
 * POST: 즐겨찾기 토글 (추가/삭제)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { rateLimitGeneral } from "@/lib/utils/rate-limit";
import { db } from "@/lib/db";
import { favorites, instructors } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const results = await db
      .select({
        id: favorites.id,
        instructorId: favorites.instructorId,
        createdAt: favorites.createdAt,
        instructorName: instructors.instructorName,
        profileImage: instructors.profileImage,
        topics: instructors.topics,
        regions: instructors.regions,
        averageRating: instructors.averageRating,
        reviewCount: instructors.reviewCount,
        isEarlyBird: instructors.isEarlyBird,
      })
      .from(favorites)
      .innerJoin(instructors, eq(favorites.instructorId, instructors.id))
      .where(eq(favorites.teacherId, session.user.id))
      .orderBy(desc(favorites.createdAt));

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("[GET /api/favorites]", error);
    return NextResponse.json({ error: "즐겨찾기 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rl = await rateLimitGeneral(ip);
  if (rl) return rl;

  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const { instructorId } = await request.json();
    if (!instructorId) {
      return NextResponse.json({ error: "강사 ID가 필요합니다." }, { status: 400 });
    }

    // 이미 즐겨찾기인지 확인
    const [existing] = await db
      .select({ id: favorites.id })
      .from(favorites)
      .where(and(eq(favorites.teacherId, session.user.id), eq(favorites.instructorId, instructorId)))
      .limit(1);

    if (existing) {
      // 삭제 (토글 OFF)
      await db.delete(favorites).where(eq(favorites.id, existing.id));
      return NextResponse.json({ data: { favorited: false } });
    } else {
      // 추가 (토글 ON)
      await db.insert(favorites).values({
        teacherId: session.user.id,
        instructorId,
      });
      return NextResponse.json({ data: { favorited: true } });
    }
  } catch (error) {
    console.error("[POST /api/favorites]", error);
    return NextResponse.json({ error: "즐겨찾기 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
