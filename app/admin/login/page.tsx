"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "비밀번호가 올바르지 않습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" data-theme="dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-secondary)]/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[var(--accent-secondary)]" />
          </div>
          <h1 className="text-2xl font-bold">관리자 로그인</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            나이써 관리자 대시보드
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="관리자 비밀번호"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--glass-border)]
                         bg-[var(--bg-elevated)] text-sm
                         focus:outline-none focus:ring-2 focus:ring-[var(--accent-secondary)]/30
                         focus:border-[var(--accent-secondary)]"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 touch-target"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-[var(--text-muted)]" />
              ) : (
                <Eye className="w-5 h-5 text-[var(--text-muted)]" />
              )}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-[var(--accent-danger)] text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={!password || isLoading}
            className="w-full py-3 bg-[var(--accent-secondary)] text-white rounded-xl font-semibold
                       disabled:opacity-40 transition-all duration-200 touch-target"
          >
            {isLoading ? "확인 중..." : "로그인"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
