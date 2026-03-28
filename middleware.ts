/**
 * Next.js Middleware — 인증 보호
 *
 * ⚠️ database 세션 전략 사용 시 getToken()은 동작 안 함!
 * 대신 세션 쿠키 존재 여부로 로그인 상태를 판단합니다.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

/** 항상 공개 */
const ALWAYS_PUBLIC = [
  "/",
  "/auth",
  "/teacher/home",
  "/teacher/search",
  "/teacher/recommend",
  "/community",
  "/admin",
  "/p/",           // 강사 공개 프로필 (/@username)
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // DEV_SKIP_AUTH
  if (process.env.DEV_SKIP_AUTH === "true") {
    return NextResponse.next();
  }

  // 공개 경로 → 통과
  if (ALWAYS_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // 강사 공개 프로필 (/instructor/UUID) → 공개
  if (pathname.match(/^\/instructor\/[0-9a-f-]{36}$/i)) {
    return NextResponse.next();
  }

  // 보호 경로가 아니면 → 통과
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // 세션 쿠키 확인 (database 세션 전략)
  // HTTPS: __Secure-next-auth.session-token
  // HTTP:  next-auth.session-token
  const sessionToken =
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value;

  if (!sessionToken) {
    // 미인증 → 랜딩으로
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 세션 쿠키 있음 → 통과
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
