import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  // TODO: Fetch notifications where user_id = session.user.id, order by created_at desc
  return NextResponse.json({ data: [] });
}
