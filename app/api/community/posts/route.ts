import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { postCreateSchema } from "@/lib/validations/community";

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = postCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  // TODO: Insert into community_posts with Drizzle
  return NextResponse.json({ data: { id: "placeholder" } }, { status: 201 });
}
