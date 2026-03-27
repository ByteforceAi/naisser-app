import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { commentCreateSchema } from "@/lib/validations/community";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { incrementCounter } from "@/lib/utils/community-score";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await db
      .select()
      .from(schema.communityComments)
      .where(eq(schema.communityComments.postId, params.id))
      .orderBy(asc(schema.communityComments.createdAt));

    return NextResponse.json({ data: comments });
  } catch (error) {
    console.error("댓글 조회 실패:", error);
    return NextResponse.json(
      { error: "댓글을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = commentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  const postId = params.id;

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

    const { content, parentId } = parsed.data;

    const [newComment] = await db
      .insert(schema.communityComments)
      .values({
        postId,
        authorId: session.user.id,
        authorType: session.user.role,
        content,
        parentId: parentId ?? null,
      })
      .returning();

    // commentCount +1
    await db
      .update(schema.communityPosts)
      .set({
        commentCount: sql`${schema.communityPosts.commentCount} + 1`,
      })
      .where(eq(schema.communityPosts.id, postId));

    // 커뮤니티 점수 +2 (비동기, 실패해도 무시)
    incrementCounter(session.user.id, "commentCount", 2).catch(() => {});

    return NextResponse.json({ data: newComment }, { status: 201 });
  } catch (error) {
    console.error("댓글 작성 실패:", error);
    return NextResponse.json(
      { error: "댓글 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
