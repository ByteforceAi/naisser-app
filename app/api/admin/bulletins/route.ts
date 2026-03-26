import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // TODO: requireAdmin + fetch all bulletins
  return NextResponse.json({ data: [] });
}

export async function POST(request: NextRequest) {
  // TODO: requireAdmin
  const body = await request.json();
  void body;
  // TODO: Insert bulletin with Drizzle
  return NextResponse.json({ data: { id: "placeholder" } }, { status: 201 });
}
