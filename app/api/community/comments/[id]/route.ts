import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// 댓글 수정 (본인만)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });
    }

    const [comment] = await db
      .select()
      .from(schema.communityComments)
      .where(eq(schema.communityComments.id, params.id))
      .limit(1);

    if (!comment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (comment.authorId !== session.user.id) {
      return NextResponse.json({ error: "본인 댓글만 수정할 수 있습니다." }, { status: 403 });
    }

    const [updated] = await db
      .update(schema.communityComments)
      .set({ content: content.trim() })
      .where(eq(schema.communityComments.id, params.id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PUT /api/community/comments/:id] Error:", error);
    return NextResponse.json({ error: "댓글 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 댓글 삭제 (본인만) + 포스트 comment_count 감소
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const [comment] = await db
      .select()
      .from(schema.communityComments)
      .where(eq(schema.communityComments.id, params.id))
      .limit(1);

    if (!comment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (comment.authorId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    }

    // 댓글 삭제
    await db
      .delete(schema.communityComments)
      .where(eq(schema.communityComments.id, params.id));

    // 포스트 comment_count 감소
    await db
      .update(schema.communityPosts)
      .set({
        commentCount: sql`GREATEST(${schema.communityPosts.commentCount} - 1, 0)`,
      })
      .where(eq(schema.communityPosts.id, comment.postId));

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("[DELETE /api/community/comments/:id] Error:", error);
    return NextResponse.json({ error: "댓글 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
