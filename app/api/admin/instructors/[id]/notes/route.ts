import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth/middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const { notes } = await request.json();
  void params.id;
  // TODO: Update instructor admin_notes
  return NextResponse.json({ data: { id: params.id, notes } });
}
