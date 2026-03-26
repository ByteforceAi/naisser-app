/**
 * NextAuth.js 설정
 * docs/02-AUTH-SYSTEM.md 기반
 *
 * ⚠️ 무한 루프 방지 핵심 원칙:
 *   1. pages.signIn을 커스텀 페이지로 설정하지 않음 (기본 NextAuth 사용)
 *   2. redirect callback에서 callbackUrl을 그대로 전달
 *   3. middleware는 보호 경로만 담당, 역할 분기는 클라이언트에서
 */

import type { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapterV4 } from "@/lib/auth/drizzle-adapter-v4";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";

/** Lazy authOptions — 런타임에서만 DB 연결 */
let _authOptions: NextAuthOptions | null = null;

export function getAuthOptions(): NextAuthOptions {
  if (_authOptions) return _authOptions;

  const db = getDb();

  _authOptions = {
    adapter: DrizzleAdapterV4(db),

    providers: [
      ...(process.env.KAKAO_CLIENT_ID
        ? [
            KakaoProvider({
              clientId: process.env.KAKAO_CLIENT_ID,
              clientSecret: process.env.KAKAO_CLIENT_SECRET!,
            }),
          ]
        : []),
      ...(process.env.GOOGLE_CLIENT_ID
        ? [
            GoogleProvider({
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            }),
          ]
        : []),
    ],

    session: {
      strategy: "database",
      maxAge: 30 * 24 * 60 * 60, // 30일
    },

    // ⚠️ pages 설정 최소화 — 무한 루프 방지
    pages: {
      error: "/auth/select-role",
    },

    // Vercel 프로덕션에서 쿠키 문제 방지
    // NEXTAUTH_URL이 https://로 시작하면 자동으로 __Secure- prefix 사용
    // 커스텀 도메인에서 쿠키 도메인이 안 맞을 수 있으므로 명시적 설정
    useSecureCookies: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,

    callbacks: {
      /**
       * redirect callback — callbackUrl을 그대로 전달
       *
       * ⚠️ 주의: NextAuth는 OAuth 완료 후 이 callback을 호출합니다.
       * url 파라미터는 signIn()에서 전달한 callbackUrl입니다.
       * baseUrl은 NEXTAUTH_URL (로컬) 또는 VERCEL_URL (프로덕션)입니다.
       */
      async redirect({ url, baseUrl }) {
        console.log("[NextAuth redirect]", { url, baseUrl });

        // 상대 경로 → baseUrl 결합
        if (url.startsWith("/")) {
          const result = `${baseUrl}${url}`;
          console.log("[NextAuth redirect] relative →", result);
          return result;
        }

        // 같은 origin이면 허용 (프로토콜 http/https 무관하게 hostname 비교)
        try {
          const urlObj = new URL(url);
          const baseObj = new URL(baseUrl);
          if (urlObj.hostname === baseObj.hostname) {
            console.log("[NextAuth redirect] same host →", url);
            return url;
          }
        } catch {
          // URL 파싱 실패
        }

        // 외부 URL은 baseUrl로 (보안)
        console.log("[NextAuth redirect] fallback →", baseUrl);
        return baseUrl;
      },

      async session({ session, user }) {
        if (!session.user) return session;

        // 1. 기본 정보 설정
        session.user.id = user.id;

        // 2. role 결정: instructors → teachers 순서로 확인
        const instructor = await db.query.instructors.findFirst({
          where: eq(schema.instructors.userId, user.id),
          columns: { id: true },
        });

        if (instructor) {
          session.user.role = "instructor";
          session.user.profileId = instructor.id;
          return session;
        }

        const teacher = await db.query.teachers.findFirst({
          where: eq(schema.teachers.userId, user.id),
          columns: { id: true },
        });

        if (teacher) {
          session.user.role = "teacher";
          session.user.profileId = teacher.id;
          return session;
        }

        // 3. 둘 다 없으면 신규 사용자
        session.user.role = "new";
        session.user.profileId = null;

        return session;
      },
    },

    events: {
      async signIn({ user, isNewUser }) {
        if (isNewUser && user.email) {
          // 이메일 기반 매칭은 추후 확장
        }
      },
    },

    debug: process.env.NODE_ENV === "development",
  };

  return _authOptions;
}

// 편의 alias — 기존 코드 호환
export const authOptions = new Proxy({} as NextAuthOptions, {
  get(_target, prop, receiver) {
    const opts = getAuthOptions();
    return Reflect.get(opts, prop, receiver);
  },
});
