import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth/middleware";

export async function POST(req: NextRequest) {
  const authError = requireAdminToken(req);
  if (authError) return authError;

  return NextResponse.json({ data: { success: true, message: "웹훅 테스트 성공" } });
}
