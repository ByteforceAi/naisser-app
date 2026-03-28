"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          일시적인 오류가 발생했습니다.<br />
          잠시 후 다시 시도해주세요.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)" }}
          >
            <RotateCcw className="w-4 h-4" />
            다시 시도
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 bg-white"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Link>
        </div>
        {error.digest && (
          <p className="text-[10px] text-gray-300 mt-4">오류 코드: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
