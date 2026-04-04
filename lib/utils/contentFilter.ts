/**
 * 콘텐츠 필터링 — 비속어/금칙어 감지 + 마스킹
 *
 * 사용:
 *   filterContent("시발 이거 진짜") → { filtered: "*** 이거 진짜", hasViolation: true }
 */

// 기본 금칙어 목록 (확장 가능)
const BLOCKED_WORDS = [
  "시발", "씨발", "개새끼", "병신", "지랄", "좆", "닥쳐",
  "꺼져", "미친놈", "미친년", "ㅅㅂ", "ㅂㅅ", "ㅈㄹ",
];

// 광고성 키워드
const SPAM_PATTERNS = [
  /카톡\s*[A-Za-z0-9]+/,
  /텔레그램/,
  /\d{3}-\d{4}-\d{4}/,  // 전화번호 패턴
  /bit\.ly/,
  /수익.*보장/,
  /무료.*상담/,
];

interface FilterResult {
  filtered: string;
  hasViolation: boolean;
  violationType?: "profanity" | "spam" | "personal_info";
  matchedWords?: string[];
}

export function filterContent(text: string): FilterResult {
  let filtered = text;
  const matchedWords: string[] = [];
  let hasViolation = false;
  let violationType: FilterResult["violationType"];

  // 비속어 필터
  for (const word of BLOCKED_WORDS) {
    if (filtered.includes(word)) {
      filtered = filtered.replaceAll(word, "*".repeat(word.length));
      matchedWords.push(word);
      hasViolation = true;
      violationType = "profanity";
    }
  }

  // 스팸 패턴
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(filtered)) {
      hasViolation = true;
      violationType = violationType || "spam";
    }
  }

  return { filtered, hasViolation, violationType, matchedWords };
}

/**
 * 게시 전 검증 — 프론트에서 호출
 * true면 게시 가능, false면 차단
 */
export function canPublish(text: string): { ok: boolean; reason?: string } {
  const result = filterContent(text);

  if (result.violationType === "profanity") {
    return { ok: false, reason: "부적절한 표현이 포함되어 있습니다" };
  }
  if (result.violationType === "spam") {
    return { ok: false, reason: "광고성 콘텐츠는 게시할 수 없습니다" };
  }
  if (text.trim().length < 5) {
    return { ok: false, reason: "5자 이상 작성해주세요" };
  }

  return { ok: true };
}
