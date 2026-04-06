import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { instructorId: string } }
) {
  const authError = requireAdminToken(_request);
  if (authError) return authError;

  void params.instructorId;
  return NextResponse.json({ data: [] });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { instructorId: string } }
) {
  const authError = requireAdminToken(_request);
  if (authError) return authError;

  void params.instructorId;
  return NextResponse.json({ data: { success: true } });
}
