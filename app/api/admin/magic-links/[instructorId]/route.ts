import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { instructorId: string } }
) {
  void params.instructorId;
  // TODO: requireAdmin + fetch magic links for instructor
  return NextResponse.json({ data: [] });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { instructorId: string } }
) {
  void params.instructorId;
  // TODO: requireAdmin + delete magic link
  return NextResponse.json({ data: { success: true } });
}
