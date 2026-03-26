import { NextRequest, NextResponse } from "next/server";
import { requireTeacher, isErrorResponse } from "@/lib/auth/middleware";
import { reviewCreateSchema } from "@/lib/validations/review";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params.id;
  // TODO: Fetch reviews for instructor
  return NextResponse.json({ data: [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireTeacher();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = reviewCreateSchema.safeParse({ ...body, instructorId: params.id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  // TODO: Insert review (check unique constraint — 409 if duplicate)
  // TODO: Update instructors.average_rating and review_count
  return NextResponse.json({ data: { id: "placeholder" } }, { status: 201 });
}
