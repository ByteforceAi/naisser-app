import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: requireAdmin
  const { notes } = await request.json();
  void params.id;
  // TODO: Update instructor admin_notes
  return NextResponse.json({ data: { id: params.id, notes } });
}
