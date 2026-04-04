/**
 * 키워드 모니터링 — 특정 키워드 포함 글 자동 감지
 *
 * 관리자가 설정한 키워드가 포함된 글이 작성되면 알림
 * 예: "사기", "먹튀", "단가 담합" 등
 */

const MONITOR_KEY = "naisser_monitored_keywords";

// 기본 모니터링 키워드
const DEFAULT_KEYWORDS = [
  "사기",
  "먹튀",
  "소송",
  "법적",
  "담합",
  "폭로",
];

export function getMonitoredKeywords(): string[] {
  try {
    const saved = localStorage.getItem(MONITOR_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_KEYWORDS;
  } catch {
    return DEFAULT_KEYWORDS;
  }
}

export function addKeyword(keyword: string) {
  const kws = getMonitoredKeywords();
  if (!kws.includes(keyword)) {
    kws.push(keyword);
    localStorage.setItem(MONITOR_KEY, JSON.stringify(kws));
  }
}

export function removeKeyword(keyword: string) {
  const kws = getMonitoredKeywords().filter((k) => k !== keyword);
  localStorage.setItem(MONITOR_KEY, JSON.stringify(kws));
}

/**
 * 게시글 텍스트에 모니터링 키워드가 포함되어 있는지 확인
 */
export function checkForMonitoredKeywords(text: string): string[] {
  const keywords = getMonitoredKeywords();
  return keywords.filter((kw) => text.includes(kw));
}
