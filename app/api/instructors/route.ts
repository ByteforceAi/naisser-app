import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { instructorCreateSchema } from "@/lib/validations/instructor";
import { rateLimitStrict, rateLimitGeneral } from "@/lib/utils/rate-limit";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimited = await rateLimitGeneral(ip);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  // TODO: Drizzle query with filters + pagination
  // Apply maskInstructorProfile to each result based on session
  return NextResponse.json({
    data: [],
    pagination: { page, limit, total: 0, totalPages: 0 },
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimited = await rateLimitStrict(ip);
  if (rateLimited) return rateLimited;

  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  const body = await request.json();
  const parsed = instructorCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  // TODO: Check phone uniqueness (409 if duplicate)
  // TODO: Insert into instructors with Drizzle
  // TODO: Update users.role = 'instructor'
  return NextResponse.json({ data: { id: "placeholder" } }, { status: 201 });
}
