/**
 * 학교 마스터 DB 임포트 스크립트
 * 실행: npx tsx scripts/import-schools.ts
 *
 * schools.json → Neon PostgreSQL schools 테이블
 */

import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

// .env.local에서 DATABASE_URL 읽기
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const dbMatch = envContent.match(/DATABASE_URL=["']?([^\s"']+)/);
const DATABASE_URL = dbMatch?.[1] || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL 환경변수가 필요합니다.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

interface SchoolData {
  schoolCode: string;
  name: string;
  level: string;
  address: string;
  sido: string;
  district: string;
  latitude: string;
  longitude: string;
}

async function main() {
  const jsonPath = path.join(__dirname, "schools.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const schools: SchoolData[] = JSON.parse(raw);

  console.log(`📚 ${schools.length}개 학교 데이터 로드`);

  // 배치 INSERT (100개씩)
  const BATCH_SIZE = 100;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < schools.length; i += BATCH_SIZE) {
    const batch = schools.slice(i, i + BATCH_SIZE);

    const values = batch
      .map(
        (s) =>
          `(gen_random_uuid(), '${s.schoolCode}', '${s.name.replace(/'/g, "''")}', '${s.level}', '${(s.address || "").replace(/'/g, "''")}', '${(s.sido || "").replace(/'/g, "''")}', '${(s.district || "").replace(/'/g, "''")}', ${s.latitude || "NULL"}, ${s.longitude || "NULL"}, '운영')`
      )
      .join(",\n");

    try {
      const query = `INSERT INTO schools (id, school_code, name, level, address, sido, district, latitude, longitude, status) VALUES ${values} ON CONFLICT (school_code) DO NOTHING`;
      await sql.query(query);
      inserted += batch.length;
    } catch (err) {
      console.error(`❌ 배치 ${i}~${i + BATCH_SIZE} 실패:`, err);
      skipped += batch.length;
    }

    if ((i / BATCH_SIZE) % 10 === 0) {
      console.log(`  진행: ${i + batch.length}/${schools.length}`);
    }
  }

  console.log(`\n✅ 완료: ${inserted}개 삽입, ${skipped}개 스킵`);
}

main().catch(console.error);
