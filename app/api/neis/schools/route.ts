import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** NEIS 학교검색 프록시 — ?q=키워드 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: "검색어를 2자 이상 입력해주세요." },
      { status: 400 }
    );
  }

  // TODO: NEIS 교육정보 개방포털 API 호출
  // const apiKey = process.env.NEIS_API_KEY;
  // const res = await fetch(`https://open.neis.go.kr/hub/schoolInfo?KEY=${apiKey}&Type=json&SCHUL_NM=${encodeURIComponent(query)}`);

  // 임시 더미 응답
  const mockResults = [
    { schoolCode: "7010057", schoolName: "해강초등학교", educationOffice: "서울특별시교육청", region: "서울" },
    { schoolCode: "7010058", schoolName: "해강중학교", educationOffice: "서울특별시교육청", region: "서울" },
  ].filter((s) => s.schoolName.includes(query));

  return NextResponse.json({ data: mockResults });
}
