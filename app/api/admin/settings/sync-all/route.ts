import { NextResponse } from "next/server";

export async function POST() {
  // TODO: requireAdmin + sync all instructors to Google Sheets
  return NextResponse.json({ data: { success: true, synced: 0, message: "동기화 완료" } });
}
