import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;
  // TODO: Update reply (only author)
  return NextResponse.json({ data: { id: params.id } });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;
  // TODO: Delete reply
  return NextResponse.json({ data: { success: true } });
}
