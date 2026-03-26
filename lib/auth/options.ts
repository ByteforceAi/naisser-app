/**
 * NextAuth.js 설정
 * docs/02-AUTH-SYSTEM.md 기반
 * - 카카오 + 구글 소셜로그인
 * - DrizzleAdapter (Neon PostgreSQL)
 * - session callback에서 role 분기
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
      KakaoProvider({
        clientId: process.env.KAKAO_CLIENT_ID!,
        clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],

    session: {
      strategy: "database",
      maxAge: 30 * 24 * 60 * 60, // 30일
    },

    pages: {
      signIn: "/auth/select-role",
      error: "/",
      // newUser 제거: callbackUrl이 우선하도록
      // 신규 사용자는 callbackUrl의 intent 파라미터로 분기
    },

    callbacks: {
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
        // 사전등록 강사: phone 매칭으로 기존 instructor에 user_id 연결
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
