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
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";

/** Lazy authOptions — 런타임에서만 DB 연결 */
let _authOptions: NextAuthOptions | null = null;

export function getAuthOptions(): NextAuthOptions {
  if (_authOptions) return _authOptions;

  const db = getDb();

  _authOptions = {
    adapter: DrizzleAdapter(db),

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
    // signIn을 커스텀 페이지로 설정하면 NextAuth 내부 리다이렉트와 충돌
    pages: {
      error: "/",
    },

    callbacks: {
      /** callbackUrl을 그대로 전달 — 절대 다른 곳으로 바꾸지 않음 */
      async redirect({ url, baseUrl }) {
        // 같은 도메인이면 그대로
        if (url.startsWith(baseUrl)) return url;
        // 상대 경로면 baseUrl 붙이기
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        // 외부 URL은 baseUrl로 (보안)
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
