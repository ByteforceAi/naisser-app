/**
 * 포트폴리오 API
 * GET: 내 포트폴리오 목록
 * POST: 포트폴리오 항목 추가 (이미지/PDF → Vercel Blob, 영상 → URL 저장)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { rateLimitStrict } from "@/lib/utils/rate-limit";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// 포트폴리오는 instructors 테이블의 JSON 필드로 저장 (별도 테이블 불필요)
// instructors.portfolio: { items: PortfolioItem[] }

export async function GET() {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  try {
    const [inst] = await db
      .select({ id: instructors.id, portfolio: sql<string>`portfolio` })
      .from(instructors)
      .where(eq(instructors.userId, session.user.id))
      .limit(1);

    if (!inst) {
      return NextResponse.json({ data: [] });
    }

    let items = [];
    try {
      const parsed = typeof inst.portfolio === "string"
        ? JSON.parse(inst.portfolio)
        : inst.portfolio;
      items = parsed?.items || [];
    } catch {
      items = [];
    }

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("[GET /api/instructors/me/portfolio]", error);
    return NextResponse.json({ error: "포트폴리오를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rl = await rateLimitStrict(ip);
  if (rl) return rl;

  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  try {
    const [inst] = await db
      .select({ id: instructors.id, portfolio: sql<string>`portfolio` })
      .from(instructors)
      .where(eq(instructors.userId, session.user.id))
      .limit(1);

    if (!inst) {
      return NextResponse.json({ error: "강사 프로필이 없습니다." }, { status: 404 });
    }

    let existingItems = [];
    try {
      const parsed = typeof inst.portfolio === "string"
        ? JSON.parse(inst.portfolio)
        : inst.portfolio;
      existingItems = parsed?.items || [];
    } catch {
      existingItems = [];
    }

    if (existingItems.length >= 25) {
      return NextResponse.json({ error: "포트폴리오는 최대 25개까지 추가할 수 있습니다." }, { status: 400 });
    }

    const contentType = request.headers.get("content-type") || "";
    let newItem;

    if (contentType.includes("multipart/form-data")) {
      // 파일 업로드 (이미지/PDF)
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const type = formData.get("type") as string;
      const title = formData.get("title") as string;

      if (!file) {
        return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "10MB 이하만 업로드 가능합니다." }, { status: 400 });
      }

      const blob = await put(`portfolio/${inst.id}/${Date.now()}-${file.name}`, file, {
        access: "public",
      });

      newItem = {
        id: crypto.randomUUID(),
        type: type || "image",
        url: blob.url,
        title: title || file.name,
        createdAt: new Date().toISOString(),
      };
    } else {
      // JSON (영상 링크)
      const body = await request.json();
      newItem = {
        id: crypto.randomUUID(),
        type: body.type || "video",
        url: body.url,
        title: body.title || "수업 영상",
        createdAt: new Date().toISOString(),
      };
    }

    const updatedItems = [...existingItems, newItem];

    await db
      .update(instructors)
      .set({
        portfolio: JSON.stringify({ items: updatedItems }),
      } as Record<string, unknown>)
      .where(eq(instructors.id, inst.id));

    return NextResponse.json({ data: newItem });
  } catch (error) {
    console.error("[POST /api/instructors/me/portfolio]", error);
    return NextResponse.json({ error: "포트폴리오 추가에 실패했습니다." }, { status: 500 });
  }
}
