import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth/middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const body = await request.json();
  void body;
  void params.id;
  return NextResponse.json({ data: { id: params.id } });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdminToken(_request);
  if (authError) return authError;

  void params.id;
  return NextResponse.json({ data: { success: true } });
}
