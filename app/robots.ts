import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/onboarding/",
          "/instructor/profile/edit",
          "/instructor/documents",
          "/instructor/ledger",
          "/instructor/settings",
        ],
      },
    ],
    sitemap: "https://naisser.ai.kr/sitemap.xml",
  };
}
