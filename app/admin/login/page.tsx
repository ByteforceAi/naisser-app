"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center px-4" data-theme="dark"
      style={{ background: "#000" }}>
      {/* 배경 메시 */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 30% 40%, rgba(124,58,237,0.12), transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(99,102,241,0.08), transparent 60%)",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Liquid Glass 카드 (다크) */}
        <div className="rounded-[28px] p-8" style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px) saturate(1.3)",
          WebkitBackdropFilter: "blur(20px) saturate(1.3)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          boxShadow: "0 16px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
          {/* 아이콘 */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-[18px] flex items-center justify-center" style={{
              background: "rgba(124,58,237,0.15)",
              border: "0.5px solid rgba(124,58,237,0.2)",
            }}>
              <Lock className="w-7 h-7" style={{ color: "#a78bfa" }} />
            </div>
          </motion.div>

          <h1 className="text-[22px] font-bold text-center text-white mb-1">관리자 로그인</h1>
          <p className="text-[13px] text-center mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
            나이써 관리자 대시보드
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호"
                className="w-full px-4 py-3.5 pr-12 rounded-xl text-[14px] font-medium outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: password ? "1.5px solid rgba(124,58,237,0.4)" : "1.5px solid rgba(255,255,255,0.08)",
                  color: "white",
                  boxShadow: password ? "0 0 0 3px rgba(124,58,237,0.08)" : "none",
                }}
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 touch-target">
                {showPassword ? (
                  <EyeOff className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
                ) : (
                  <Eye className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
                )}
              </button>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[13px] text-center" style={{ color: "#ff6b6b" }}>
                {error}
              </motion.p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={!password || isLoading}
              className="w-full py-3.5 rounded-xl text-[15px] font-bold text-white disabled:opacity-30 transition-all"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
                boxShadow: password ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
              }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "로그인"}
            </motion.button>
          </form>
        </div>

        {/* NAISSER 워터마크 */}
        <p className="text-center text-[11px] mt-6 tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.15)" }}>
          NAISSER ADMIN
        </p>
      </motion.div>
    </div>
  );
}
