import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/**
 * 디버그용 — DB 연결 + 환경변수 체크
 * 프로덕션에서 OAuth 에러 진단용 (나중에 삭제)
 */
export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. 환경변수 존재 여부 (값은 마스킹)
  checks.env = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "(not set)",
    KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID ? "set" : "(not set)",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "set" : "(not set)",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? `set (${process.env.GOOGLE_CLIENT_SECRET!.length} chars)` : "(not set)",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL || "(not set)",
  };

  // 2. DB 연결 테스트
  try {
    const db = getDb();
    const users = await db.query.users.findMany({
      columns: { id: true, email: true, role: true },
    });
    checks.db = { ok: true, userCount: users.length, users };
  } catch (e) {
    checks.db = { ok: false, error: String(e) };
  }

  // 3. Google OAuth redirect URI 확인
  checks.googleCallbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`;

  return NextResponse.json(checks, { status: 200 });
}
