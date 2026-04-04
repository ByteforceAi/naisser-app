"use client";

import { useMemo, useEffect, useState } from "react";

/**
 * usePretextHeight — Pretext 기반 텍스트 높이 예측 훅
 *
 * DOM reflow 없이 텍스트 블록의 렌더링 높이를 계산.
 * 가상 스크롤, CLS 제거, 스켈레톤 높이 예측에 사용.
 *
 * @param text - 측정할 텍스트
 * @param containerWidth - 컨테이너 너비 (px)
 * @param font - CSS 폰트 (default: "15px Pretendard Variable")
 * @param lineHeight - 줄 높이 (default: 24)
 */
export function usePretextHeight(
  text: string,
  containerWidth: number,
  font = "15px Pretendard Variable",
  lineHeight = 24
) {
  const [pretext, setPretext] = useState<typeof import("@chenglou/pretext") | null>(null);

  useEffect(() => {
    import("@chenglou/pretext").then(setPretext).catch(() => {});
  }, []);

  return useMemo(() => {
    if (!pretext || !text || containerWidth <= 0) {
      return { height: 0, lineCount: 0, ready: false };
    }
    try {
      const prepared = pretext.prepare(text, font, { whiteSpace: "normal" });
      const result = pretext.layout(prepared, containerWidth, lineHeight);
      return { height: result.height, lineCount: result.lineCount, ready: true };
    } catch {
      return { height: 0, lineCount: 0, ready: false };
    }
  }, [pretext, text, containerWidth, font, lineHeight]);
}

/**
 * usePretextBatch — 여러 텍스트 블록의 높이를 일괄 계산
 *
 * 강사 목록, 커뮤니티 피드 등 리스트 아이템의 높이 예측에 사용.
 * prepare()는 텍스트당 ~0.04ms, layout()은 ~0.09ms — 500개도 즉시 처리.
 */
export function usePretextBatch(
  texts: string[],
  containerWidth: number,
  font = "15px Pretendard Variable",
  lineHeight = 24
) {
  const [pretext, setPretext] = useState<typeof import("@chenglou/pretext") | null>(null);

  useEffect(() => {
    import("@chenglou/pretext").then(setPretext).catch(() => {});
  }, []);

  return useMemo(() => {
    if (!pretext || texts.length === 0 || containerWidth <= 0) {
      return { heights: [] as number[], ready: false };
    }
    try {
      const heights = texts.map((text) => {
        const prepared = pretext.prepare(text, font, { whiteSpace: "normal" });
        return pretext.layout(prepared, containerWidth, lineHeight).height;
      });
      return { heights, ready: true };
    } catch {
      return { heights: [] as number[], ready: false };
    }
  }, [pretext, texts, containerWidth, font, lineHeight]);
}
