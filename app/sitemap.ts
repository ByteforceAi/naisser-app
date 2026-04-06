import { MetadataRoute } from "next";
import { neon } from "@neondatabase/serverless";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://naisser.ai.kr";

  // ── 정적 페이지 ──
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/community`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/teacher/home`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/instructor/preview`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/auth/select-role`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/community/guidelines`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // ── 동적 강사 프로필 페이지 ──
  let instructorPages: MetadataRoute.Sitemap = [];

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const instructors = await sql`
      SELECT id, shortcode FROM instructors WHERE shortcode IS NOT NULL
    `;

    instructorPages = instructors.flatMap((instructor) => {
      const pages: MetadataRoute.Sitemap = [];

      // /p/{shortcode} — 공개 프로필 (숏코드)
      if (instructor.shortcode) {
        pages.push({
          url: `${baseUrl}/p/${instructor.shortcode}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }

      // /instructor/{id} — 강사 상세
      pages.push({
        url: `${baseUrl}/instructor/${instructor.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });

      return pages;
    });
  } catch (error) {
    // DB 연결 실패 시 정적 페이지만 반환
    console.error("Sitemap: 강사 프로필 조회 실패", error);
  }

  return [...staticPages, ...instructorPages];
}
