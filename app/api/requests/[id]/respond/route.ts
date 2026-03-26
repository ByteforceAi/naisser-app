import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { requestRespondSchema } from "@/lib/validations/request";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = requestRespondSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  // TODO: Update lesson_request status + create notification for teacher
  return NextResponse.json({ data: { id: params.id, status: parsed.data.action } });
}
