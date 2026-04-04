/**
 * 이미지 URL 유틸 — CDN 리사이징 + WebP 변환
 *
 * Vercel Blob 이미지에 대해 자동 리사이징/포맷 변환
 * Next.js Image Optimization API 활용
 */

/**
 * 이미지 URL에 리사이징 파라미터 추가
 *
 * 사용: getOptimizedUrl(url, { width: 300, quality: 75 })
 * → /_next/image?url=...&w=300&q=75
 */
export function getOptimizedUrl(
  src: string,
  options: { width?: number; quality?: number } = {}
): string {
  const { width = 640, quality = 75 } = options;

  // Vercel Blob URL인 경우 Next.js 이미지 최적화 사용
  if (src.includes("blob.vercel-storage.com")) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
  }

  // 외부 URL은 그대로
  return src;
}

/**
 * 썸네일 URL 생성
 */
export function getThumbnailUrl(src: string): string {
  return getOptimizedUrl(src, { width: 200, quality: 60 });
}

/**
 * 프로필 이미지 URL (작은 사이즈)
 */
export function getProfileImageUrl(src: string): string {
  return getOptimizedUrl(src, { width: 96, quality: 80 });
}

/**
 * 커버 이미지 URL (큰 사이즈)
 */
export function getCoverImageUrl(src: string): string {
  return getOptimizedUrl(src, { width: 1200, quality: 80 });
}

/**
 * 커뮤니티 피드 이미지 (중간 사이즈)
 */
export function getFeedImageUrl(src: string): string {
  return getOptimizedUrl(src, { width: 520, quality: 75 });
}
