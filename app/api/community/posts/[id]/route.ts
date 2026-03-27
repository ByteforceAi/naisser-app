import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await db.query.communityPosts.findFirst({
      where: eq(schema.communityPosts.id, params.id),
    });

    if (!post) {
      return NextResponse.json(
        { data: null, error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error("게시글 조회 실패:", error);
    return NextResponse.json(
      { error: "게시글을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const existing = await db.query.communityPosts.findFirst({
      where: eq(schema.communityPosts.id, params.id),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existing.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "본인의 게시글만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const [updated] = await db
      .update(schema.communityPosts)
      .set({
        body: body.body ?? existing.body,
        images: body.images ?? existing.images,
        tags: body.tags ?? existing.tags,
        postType: body.postType ?? existing.postType,
        updatedAt: new Date(),
      })
      .where(eq(schema.communityPosts.id, params.id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("게시글 수정 실패:", error);
    return NextResponse.json(
      { error: "게시글 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const existing = await db.query.communityPosts.findFirst({
      where: eq(schema.communityPosts.id, params.id),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existing.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "본인의 게시글만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    await db
      .delete(schema.communityPosts)
      .where(eq(schema.communityPosts.id, params.id));

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("게시글 삭제 실패:", error);
    return NextResponse.json(
      { error: "게시글 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
