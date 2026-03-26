import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";

export async function PATCH() {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  // TODO: Update all notifications to is_read = true
  return NextResponse.json({ data: { success: true } });
}
