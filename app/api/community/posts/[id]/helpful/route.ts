import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { incrementCounter, decrementCounter } from "@/lib/utils/community-score";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  const postId = params.id;
  const userId = session.user.id;

  try {
    // 게시글 존재 확인
    const post = await db.query.communityPosts.findFirst({
      where: eq(schema.communityPosts.id, postId),
    });

    if (!post) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 이미 도움됐어요 했는지 체크
    const existing = await db.query.communityHelpfuls.findFirst({
      where: and(
        eq(schema.communityHelpfuls.postId, postId),
        eq(schema.communityHelpfuls.userId, userId)
      ),
    });

    if (existing) {
      // 도움됐어요 취소
      await db
        .delete(schema.communityHelpfuls)
        .where(eq(schema.communityHelpfuls.id, existing.id));

      await db
        .update(schema.communityPosts)
        .set({
          helpfulCount: sql`GREATEST(${schema.communityPosts.helpfulCount} - 1, 0)`,
        })
        .where(eq(schema.communityPosts.id, postId));

      // 글 작성자 점수 -3 (비동기, 실패해도 무시)
      decrementCounter(post.authorId, "receivedHelpfuls", 3).catch(() => {});

      const currentCount = (post.helpfulCount ?? 0) - 1;
      return NextResponse.json({
        data: { helpful: false, helpfulCount: Math.max(currentCount, 0) },
      });
    } else {
      // 도움됐어요 추가
      await db.insert(schema.communityHelpfuls).values({
        postId,
        userId,
      });

      await db
        .update(schema.communityPosts)
        .set({
          helpfulCount: sql`${schema.communityPosts.helpfulCount} + 1`,
        })
        .where(eq(schema.communityPosts.id, postId));

      // 글 작성자 점수 +3 (비동기, 실패해도 무시)
      incrementCounter(post.authorId, "receivedHelpfuls", 3).catch(() => {});

      return NextResponse.json({
        data: { helpful: true, helpfulCount: (post.helpfulCount ?? 0) + 1 },
      });
    }
  } catch (error) {
    console.error("도움됐어요 처리 실패:", error);
    return NextResponse.json(
      { error: "도움됐어요 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
