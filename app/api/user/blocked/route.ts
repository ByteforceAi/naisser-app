import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

/**
 * GET/POST/DELETE /api/user/blocked
 *
 * 차단/뮤트 유저 관리
 */
export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  // TODO: DB에서 blocked_users 조회
  return NextResponse.json({ data: [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { targetUserId } = await req.json();
  return NextResponse.json({ data: { success: true } });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const { targetUserId } = await req.json();
  return NextResponse.json({ data: { success: true } });
}
