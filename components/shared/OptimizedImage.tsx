"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * OptimizedImage — next/image 래퍼
 *
 * - WebP 자동 변환
 * - blur placeholder (색상 기반)
 * - lazy loading 기본
 * - 에러 시 폴백 표시
 *
 * 사용: <OptimizedImage src={url} alt="" width={300} height={200} />
 */
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  rounded?: string; // "xl", "2xl", "full" 등
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  priority = false,
  sizes,
  rounded = "xl",
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--bg-elevated)] rounded-${rounded} ${className}`}
        style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}
      >
        <span className="text-[var(--text-muted)] text-[11px]">이미지 없음</span>
      </div>
    );
  }

  // Vercel Blob URL이면 next/image 최적화 가능
  const isExternal = src.startsWith("http") && !src.includes("vercel");

  if (isExternal) {
    // 외부 이미지는 일반 img 태그 + blur-up
    return (
      <div className={`relative overflow-hidden rounded-${rounded} ${className}`}
        style={{ width: fill ? "100%" : width, height: fill ? "100%" : height }}>
        <div className={`absolute inset-0 bg-[var(--bg-elevated)] transition-opacity duration-300 ${loaded ? "opacity-0" : "opacity-100"}`} />
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-${rounded} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : (width || 300)}
        height={fill ? undefined : (height || 200)}
        fill={fill}
        sizes={sizes || "(max-width: 520px) 100vw, 520px"}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        placeholder="empty"
      />
      <div className={`absolute inset-0 bg-[var(--bg-elevated)] transition-opacity duration-300 ${loaded ? "opacity-0" : "opacity-100"}`} />
    </div>
  );
}
