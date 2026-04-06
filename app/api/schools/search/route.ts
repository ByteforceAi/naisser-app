/**
 * 학교 검색 API — 자동완성용
 * GET /api/schools/search?q=해강&type=초등학교&limit=10
 *
 * 1차: DB schools 테이블 검색
 * 2차 (폴백): lib/data/schools.json 파일 검색
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// JSON 파일 메모리 캐시 (서버 시작 시 1회 로드)
let jsonCache: Array<{
  id: string;
  name: string;
  type: string;
  sido: string;
  address: string;
}> | null = null;

function loadJsonSchools() {
  if (jsonCache) return jsonCache;
  try {
    const filePath = path.join(process.cwd(), "lib/data/schools.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    jsonCache = JSON.parse(raw);
    return jsonCache!;
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type") || searchParams.get("level") || "";
  const sido = searchParams.get("sido") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 30);

  if (!q || q.length < 1) {
    return NextResponse.json({ data: [] });
  }

  // DB 검색 시도
  try {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");

    let query;
    if (type) {
      query = sql`
        SELECT id, school_code, name, level, address, sido
        FROM schools
        WHERE status = '운영'
          AND name ILIKE ${`%${q}%`}
          AND level = ${type}
        ORDER BY name ASC LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT id, school_code, name, level, address, sido
        FROM schools
        WHERE status = '운영'
          AND name ILIKE ${`%${q}%`}
        ORDER BY name ASC LIMIT ${limit}
      `;
    }

    const results = await db.execute(query);
    const rows = results.rows || results;

    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json({ data: rows });
    }
  } catch {
    // DB 실패 시 JSON 폴백
  }

  // JSON 파일 폴백
  const schools = loadJsonSchools();
  const results = schools
    .filter((s) => {
      if (!s.name.includes(q)) return false;
      if (type && s.type !== type) return false;
      if (sido && !s.sido.includes(sido)) return false;
      return true;
    })
    .slice(0, limit)
    .map((s) => ({
      id: s.id,
      name: s.name,
      level: s.type,
      address: s.address,
      sido: s.sido,
    }));

  return NextResponse.json(
    { data: results },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } }
  );
}
