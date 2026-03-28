/**
 * 강사 공개 프로필 — 명함 URL
 *
 * naisser.ai.kr/p/김예술     → 이름으로 검색
 * naisser.ai.kr/p/abc123     → ID로 검색
 *
 * 강사가 명함, SNS, 포트폴리오에 이 링크를 넣음.
 * 비로그인 유저도 볼 수 있음 (연락처만 마스킹).
 */

import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

interface Props {
  params: { slug: string };
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = params;
  const decoded = decodeURIComponent(slug);

  // 1) UUID 형태면 직접 조회
  if (decoded.match(/^[0-9a-f-]{36}$/i)) {
    redirect(`/instructor/${decoded}`);
  }

  // 2) 이름으로 검색
  const [instructor] = await db
    .select({ id: instructors.id })
    .from(instructors)
    .where(eq(instructors.instructorName, decoded))
    .limit(1);

  if (instructor) {
    redirect(`/instructor/${instructor.id}`);
  }

  // 3) 부분 이름 검색 (ILIKE)
  const [partial] = await db
    .select({ id: instructors.id })
    .from(instructors)
    .where(sql`${instructors.instructorName} ILIKE ${`%${decoded}%`}`)
    .limit(1);

  if (partial) {
    redirect(`/instructor/${partial.id}`);
  }

  notFound();
}
