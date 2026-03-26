import { NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  // TODO: Fetch lesson_requests where instructor_id = session.user.profileId
  return NextResponse.json({ data: [] });
}
