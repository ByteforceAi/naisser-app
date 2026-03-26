/**
 * NextAuth v4 전용 Drizzle Adapter
 *
 * @auth/drizzle-adapter v1.x는 Auth.js v5용이라 NextAuth v4와 호환 안 됨.
 * 이 파일은 NextAuth v4의 Adapter 인터페이스를 직접 구현합니다.
 *
 * 참고: https://next-auth.js.org/tutorials/creating-a-database-adapter
 */

import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "next-auth/adapters";
import { and, eq } from "drizzle-orm";
import type { Database } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export function DrizzleAdapterV4(db: Database): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, "id">) {
      const id = crypto.randomUUID();
      await db.insert(schema.users).values({
        id,
        name: data.name ?? null,
        email: data.email,
        emailVerified: data.emailVerified ?? null,
        image: data.image ?? null,
      });
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });
      if (!user) throw new Error("사용자 생성 실패");
      return toAdapterUser(user);
    },

    async getUser(id: string) {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, id),
      });
      return user ? toAdapterUser(user) : null;
    },

    async getUserByEmail(email: string) {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.email, email),
      });
      return user ? toAdapterUser(user) : null;
    },

    async getUserByAccount({ provider, providerAccountId }: Pick<AdapterAccount, "provider" | "providerAccountId">) {
      const account = await db.query.accounts.findFirst({
        where: and(
          eq(schema.accounts.provider, provider),
          eq(schema.accounts.providerAccountId, providerAccountId)
        ),
      });
      if (!account) return null;
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, account.userId),
      });
      return user ? toAdapterUser(user) : null;
    },

    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      if (!data.id) throw new Error("User ID required");
      await db
        .update(schema.users)
        .set({
          name: data.name ?? undefined,
          email: data.email ?? undefined,
          emailVerified: data.emailVerified ?? undefined,
          image: data.image ?? undefined,
        })
        .where(eq(schema.users.id, data.id));
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, data.id),
      });
      if (!user) throw new Error("사용자 업데이트 실패");
      return toAdapterUser(user);
    },

    async deleteUser(id: string) {
      await db.delete(schema.users).where(eq(schema.users.id, id));
    },

    async linkAccount(data: AdapterAccount) {
      await db.insert(schema.accounts).values({
        userId: data.userId,
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refresh_token: data.refresh_token ?? null,
        access_token: data.access_token ?? null,
        expires_at: data.expires_at ?? null,
        token_type: data.token_type ?? null,
        scope: data.scope ?? null,
        id_token: data.id_token ?? null,
        session_state: (data.session_state as string) ?? null,
      });
      return data as AdapterAccount;
    },

    async unlinkAccount({ provider, providerAccountId }: Pick<AdapterAccount, "provider" | "providerAccountId">) {
      await db
        .delete(schema.accounts)
        .where(
          and(
            eq(schema.accounts.provider, provider),
            eq(schema.accounts.providerAccountId, providerAccountId)
          )
        );
    },

    async createSession(data: { sessionToken: string; userId: string; expires: Date }) {
      await db.insert(schema.sessions).values({
        sessionToken: data.sessionToken,
        userId: data.userId,
        expires: data.expires,
      });
      return data as AdapterSession;
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await db.query.sessions.findFirst({
        where: eq(schema.sessions.sessionToken, sessionToken),
      });
      if (!session) return null;
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, session.userId),
      });
      if (!user) return null;
      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: toAdapterUser(user),
      };
    },

    async updateSession(data: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">) {
      await db
        .update(schema.sessions)
        .set({
          expires: data.expires ?? undefined,
          userId: data.userId ?? undefined,
        })
        .where(eq(schema.sessions.sessionToken, data.sessionToken));
      const session = await db.query.sessions.findFirst({
        where: eq(schema.sessions.sessionToken, data.sessionToken),
      });
      return session
        ? {
            sessionToken: session.sessionToken,
            userId: session.userId,
            expires: session.expires,
          }
        : null;
    },

    async deleteSession(sessionToken: string) {
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.sessionToken, sessionToken));
    },

    async createVerificationToken(data: VerificationToken) {
      await db.insert(schema.verificationTokens).values({
        identifier: data.identifier,
        token: data.token,
        expires: data.expires,
      });
      return data;
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const row = await db.query.verificationTokens.findFirst({
        where: and(
          eq(schema.verificationTokens.identifier, identifier),
          eq(schema.verificationTokens.token, token)
        ),
      });
      if (!row) return null;
      await db
        .delete(schema.verificationTokens)
        .where(
          and(
            eq(schema.verificationTokens.identifier, identifier),
            eq(schema.verificationTokens.token, token)
          )
        );
      return {
        identifier: row.identifier,
        token: row.token,
        expires: row.expires,
      };
    },
  };
}

/** DB row → NextAuth v4 AdapterUser 변환 */
function toAdapterUser(user: typeof schema.users.$inferSelect): AdapterUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email ?? "",
    emailVerified: user.emailVerified,
    image: user.image,
  };
}
