import { SNS_PLATFORMS } from "@/lib/constants/sns";

/** SNS URL을 platform:fullUrl 정규 형식으로 변환 */
export function normalizeSnsUrl(platform: string, input: string): string {
  const platformInfo = SNS_PLATFORMS.find((p) => p.id === platform);
  if (!platformInfo) return `${platform}:${input}`;

  // 이미 전체 URL이면 그대로 사용
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return `${platform}:${input}`;
  }

  // baseUrl이 있으면 결합
  if (platformInfo.baseUrl) {
    const username = input.replace(/^@/, "");
    return `${platform}:${platformInfo.baseUrl}${username}`;
  }

  return `${platform}:${input}`;
}

/** platform:fullUrl 형식에서 파싱 */
export function parseSnsEntry(entry: string): {
  platform: string;
  url: string;
} {
  const colonIdx = entry.indexOf(":");
  if (colonIdx === -1) return { platform: "website", url: entry };
  return {
    platform: entry.slice(0, colonIdx),
    url: entry.slice(colonIdx + 1),
  };
}
