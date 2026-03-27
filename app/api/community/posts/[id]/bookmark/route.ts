import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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

    // 이미 북마크 했는지 체크
    const existingBookmark = await db.query.communityBookmarks.findFirst({
      where: and(
        eq(schema.communityBookmarks.postId, postId),
        eq(schema.communityBookmarks.userId, userId)
      ),
    });

    if (existingBookmark) {
      // 북마크 해제
      await db
        .delete(schema.communityBookmarks)
        .where(eq(schema.communityBookmarks.id, existingBookmark.id));

      return NextResponse.json({
        data: { bookmarked: false },
      });
    } else {
      // 북마크 추가
      await db.insert(schema.communityBookmarks).values({
        postId,
        userId,
      });

      return NextResponse.json({
        data: { bookmarked: true },
      });
    }
  } catch (error) {
    console.error("북마크 처리 실패:", error);
    return NextResponse.json(
      { error: "북마크 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
