import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/auth/middleware";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getOptionalSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const boardType = searchParams.get("type") || "all";
  const boardRef = searchParams.get("ref");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  // TODO: Drizzle query with cursor pagination using boardType, boardRef, cursor
  void boardType;
  void boardRef;
  void cursor;
  return NextResponse.json({
    data: [],
    pagination: { cursor: null, limit, hasMore: false },
  });
}
