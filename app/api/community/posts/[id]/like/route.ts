import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

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

    // 이미 좋아요 했는지 체크
    const existingLike = await db.query.communityLikes.findFirst({
      where: and(
        eq(schema.communityLikes.postId, postId),
        eq(schema.communityLikes.userId, userId)
      ),
    });

    if (existingLike) {
      // 좋아요 취소
      await db
        .delete(schema.communityLikes)
        .where(eq(schema.communityLikes.id, existingLike.id));

      await db
        .update(schema.communityPosts)
        .set({
          likeCount: sql`GREATEST(${schema.communityPosts.likeCount} - 1, 0)`,
        })
        .where(eq(schema.communityPosts.id, postId));

      const currentCount = (post.likeCount ?? 0) - 1;
      return NextResponse.json({
        data: { liked: false, likeCount: Math.max(currentCount, 0) },
      });
    } else {
      // 좋아요 추가
      await db.insert(schema.communityLikes).values({
        postId,
        userId,
      });

      await db
        .update(schema.communityPosts)
        .set({
          likeCount: sql`${schema.communityPosts.likeCount} + 1`,
        })
        .where(eq(schema.communityPosts.id, postId));

      return NextResponse.json({
        data: { liked: true, likeCount: (post.likeCount ?? 0) + 1 },
      });
    }
  } catch (error) {
    console.error("좋아요 처리 실패:", error);
    return NextResponse.json(
      { error: "좋아요 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
