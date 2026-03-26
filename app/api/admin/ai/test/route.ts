import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Test AI API connection
  return NextResponse.json({ data: { success: true, provider: "claude" } });
}
