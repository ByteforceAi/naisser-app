/**
 * 강사 공개 프로필 — 디지털 명함 URL
 *
 * naisser.ai.kr/p/AbC123     → shortcode로 직접 렌더 (URL 유지!)
 * naisser.ai.kr/p/김예술      → 이름으로 검색 → shortcode 리다이렉트
 * naisser.ai.kr/p/{uuid}     → ID로 리다이렉트
 *
 * shortcode 매치 시 리다이렉트하지 않고 ProfileBrandPage를 직접 렌더.
 * 이렇게 해야 `/p/AbC123` URL이 유지되어 카카오톡 공유에 적합.
 */

import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { instructors } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { isValidShortcode } from "@/lib/utils/shortcode";
import ProfileBrandPage from "./ProfileBrandPage";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

// OG 메타데이터 동적 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const decoded = decodeURIComponent(slug);

  // shortcode인 경우만 메타데이터 생성
  if (isValidShortcode(decoded)) {
    const [inst] = await db
      .select({
        instructorName: instructors.instructorName,
        topics: instructors.topics,
        averageRating: instructors.averageRating,
        reviewCount: instructors.reviewCount,
      })
      .from(instructors)
      .where(eq(instructors.shortcode, decoded))
      .limit(1);

    if (inst) {
      const topicStr = inst.topics?.[0] || "";
      return {
        title: `${inst.instructorName} - 나이써`,
        description: `${inst.instructorName} 강사 프로필 | ${topicStr ? topicStr + " 전문 | " : ""}평점 ${inst.averageRating} | 리뷰 ${inst.reviewCount}개`,
        openGraph: {
          title: `${inst.instructorName} - 나이써`,
          description: `${topicStr ? topicStr + " 전문강사" : "전문강사"} | 평점 ${inst.averageRating}`,
          images: [
            {
              url: `/api/og/instructor?name=${encodeURIComponent(inst.instructorName)}&topic=${encodeURIComponent(topicStr)}&rating=${inst.averageRating}&reviews=${inst.reviewCount}`,
              width: 1200,
              height: 630,
            },
          ],
        },
      };
    }
  }

  return { title: "강사 프로필 - 나이써" };
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = params;
  const decoded = decodeURIComponent(slug);

  // 1) shortcode (6자 영숫자) → 직접 렌더 (URL 유지!)
  if (isValidShortcode(decoded)) {
    const [inst] = await db
      .select({ id: instructors.id })
      .from(instructors)
      .where(eq(instructors.shortcode, decoded))
      .limit(1);

    if (inst) {
      return <ProfileBrandPage instructorId={inst.id} />;
    }
  }

  // 2) UUID 형태 → 기존 프로필 페이지로 리다이렉트
  if (decoded.match(/^[0-9a-f-]{36}$/i)) {
    redirect(`/instructor/${decoded}`);
  }

  // 3) 이름 정확 매치 → shortcode가 있으면 shortcode URL로, 없으면 기존 프로필로
  const [byName] = await db
    .select({ id: instructors.id, shortcode: instructors.shortcode })
    .from(instructors)
    .where(eq(instructors.instructorName, decoded))
    .limit(1);

  if (byName) {
    if (byName.shortcode) {
      redirect(`/p/${byName.shortcode}`);
    }
    redirect(`/instructor/${byName.id}`);
  }

  // 4) 부분 이름 검색 (ILIKE)
  const [partial] = await db
    .select({ id: instructors.id, shortcode: instructors.shortcode })
    .from(instructors)
    .where(sql`${instructors.instructorName} ILIKE ${`%${decoded}%`}`)
    .limit(1);

  if (partial) {
    if (partial.shortcode) {
      redirect(`/p/${partial.shortcode}`);
    }
    redirect(`/instructor/${partial.id}`);
  }

  notFound();
}
