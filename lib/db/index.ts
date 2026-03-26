import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

/**
 * Lazy singleton DB 인스턴스
 * - 빌드 타임: DATABASE_URL 없이도 에러 없음
 * - 런타임: 첫 호출 시 초기화 + 캐시
 * - HMR: globalThis 캐시로 중복 생성 방지
 */
const globalForDb = globalThis as unknown as {
  _db: Database | undefined;
};

export function getDb(): Database {
  if (!globalForDb._db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
    }
    const sql = neon(process.env.DATABASE_URL);
    globalForDb._db = drizzle(sql, { schema });
  }
  return globalForDb._db;
}

/**
 * 편의 export — getDb()의 Proxy
 * import { db } from "@/lib/db" 형태로 사용 가능
 * 실제 프로퍼티 접근 시에만 DB 연결 생성
 */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});
