import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  // TODO: Update comment (only author)
  return NextResponse.json({ data: { id: params.id } });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  // TODO: Delete comment (only author) + decrement comment_count
  return NextResponse.json({ data: { success: true } });
}
