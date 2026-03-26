import { NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  // TODO: Fetch instructor early bird fields
  return NextResponse.json({
    data: {
      isEarlyBird: false,
      freeRequestQuota: 0,
      freeRequestUsed: 0,
      expiresAt: null,
    },
  });
}
