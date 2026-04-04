/**
 * 동영상 URL에서 임베드 가능한 형태로 변환
 *
 * 지원: YouTube, 네이버TV
 * 사용: const embed = getVideoEmbed("https://youtube.com/watch?v=xxx");
 *       if (embed) return <iframe src={embed.embedUrl} />;
 */

interface VideoEmbed {
  platform: "youtube" | "naver";
  embedUrl: string;
  thumbnailUrl: string;
}

export function getVideoEmbed(url: string): VideoEmbed | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return {
      platform: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
    };
  }

  // 네이버TV
  const naverMatch = url.match(/tv\.naver\.com\/v\/(\d+)/);
  if (naverMatch) {
    return {
      platform: "naver",
      embedUrl: `https://tv.naver.com/embed/${naverMatch[1]}`,
      thumbnailUrl: "", // 네이버TV는 OG에서 가져와야 함
    };
  }

  return null;
}

/**
 * 텍스트에서 첫 번째 비디오 URL 추출
 */
export function extractVideoUrl(text: string): string | null {
  const match = text.match(/(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|tv\.naver\.com\/v\/)\S+)/);
  return match ? match[1] : null;
}
