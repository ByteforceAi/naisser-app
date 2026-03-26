import { NextResponse } from "next/server";
import { requireTeacher, isErrorResponse } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireTeacher();
  if (isErrorResponse(session)) return session;

  // TODO: Fetch lesson_requests where teacher_id = session.user.profileId
  return NextResponse.json({ data: [] });
}
