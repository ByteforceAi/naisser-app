/**
 * API Route 인증 미들웨어
 * docs/02-AUTH-SYSTEM.md 기반
 *
 * requireAuth       — 로그인 필수
 * requireTeacher    — 교사 전용
 * requireInstructor — 강사 전용
 * requireAdmin      — 관리자 전용
 */

import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "./options";

export type AuthSession = {
  user: {
    id: string;
    role: "instructor" | "teacher" | "new" | "admin";
    profileId: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

/** 로그인 필수 — 비로그인 → 401 */
export async function requireAuth(): Promise<AuthSession | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  return session as AuthSession;
}

/** 교사 전용 — 교사 아님 → 403 */
export async function requireTeacher(): Promise<AuthSession | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (result.user.role !== "teacher") {
    return NextResponse.json(
      { error: "교사만 접근할 수 있습니다." },
      { status: 403 }
    );
  }

  return result;
}

/** 강사 전용 — 강사 아님 → 403 */
export async function requireInstructor(): Promise<
  AuthSession | NextResponse
> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (result.user.role !== "instructor") {
    return NextResponse.json(
      { error: "강사만 접근할 수 있습니다." },
      { status: 403 }
    );
  }

  return result;
}

/** 관리자 전용 — 관리자 아님 → 401 */
export async function requireAdmin(): Promise<
  { isAdmin: true } | NextResponse
> {
  // 관리자는 별도 세션 쿠키 기반 (ADMIN_PASSWORD)
  // 추후 구현: 쿠키에서 admin-token 확인
  // 현재는 NextAuth 세션에서 admin role 확인
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { error: "관리자 인증이 필요합니다." },
      { status: 401 }
    );
  }

  return { isAdmin: true };
}

/** 세션 유무 확인 (마스킹 판단용, 에러 반환하지 않음) */
export async function getOptionalSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session as AuthSession;
}

/** NextResponse인지 체크하는 타입 가드 */
export function isErrorResponse(
  result: AuthSession | NextResponse | { isAdmin: true }
): result is NextResponse {
  return result instanceof NextResponse;
}
