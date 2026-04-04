import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * GET /api/og/instructor?name=김하늘&topic=흡연예방&rating=4.8&reviews=15
 *
 * 강사 프로필 공유 시 자동 생성되는 OG 이미지
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") || "강사";
  const topic = searchParams.get("topic") || "";
  const rating = searchParams.get("rating") || "0";
  const reviews = searchParams.get("reviews") || "0";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #F8F9FC 0%, #EEF1F8 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* 로고 */}
        <div style={{ fontSize: 16, fontWeight: 700, color: "#2563EB", letterSpacing: "0.15em", marginBottom: 20 }}>
          NAISSER
        </div>

        {/* 아바타 이니셜 */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 30,
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 24,
          }}
        >
          {name.charAt(0)}
        </div>

        {/* 이름 */}
        <div style={{ fontSize: 48, fontWeight: 800, color: "#1A1A1A", marginBottom: 8 }}>
          {name}
        </div>

        {/* 분야 */}
        {topic && (
          <div style={{ fontSize: 20, color: "#6B7280", marginBottom: 16 }}>
            {topic} 전문 강사
          </div>
        )}

        {/* 평점 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20, color: "#F59E0B" }}>★</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#1A1A1A" }}>{rating}</span>
          <span style={{ fontSize: 16, color: "#9CA3AF" }}>({reviews}개 리뷰)</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
