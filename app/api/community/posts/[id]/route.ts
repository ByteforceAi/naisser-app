import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  // TODO: Fetch post by id with Drizzle
  return NextResponse.json({ data: null, error: "게시글을 찾을 수 없습니다." }, { status: 404 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  // TODO: Update post (only author)
  return NextResponse.json({ data: { id: params.id } });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  // TODO: Delete post (only author)
  return NextResponse.json({ data: { success: true } });
}
