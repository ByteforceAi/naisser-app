/**
 * 에러 트래킹 — Sentry 연동 준비
 *
 * 현재는 콘솔 로그 + localStorage 저장
 * Sentry DSN 설정 후 실제 전송으로 전환
 */

interface ErrorEvent {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
  url: string;
  userAgent: string;
}

const ERROR_LOG_KEY = "naisser_errors";
const MAX_ERRORS = 50;

export function captureError(error: Error, context?: Record<string, unknown>) {
  const event: ErrorEvent = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };

  // 콘솔 로그
  console.error("[NAISSER Error]", event);

  // localStorage에 최근 에러 저장
  try {
    const stored = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || "[]") as ErrorEvent[];
    stored.unshift(event);
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(stored.slice(0, MAX_ERRORS)));
  } catch { /* */ }

  // TODO: Sentry 연동
  // if (typeof Sentry !== "undefined") {
  //   Sentry.captureException(error, { extra: context });
  // }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  console.log(`[NAISSER ${level}]`, message);
  // TODO: Sentry.captureMessage(message, level);
}

/**
 * API 에러 래퍼
 * 사용: const data = await safeFetch("/api/...");
 */
export async function safeFetch<T>(url: string, options?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      captureMessage(`API error: ${url} ${res.status} ${text}`, "warning");
      return { data: null, error: `${res.status}: ${text}` };
    }
    const json = await res.json();
    return { data: json.data ?? json, error: null };
  } catch (err) {
    captureError(err instanceof Error ? err : new Error(String(err)), { url });
    return { data: null, error: "네트워크 오류" };
  }
}
