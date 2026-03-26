/**
 * Rate Limiting — @upstash/ratelimit
 * docs/CLAUDE.md 규칙:
 *  - 등록 API: 5회/분
 *  - 일반 API: 60회/분
 *
 * 환경변수 미설정 시 graceful passthrough (개발환경 대응)
 */

import { NextResponse } from "next/server";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

let _ratelimitGeneral: { limit: (id: string) => Promise<RateLimitResult> } | null = null;
let _ratelimitStrict: { limit: (id: string) => Promise<RateLimitResult> } | null = null;
let _initialized = false;

async function initRateLimiters() {
  if (_initialized) return;
  _initialized = true;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("[rate-limit] UPSTASH 환경변수 미설정 — rate limiting 비활성화");
    return;
  }

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    _ratelimitGeneral = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "naisser:general",
    });

    _ratelimitStrict = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "naisser:strict",
    });
  } catch (err) {
    console.warn("[rate-limit] 초기화 실패:", err);
  }
}

/** 일반 API rate limit (60회/분) */
export async function rateLimitGeneral(
  identifier: string
): Promise<NextResponse | null> {
  await initRateLimiters();
  if (!_ratelimitGeneral) return null; // 비활성화 — 통과

  const result = await _ratelimitGeneral.limit(identifier);
  if (!result.success) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
          "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
        },
      }
    );
  }
  return null;
}

/** 등록 API rate limit (5회/분) */
export async function rateLimitStrict(
  identifier: string
): Promise<NextResponse | null> {
  await initRateLimiters();
  if (!_ratelimitStrict) return null;

  const result = await _ratelimitStrict.limit(identifier);
  if (!result.success) {
    return NextResponse.json(
      { error: "등록 요청이 너무 많습니다. 1분 후 다시 시도해주세요." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
          "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
        },
      }
    );
  }
  return null;
}
