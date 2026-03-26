import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/** 인증이 필요한 경로 */
const PROTECTED_PATHS = [
  "/instructor",
  "/onboarding",
  "/community/write",
  "/community/saved",
  "/teacher/register",
  "/teacher/favorites",
  "/teacher/myinfo",
];

/** 비로그인도 허용하는 교사 영역 (둘러보기용) */
const PUBLIC_TEACHER_PATHS = [
  "/teacher/home",
  "/teacher/search",
];

/** 관리자 경로 */
const ADMIN_PATHS = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ──────────────────────────────────────────────
  // DEV_SKIP_AUTH: 개발 모드에서 인증 체크 건너뛰기
  // .env.local에 DEV_SKIP_AUTH=true 설정 시 활성화
  // ⚠️ 프로덕션에서는 절대 true로 설정하지 않을 것
  // ──────────────────────────────────────────────
  if (process.env.DEV_SKIP_AUTH === "true") {
    return NextResponse.next();
  }

  // 관리자 경로는 별도 인증 (세션 쿠키 기반)
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    if (pathname === "/admin/login") return NextResponse.next();
    // TODO: 관리자 세션 검증
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 보호된 경로 → 미인증 시 로그인으로 리다이렉트
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 역할 기반 접근 제어 (로그인된 유저만)
  if (token) {
    const role = token.role as string | undefined;

    // 강사 영역에 교사가 접근하는 것 방지
    if (pathname.startsWith("/instructor") && role !== "instructor" && role !== "new") {
      return NextResponse.redirect(new URL("/teacher/home", request.url));
    }

    // 교사 전용 경로(등록/즐겨찾기/내정보)에 강사가 접근하는 것 방지
    // 단, /teacher/home과 /teacher/search는 모든 사용자에게 공개
    if (
      pathname.startsWith("/teacher") &&
      !PUBLIC_TEACHER_PATHS.some((p) => pathname.startsWith(p)) &&
      role !== "teacher" &&
      role !== "new"
    ) {
      return NextResponse.redirect(new URL("/instructor", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
