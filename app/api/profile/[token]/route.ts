import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** 매직링크 토큰으로 프로필 조회 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  void params.token;
  // TODO: magic_links 테이블에서 token 조회
  // - 만료 여부 확인
  // - 사용 이력 확인
  // - instructor 정보 반환
  return NextResponse.json(
    { error: "유효하지 않은 링크입니다." },
    { status: 404 }
  );
}

/** 매직링크로 프로필 수정 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  void params.token;
  const body = await request.json();
  void body;
  // TODO: magic_links 토큰 검증 (type=edit인지, 만료 안 됐는지)
  // TODO: instructor 정보 업데이트
  // TODO: used_at 기록
  return NextResponse.json(
    { error: "유효하지 않은 링크입니다." },
    { status: 404 }
  );
}
