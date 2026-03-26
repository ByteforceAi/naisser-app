import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  // TODO: Count notifications where user_id = session.user.id AND is_read = false
  return NextResponse.json({ data: { count: 0 } });
}
