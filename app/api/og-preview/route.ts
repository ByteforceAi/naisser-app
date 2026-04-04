import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/og-preview?url=...
 * URL에서 OG 메타데이터를 추출하여 링크 프리뷰 데이터 반환
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url 파라미터가 필요합니다" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "NAISSER-Bot/1.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return NextResponse.json({ error: "URL을 불러올 수 없습니다" }, { status: 400 });

    const html = await res.text();

    // OG 메타 태그 파싱 (간단한 정규식)
    const getOG = (property: string): string => {
      const regex = new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']*)["']`, "i");
      const altRegex = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:${property}["']`, "i");
      return regex.exec(html)?.[1] || altRegex.exec(html)?.[1] || "";
    };

    // fallback: <title> 태그
    const titleTag = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] || "";
    const descTag = /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i.exec(html)?.[1] || "";

    const data = {
      title: getOG("title") || titleTag,
      description: getOG("description") || descTag,
      image: getOG("image"),
      siteName: getOG("site_name"),
      url,
    };

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "프리뷰를 가져올 수 없습니다" }, { status: 500 });
  }
}
