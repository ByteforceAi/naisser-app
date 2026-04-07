"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-grouped)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
          style={{
            background: "linear-gradient(135deg, rgba(220,38,38,0.08), rgba(239,68,68,0.12))",
            border: "1px solid rgba(220,38,38,0.10)",
          }}
        >
          <AlertTriangle className="w-8 h-8 text-red-500" style={{ opacity: 0.7 }} />
        </motion.div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
          문제가 발생했습니다
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          일시적인 오류가 발생했습니다.<br />
          잠시 후 다시 시도해주세요.
        </p>
        <div className="flex gap-2 justify-center">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={reset}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
              boxShadow: "0 4px 16px rgba(59,108,246,0.3)",
            }}
          >
            <RotateCcw className="w-4 h-4" />
            다시 시도
          </motion.button>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold
                       text-[var(--text-secondary)] border border-[var(--glass-border)]
                       bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-all"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Link>
        </div>
        {error.digest && (
          <p className="text-[11px] text-[var(--text-muted)] mt-4">오류 코드: {error.digest}</p>
        )}
      </motion.div>
    </div>
  );
}
