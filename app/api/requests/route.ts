import { NextRequest, NextResponse } from "next/server";
import { requireTeacher, isErrorResponse } from "@/lib/auth/middleware";
import { lessonRequestSchema } from "@/lib/validations/request";
import { rateLimitStrict } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimited = await rateLimitStrict(ip);
  if (rateLimited) return rateLimited;

  const session = await requireTeacher();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = lessonRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  // TODO: Insert into lesson_requests + create notification for instructor
  return NextResponse.json({ data: { id: "placeholder" } }, { status: 201 });
}
