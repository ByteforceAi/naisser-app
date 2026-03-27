import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { postCreateSchema } from "@/lib/validations/community";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { incrementCounter } from "@/lib/utils/community-score";

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = postCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  try {
    const { boardType, boardRef, body: postBody, images, tags, postType } = parsed.data;

    const [newPost] = await db
      .insert(schema.communityPosts)
      .values({
        boardType,
        boardRef: boardRef ?? null,
        body: postBody,
        images: images ?? null,
        tags: tags ?? null,
        postType,
        authorId: session.user.id,
        authorType: session.user.role,
      })
      .returning();

    // 커뮤니티 점수 +5 (비동기, 실패해도 무시)
    incrementCounter(session.user.id, "postCount", 5).catch(() => {});

    return NextResponse.json({ data: newPost }, { status: 201 });
  } catch (error) {
    console.error("게시글 작성 실패:", error);
    return NextResponse.json(
      { error: "게시글 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
