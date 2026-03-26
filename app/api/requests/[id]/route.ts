import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  // TODO: Fetch request by id
  return NextResponse.json({ data: null, error: "의뢰를 찾을 수 없습니다." }, { status: 404 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;
  // TODO: Cancel request (only pending, only teacher)
  return NextResponse.json({ data: { success: true } });
}
