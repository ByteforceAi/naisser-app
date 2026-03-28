/**
 * 학교 검색 API — 자동완성용
 * GET: 학교명으로 검색 (최대 10건)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const level = searchParams.get("level"); // 초등학교, 중학교, 고등학교
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 30);

  if (!q || q.length < 1) {
    return NextResponse.json({ data: [] });
  }

  try {
    let query = sql`
      SELECT id, school_code, name, level, address, sido, district, latitude, longitude
      FROM schools
      WHERE status = '운영'
        AND name ILIKE ${`%${q}%`}
    `;

    if (level) {
      query = sql`
        SELECT id, school_code, name, level, address, sido, district, latitude, longitude
        FROM schools
        WHERE status = '운영'
          AND name ILIKE ${`%${q}%`}
          AND level = ${level}
      `;
    }

    query = sql`${query} ORDER BY name ASC LIMIT ${limit}`;

    const results = await db.execute(query);

    return NextResponse.json({
      data: results.rows || results,
    });
  } catch (error) {
    console.error("[GET /api/schools/search]", error);
    return NextResponse.json(
      { error: "학교 검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
