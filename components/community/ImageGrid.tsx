"use client";

import { cn } from "@/lib/utils/cn";
import Image from "next/image";

interface ImageGridProps {
  images: string[];
  className?: string;
}

/** 이미지 그리드 — 1장=풀, 2장=2열, 3장=1+2, 4장=2×2 */
export function ImageGrid({ images, className }: ImageGridProps) {
  if (!images || images.length === 0) return null;

  const count = Math.min(images.length, 4);

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        count === 1 && "aspect-[4/3]",
        count === 2 && "grid grid-cols-2 gap-0.5 aspect-[2/1]",
        count === 3 && "grid grid-cols-2 grid-rows-2 gap-0.5 aspect-[4/3]",
        count === 4 && "grid grid-cols-2 grid-rows-2 gap-0.5 aspect-square",
        className
      )}
    >
      {images.slice(0, 4).map((src, i) => (
        <div
          key={i}
          className={cn(
            "relative bg-[var(--bg-elevated)] overflow-hidden",
            count === 3 && i === 0 && "row-span-2"
          )}
        >
          <Image
            src={src}
            alt={`이미지 ${i + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}
