/**
 * 커스텀 이벤트 분석
 *
 * Vercel Analytics 기본 + 커스텀 이벤트 추적
 */

export function trackEvent(name: string, props?: Record<string, string | number>) {
  // Vercel Analytics
  if (typeof window !== "undefined" && (window as unknown as { va?: (cmd: string, data: unknown) => void }).va) {
    (window as unknown as { va: (cmd: string, data: unknown) => void }).va("event", { name, ...props });
  }

  // 콘솔 로그 (개발)
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${name}`, props);
  }
}

// 미리 정의된 이벤트
export const EVENTS = {
  // 커뮤니티
  POST_CREATE: "post_create",
  POST_LIKE: "post_like",
  POST_HELPFUL: "post_helpful",
  POST_BOOKMARK: "post_bookmark",
  POST_SHARE: "post_share",
  COMMENT_CREATE: "comment_create",
  SEARCH: "search",
  TAB_CHANGE: "tab_change",
  REGION_FILTER: "region_filter",

  // 프로필
  PROFILE_VIEW: "profile_view",
  PROFILE_SHARE: "profile_share",
  SNS_CLICK: "sns_click",

  // 인증
  LOGIN: "login",
  SIGNUP: "signup",
  ROLE_SELECT: "role_select",

  // 강사
  REQUEST_SEND: "request_send",
  DOCUMENT_UPLOAD: "document_upload",
} as const;
