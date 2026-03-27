import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const bookmarkedPosts = await db
      .select({
        bookmark: schema.communityBookmarks,
        post: schema.communityPosts,
      })
      .from(schema.communityBookmarks)
      .innerJoin(
        schema.communityPosts,
        eq(schema.communityBookmarks.postId, schema.communityPosts.id)
      )
      .where(eq(schema.communityBookmarks.userId, session.user.id))
      .orderBy(desc(schema.communityBookmarks.createdAt));

    const data = bookmarkedPosts.map((row) => ({
      ...row.post,
      bookmarkedAt: row.bookmark.createdAt,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("저장한 글 조회 실패:", error);
    return NextResponse.json(
      { error: "저장한 글을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
