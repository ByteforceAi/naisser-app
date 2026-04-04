/**
 * 읽기 시간 추정
 *
 * 한글 기준 분당 500자 (영어보다 빠름)
 * 1분 이하면 표시 안 함, 2분 이상이면 "약 N분 읽기"
 */
export function estimateReadTime(text: string): string | null {
  const charCount = text.replace(/\s/g, "").length;
  const minutes = Math.ceil(charCount / 500);
  if (minutes <= 1) return null;
  return `약 ${minutes}분`;
}
