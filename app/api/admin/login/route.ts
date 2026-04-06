import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  // HMAC-SHA256 서명 토큰 (stateless, 검증 가능)
  const token = crypto
    .createHmac("sha256", process.env.ADMIN_PASSWORD!)
    .update("admin-session")
    .digest("hex");

  const cookieStore = await cookies();
  cookieStore.set("admin-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24시간
    path: "/",
  });

  return NextResponse.json({ data: { success: true } });
}
