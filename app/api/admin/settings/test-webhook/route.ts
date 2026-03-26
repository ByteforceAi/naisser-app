import { NextResponse } from "next/server";

export async function POST() {
  // TODO: requireAdmin + test Google Sheets webhook
  return NextResponse.json({ data: { success: true, message: "웹훅 테스트 성공" } });
}
