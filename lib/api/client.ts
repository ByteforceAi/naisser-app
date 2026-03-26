import type { ApiResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

/** API fetch 래퍼 — 표준 응답 파싱 + 재시도 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { retries = 3, retryDelay = 500, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      });

      const json: ApiResponse<T> = await res.json();

      if (!res.ok) {
        return { error: json.error || "요청 처리 중 오류가 발생했습니다." };
      }

      return json;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        );
      }
    }
  }

  return {
    error: lastError?.message || "네트워크 오류가 발생했습니다.",
  };
}
