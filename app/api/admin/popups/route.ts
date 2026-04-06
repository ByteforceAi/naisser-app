import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authError = requireAdminToken(req);
  if (authError) return authError;

  return NextResponse.json({ data: [] });
}

export async function POST(request: NextRequest) {
  const authError = requireAdminToken(request);
  if (authError) return authError;

  const body = await request.json();
  void body;
  // TODO: Insert popup with Drizzle
  return NextResponse.json({ data: { id: "placeholder" } }, { status: 201 });
}
