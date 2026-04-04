/**
 * Pretext 기반 텍스트 높이 측정 유틸
 *
 * DOM reflow 없이 텍스트의 렌더링 높이를 계산합니다.
 * - 커뮤니티 피드 카드 높이 예측 (가상 스크롤)
 * - 온보딩 챗봇 버블 높이 예측 (스크롤 점프 제거)
 * - AI 스트리밍 응답 높이 예측 (앵커 유지)
 *
 * @see https://github.com/chenglou/pretext
 */

let pretextModule: typeof import("@chenglou/pretext") | null = null;

async function loadPretext() {
  if (pretextModule) return pretextModule;
  try {
    pretextModule = await import("@chenglou/pretext");
    return pretextModule;
  } catch {
    return null;
  }
}

/**
 * 텍스트 높이를 DOM 없이 계산
 *
 * @param text - 측정할 텍스트
 * @param font - CSS 폰트 문자열 (예: "15px Pretendard")
 * @param containerWidth - 컨테이너 너비 (px)
 * @param lineHeight - 줄 높이 (px)
 * @returns { height, lineCount } 또는 null (Pretext 로드 실패 시)
 */
export async function measureTextHeight(
  text: string,
  font: string = "15px Pretendard",
  containerWidth: number = 340,
  lineHeight: number = 24
): Promise<{ height: number; lineCount: number } | null> {
  const pretext = await loadPretext();
  if (!pretext) return null;

  try {
    const prepared = pretext.prepare(text, font);
    const result = pretext.layout(prepared, containerWidth, lineHeight);
    return { height: result.height, lineCount: result.lineCount };
  } catch {
    return null;
  }
}

/**
 * 동기 버전 — Pretext가 이미 로드된 경우에만 사용
 * 초기 로드 후 반복 호출에 적합
 */
export function measureTextHeightSync(
  text: string,
  font: string = "15px Pretendard",
  containerWidth: number = 340,
  lineHeight: number = 24
): { height: number; lineCount: number } | null {
  if (!pretextModule) return null;

  try {
    const prepared = pretextModule.prepare(text, font);
    const result = pretextModule.layout(prepared, containerWidth, lineHeight);
    return { height: result.height, lineCount: result.lineCount };
  } catch {
    return null;
  }
}

/**
 * Pretext 프리로드 — 앱 시작 시 1회 호출
 * 스플래시 스크린 동안 호출하면 메인 콘텐츠 로드 시 즉시 사용 가능
 */
export async function preloadPretext(): Promise<boolean> {
  const m = await loadPretext();
  return !!m;
}
