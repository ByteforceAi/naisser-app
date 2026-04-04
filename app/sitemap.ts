import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://naisser.ai.kr";

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/community`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/teacher/home`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/auth/select-role`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/community/guidelines`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    // TODO: 동적으로 강사 프로필, 커뮤니티 게시글 URL 추가
  ];
}
