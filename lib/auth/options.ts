/**
 * NextAuth.js 설정
 * docs/02-AUTH-SYSTEM.md 기반
 */

import type { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapterV4 } from "@/lib/auth/drizzle-adapter-v4";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";

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
              // Vercel serverless에서 PKCE 쿠키가 깨질 수 있으므로
              // state 체크만 사용 (카카오와 동일)
              checks: ["state"],
            }),
          ]
        : []),
    ],

    session: {
      strategy: "database",
      maxAge: 30 * 24 * 60 * 60, // 30일
    },

    pages: {
      error: "/auth/select-role",
    },

    // ⚠️ useSecureCookies 제거 — NextAuth가 NEXTAUTH_URL 기반으로 자동 판단하게
    // Vercel에서 커스텀 도메인 사용 시 쿠키 prefix 자동 처리됨

    callbacks: {
      /**
       * redirect — 단순하게! callbackUrl을 그대로 전달.
       * NextAuth는 이 callback을 여러 번 호출함:
       * 1) signIn POST 후 (url = OAuth authorization URL)
       * 2) OAuth callback 후 (url = callbackUrl 쿠키 값)
       */
      async redirect({ url, baseUrl }) {
        // 상대 경로 → 절대 경로로
        if (url.startsWith("/")) return baseUrl + url;
        // 같은 사이트면 그대로
        if (url.startsWith(baseUrl)) return url;
        // 외부 URL은 차단
        return baseUrl;
      },

      async session({ session, user }) {
        if (!session.user) return session;

        session.user.id = user.id;

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

        session.user.role = "new";
        session.user.profileId = null;
        return session;
      },
    },

    events: {
      async signIn({ user, isNewUser }) {
        console.log("[NextAuth event:signIn]", { userId: user.id, email: user.email, isNewUser });
      },
    },

    logger: {
      error(code, metadata) {
        console.error("[NextAuth ERROR]", code, JSON.stringify(metadata, null, 2));
      },
      warn(code) {
        console.warn("[NextAuth WARN]", code);
      },
      debug(code, metadata) {
        console.log("[NextAuth DEBUG]", code, metadata);
      },
    },

    // 프로덕션에서도 디버그 활성화 (에러 진단용, 나중에 끌 것)
    debug: true,
  };

  return _authOptions;
}

export const authOptions = new Proxy({} as NextAuthOptions, {
  get(_target, prop, receiver) {
    const opts = getAuthOptions();
    return Reflect.get(opts, prop, receiver);
  },
});
