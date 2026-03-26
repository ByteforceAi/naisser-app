/** SNS 플랫폼 정의 */
export const SNS_PLATFORMS = [
  { id: "instagram", label: "인스타그램", baseUrl: "https://instagram.com/", placeholder: "사용자명 또는 전체 URL" },
  { id: "youtube", label: "유튜브", baseUrl: "https://youtube.com/", placeholder: "채널 URL" },
  { id: "blog", label: "블로그", baseUrl: "", placeholder: "블로그 URL" },
  { id: "website", label: "웹사이트", baseUrl: "", placeholder: "웹사이트 URL" },
  { id: "tiktok", label: "틱톡", baseUrl: "https://tiktok.com/@", placeholder: "사용자명 또는 전체 URL" },
  { id: "facebook", label: "페이스북", baseUrl: "https://facebook.com/", placeholder: "프로필 URL" },
] as const;

export type SnsPlatform = (typeof SNS_PLATFORMS)[number]["id"];
