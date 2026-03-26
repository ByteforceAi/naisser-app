import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  // TODO: Toggle bookmark with Drizzle
  return NextResponse.json({ data: { bookmarked: true } });
}
