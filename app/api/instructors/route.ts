import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { instructorCreateSchema } from "@/lib/validations/instructor";
import { rateLimitStrict, rateLimitGeneral } from "@/lib/utils/rate-limit";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rateLimited = await rateLimitGeneral(ip);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  // TODO: Drizzle query with filters + pagination
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

  const data = parsed.data;

  try {
    // 1. 전화번호 중복 체크
    const existing = await db.query.instructors.findFirst({
      where: eq(schema.instructors.phone, data.phone),
      columns: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "이미 등록된 전화번호입니다." },
        { status: 409 }
      );
    }

    // 2. 강사 등록
    const id = crypto.randomUUID();
    await db.insert(schema.instructors).values({
      id,
      userId: session.user.id,
      instructorName: data.instructorName,
      phone: data.phone,
      profileImage: data.profileImage || null,
      snsAccounts: data.snsAccounts || [],
      topics: data.topics,
      methods: data.methods,
      regions: data.regions,
      lectureContent: data.lectureContent || null,
      bio: data.bio || null,
      career: data.career || null,
      certifications: data.certifications || [],
      address: data.address || null,
      availableDays: data.availableDays || [],
      availableTimeSlot: data.availableTimeSlot || null,
      desiredFee: data.desiredFee || null,
      portfolioLinks: data.portfolioLinks || [],
      yearsOfExperience: data.yearsOfExperience || null,
      agreedToTerms: true,
      agreedToPrivacy: true,
      agreedAt: new Date(),
      status: "new",
      isEarlyBird: true,
      earlyBirdGrantedAt: new Date(),
    });

    // 3. 사용자 역할을 instructor로 변경
    await db
      .update(schema.users)
      .set({ role: "instructor", updatedAt: new Date() })
      .where(eq(schema.users.id, session.user.id));

    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/instructors] Error:", error);
    return NextResponse.json(
      { error: "등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
