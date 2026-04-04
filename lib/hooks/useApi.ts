"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useApi — SWR 스타일 데이터 페칭 훅
 *
 * - stale-while-revalidate 패턴
 * - 자동 리패칭 (포커스 시)
 * - 에러 핸들링
 * - 로딩 상태
 *
 * SWR 패키지 없이 직접 구현 (의존성 최소화)
 *
 * 사용:
 *   const { data, error, loading, mutate } = useApi<Post[]>("/api/community/feed");
 */

interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  mutate: () => Promise<void>;
}

const cache = new Map<string, { data: unknown; timestamp: number }>();
const STALE_TIME = 30_000; // 30초

export function useApi<T>(url: string | null, options?: RequestInit): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url) { setLoading(false); return; }

    // 캐시 확인
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < STALE_TIME) {
      setData(cached.data as T);
      setLoading(false);
      // 백그라운드 리밸리데이트
    }

    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      const result = json.data ?? json;

      if (mountedRef.current) {
        setData(result as T);
        setError(null);
        cache.set(url, { data: result, timestamp: Date.now() });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "요청 실패");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  // 포커스 시 리밸리데이트
  useEffect(() => {
    const onFocus = () => {
      const cached = cache.get(url || "");
      if (cached && Date.now() - cached.timestamp > STALE_TIME) {
        fetchData();
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [url, fetchData]);

  return { data, error, loading, mutate: fetchData };
}
