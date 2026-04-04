/**
 * Rate Limiting 유틸
 *
 * Upstash Redis 연동 전까지 인메모리 구현
 * 새 계정 게시 제한, API 호출 제한 등
 */

const requestCounts = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  windowMs: number;   // 시간 윈도우 (밀리초)
  maxRequests: number; // 윈도우 내 최대 요청 수
}

const CONFIGS: Record<string, RateLimitConfig> = {
  "post:create": { windowMs: 60_000, maxRequests: 5 },      // 분당 글 5개
  "comment:create": { windowMs: 60_000, maxRequests: 20 },   // 분당 댓글 20개
  "like": { windowMs: 60_000, maxRequests: 60 },             // 분당 좋아요 60개
  "report": { windowMs: 3600_000, maxRequests: 5 },          // 시간당 신고 5개
  "search": { windowMs: 60_000, maxRequests: 30 },           // 분당 검색 30개
  "upload": { windowMs: 300_000, maxRequests: 10 },          // 5분당 업로드 10개
};

export function checkRateLimit(action: string, identifier: string): { allowed: boolean; remaining: number } {
  const config = CONFIGS[action];
  if (!config) return { allowed: true, remaining: 999 };

  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count };
}

/**
 * 새 계정 제한 — 가입 후 24시간 이내 계정은 기능 제한
 */
export function isNewAccount(createdAt: string | Date): boolean {
  const created = new Date(createdAt).getTime();
  const hoursSinceCreation = (Date.now() - created) / (1000 * 60 * 60);
  return hoursSinceCreation < 24;
}

export function getNewAccountLimits() {
  return {
    maxPostsPerDay: 3,
    maxCommentsPerDay: 10,
    canCreatePoll: false,
    canUploadImages: true,
  };
}
