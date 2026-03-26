/**
 * CSV 강사 데이터 → Neon DB 마이그레이션
 *
 * 실행: npx tsx scripts/migrate-csv.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// ─── 카테고리 매핑 (한국어 라벨 → camelCase ID) ───
const TOPIC_MAP: Record<string, string> = {
  "흡연예방": "smokingPrevention",
  "성인지": "genderAwareness",
  "장애인식": "disabilityMulticultural",
  "다문화": "multicultural",
  "진로직업": "careerJob",
  "진로": "careerJob",
  "요리": "cookingBaking",
  "체육": "sportsPhysical",
  "독서·글쓰기": "readingWriting",
  "독서글쓰기": "readingWriting",
  "과학": "science",
  "음악": "music",
  "환경,생명존중": "environmentEcology",
  "환경": "environmentEcology",
  "인성·학폭예방": "characterBullying",
  "인성학폭예방": "characterBullying",
  "AI·디지털": "aiDigital",
  "AI디지털": "aiDigital",
  "교직원연수": "staffTraining",
  "기타": "etc",
  "안전": "etc",
  "경제": "etc",
};

const METHOD_MAP: Record<string, string> = {
  "강의": "lecture",
  "공예": "craft",
  "샌드아트": "sandArt",
  "마술": "magic",
  "공연": "performance",
  "실습·체험": "practiceExperience",
  "실습체험": "practiceExperience",
  "현장탐방": "fieldTrip",
  "동화구연": "storytelling",
  "토의·토론": "debateDiscussion",
  "토의토론": "debateDiscussion",
  "인형극": "puppetShow",
  "온라인공동작업": "onlineCollaboration",
  "1:1 상담": "oneOnOneConsulting",
  "비대면": "remote",
  "기타": "etc",
};

const REGION_MAP: Record<string, string> = {
  "서울·인천·경기": "metropolitan",
  "서울인천경기": "metropolitan",
  "대전·충남": "daejeonChungnam",
  "대전충남": "daejeonChungnam",
  "세종·충북": "chungbuk",
  "충북": "chungbuk",
  "충북권": "chungbuk",
  "부산·울산·경남": "busanGyeongnam",
  "부산경남": "busanGyeongnam",
  "대구·경북": "daeguGyeongbuk",
  "대구경북": "daeguGyeongbuk",
  "강원": "gangwon",
  "광주·전남": "gwangjuJeonnam",
  "광주전남": "gwangjuJeonnam",
  "전북": "jeonbuk",
  "제주": "jeju",
};

function mapCategories(csvValue: string, mapping: Record<string, string>): string[] {
  if (!csvValue || csvValue.trim() === "") return [];
  return csvValue
    .split(",")
    .map((s) => s.trim())
    .map((label) => {
      // 정확한 매핑 먼저
      if (mapping[label]) return mapping[label];
      // 부분 매칭
      for (const [key, val] of Object.entries(mapping)) {
        if (label.includes(key) || key.includes(label)) return val;
      }
      return "etc";
    })
    .filter((v, i, arr) => arr.indexOf(v) === i); // 중복 제거
}

function parseSns(snsValue: string): string[] {
  if (!snsValue || snsValue.trim() === "") return [];
  return snsValue
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((url) => {
      if (url.includes("instagram.com")) return `instagram:${url}`;
      if (url.includes("blog.naver.com")) return `blog:${url}`;
      if (url.includes("youtube.com")) return `youtube:${url}`;
      if (url.includes("smartstore.naver")) return `website:${url}`;
      return `website:${url}`;
    });
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter(Boolean);
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h.trim()] = (values[i] || "").trim(); });
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += char;
  }
  result.push(current);
  return result;
}

async function main() {
  console.log("=== NAISSER CSV 마이그레이션 시작 ===\n");

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const csvPath = path.join(__dirname, "instructors.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csvContent);

  console.log(`CSV 로드: ${rows.length}명\n`);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const name = row["강사명/업체명"] || "";
    const phone = row["연락처"] || "";

    if (!name || !phone) {
      console.log(`⏭ SKIP (이름/전화번호 없음): ${name || "(없음)"}`);
      skipped++;
      continue;
    }

    const topics = mapCategories(row["강의주제"] || "", TOPIC_MAP);
    const methods = mapCategories(row["강의방법"] || "", METHOD_MAP);
    const regions = mapCategories(row["지역"] || "", REGION_MAP);
    const snsAccounts = parseSns(row["SNS"] || "");

    if (topics.length === 0) topics.push("etc");
    if (methods.length === 0) methods.push("lecture");
    if (regions.length === 0) regions.push("metropolitan");

    const id = crypto.randomUUID();

    try {
      await sql`INSERT INTO instructors (
        id, instructor_name, phone, status,
        topics, methods, regions,
        sns_accounts, bio, career,
        agreed_to_terms, agreed_to_privacy, agreed_at,
        is_early_bird, early_bird_granted_at,
        created_at, updated_at
      ) VALUES (
        ${id}, ${name}, ${phone}, 'new',
        ${topics}, ${methods}, ${regions},
        ${snsAccounts}, ${row["자기소개"] || null}, ${row["주요경력"] || null},
        true, true, NOW(),
        true, NOW(),
        NOW(), NOW()
      ) ON CONFLICT (phone) DO NOTHING`;

      console.log(`✅ ${name} (${phone}) → topics: [${topics.join(",")}]`);
      success++;
    } catch (err) {
      console.error(`❌ ${name}: ${err}`);
      errors++;
    }
  }

  console.log(`\n=== 결과 ===`);
  console.log(`성공: ${success}, 스킵: ${skipped}, 에러: ${errors}`);
  console.log(`총: ${success + skipped + errors}/${rows.length}`);
}

main().catch(console.error);
