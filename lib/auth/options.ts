/**
 * NextAuth.js 설정 — 당근마켓 스타일 단순 플로우
 *
 * 로그인 완료 → 무조건 /auth/select-role → 세션에서 role 체크 → 분기
 * callbackUrl 로직 없음. 단순함이 정의.
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
              // 쿠키 기반 검증 완전 비활성화 (Vercel serverless 쿠키 유실 진단용)
              // 성공하면 state/nonce 쿠키가 유실되는 것이 원인으로 확인됨
              checks: [],
            }),
          ]
        : []),
    ],

    session: {
      strategy: "database",
      maxAge: 30 * 24 * 60 * 60,
    },

    pages: {
      signIn: "/",
      error: "/",
    },

    callbacks: {
      /**
       * 로그인 완료 후 무조건 /auth/select-role로.
       * 거기서 세션 체크 → role별 분기.
       */
      async redirect({ baseUrl }) {
        return `${baseUrl}/auth/select-role`;
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

    debug: false,
  };

  return _authOptions;
}

export const authOptions = new Proxy({} as NextAuthOptions, {
  get(_target, prop, receiver) {
    const opts = getAuthOptions();
    return Reflect.get(opts, prop, receiver);
  },
});
