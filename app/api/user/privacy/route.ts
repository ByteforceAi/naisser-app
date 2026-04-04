import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

/**
 * GET/PATCH /api/user/privacy
 *
 * 개인정보 보호 설정 (프로필 공개 범위, 연락처 공개)
 */
export async function GET() {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  return NextResponse.json({
    data: {
      visibility: "public", // public | instructors | private
      showPhone: true,
      showEmail: true,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const settings = await req.json();
  console.log("[privacy]", settings);
  return NextResponse.json({ data: { success: true } });
}
