import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { reviewReplySchema } from "@/lib/validations/review";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = reviewReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  // TODO: Insert review_reply (check 1 reply per review)
  return NextResponse.json({ data: { id: "placeholder" } }, { status: 201 });
}
