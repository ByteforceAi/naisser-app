import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc, and, lt } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const boardType = searchParams.get("type") || "all";
  const boardRef = searchParams.get("ref");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  try {
    // 조건 배열 구성
    const conditions = [eq(schema.communityPosts.boardType, boardType)];

    if (boardRef) {
      conditions.push(eq(schema.communityPosts.boardRef, boardRef));
    }

    if (cursor) {
      conditions.push(lt(schema.communityPosts.createdAt, new Date(cursor)));
    }

    const posts = await db
      .select()
      .from(schema.communityPosts)
      .where(and(...conditions))
      .orderBy(desc(schema.communityPosts.createdAt))
      .limit(limit + 1);

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor =
      hasMore && data.length > 0
        ? data[data.length - 1].createdAt?.toISOString() ?? null
        : null;

    return NextResponse.json({
      data,
      pagination: { nextCursor, limit, hasMore },
    });
  } catch (error) {
    console.error("피드 조회 실패:", error);
    return NextResponse.json(
      { error: "피드를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
