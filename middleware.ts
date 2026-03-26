/**
 * Next.js Middleware — 인증 보호 + 역할 분기
 *
 * ⚠️ 무한 루프 방지 원칙:
 *   - /auth/* 경로는 절대 리다이렉트하지 않음
 *   - /api/auth/* 경로는 matcher에서 제외
 *   - 역할 기반 강제 리다이렉트는 하지 않음 (클라이언트에서 처리)
 *   - middleware는 "접근 차단"만, "어디로 보낼지"는 각 페이지가 결정
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** 로그인 필수 경로 */
const PROTECTED_PATHS = [
  "/onboarding",
  "/instructor",
  "/teacher/register",
  "/teacher/favorites",
  "/teacher/myinfo",
  "/community/write",
  "/community/saved",
];

/** 항상 공개 (로그인 여부 무관) */
const ALWAYS_PUBLIC = [
  "/",
  "/auth",
  "/teacher/home",
  "/teacher/search",
  "/community",
  "/admin",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // DEV_SKIP_AUTH: 개발 모드 인증 스킵
  if (process.env.DEV_SKIP_AUTH === "true") {
    return NextResponse.next();
  }

  // 공개 경로는 무조건 통과
  if (ALWAYS_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    // /auth로 시작하는 경로는 절대 건드리지 않음 (NextAuth 내부 포함)
    return NextResponse.next();
  }

  // 보호 경로 체크
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // 토큰 확인
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    // 미인증 → 랜딩으로 (callbackUrl 포함)
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // 로그인된 상태 → 통과 (역할 분기는 각 페이지에서 클라이언트 처리)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // api, _next, 정적 파일 제외
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
