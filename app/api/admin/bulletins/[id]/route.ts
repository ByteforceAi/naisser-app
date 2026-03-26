import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // TODO: requireAdmin
  const body = await request.json();
  void body;
  void params.id;
  // TODO: Update bulletin
  return NextResponse.json({ data: { id: params.id } });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  // TODO: requireAdmin + delete bulletin
  return NextResponse.json({ data: { success: true } });
}
