"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useVirtualScroll — 가상 스크롤 훅
 *
 * 100+ 아이템에서 DOM 노드를 재활용하여 성능 유지
 * 뷰포트에 보이는 아이템만 렌더
 *
 * 사용:
 *   const { visibleItems, containerRef, totalHeight } = useVirtualScroll({
 *     items: posts,
 *     itemHeight: 200, // 추정 높이
 *     overscan: 3,     // 위아래 여유
 *   });
 */

interface UseVirtualScrollConfig<T> {
  items: T[];
  itemHeight: number; // 각 아이템의 추정 높이(px)
  overscan?: number;  // 뷰포트 밖에 추가 렌더할 아이템 수
}

interface VirtualItem<T> {
  item: T;
  index: number;
  offsetTop: number;
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  overscan = 3,
}: UseVirtualScrollConfig<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => setScrollTop(el.scrollTop);
    const onResize = () => setViewportHeight(el.clientHeight);

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const totalHeight = items.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan
  );

  const visibleItems: VirtualItem<T>[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    visibleItems.push({
      item: items[i],
      index: i,
      offsetTop: i * itemHeight,
    });
  }

  return {
    containerRef,
    visibleItems,
    totalHeight,
    startIndex,
    endIndex,
  };
}
