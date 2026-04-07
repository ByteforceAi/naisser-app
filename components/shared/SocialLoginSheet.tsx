"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { signIn } from "next-auth/react";

// ─── 인라인 SVG 아이콘 ───
function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.56-.95 3.6-.98 3.83 0 0-.02.17.09.24.1.06.23.01.23.01.31-.04 3.56-2.32 4.11-2.72.61.09 1.24.13 1.89.13 5.52 0 10-3.58 10-7.94S17.52 3 12 3z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

interface SocialLoginSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** 로그인 완료 후 이동할 URL */
  callbackUrl: string;
  /** 시트 타이틀에 표시할 역할명 */
  roleLabel: string;
}

export default function SocialLoginSheet({
  isOpen,
  onClose,
  callbackUrl,
  roleLabel,
}: SocialLoginSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* 바텀시트 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)]
                       rounded-t-2xl px-6 pt-6 max-w-lg mx-auto"
            style={{ paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))" }}
          >
            {/* 핸들바 */}
            <div className="w-10 h-1 rounded-full bg-[var(--bg-muted)] mx-auto mb-4" />

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{roleLabel}로 시작하기</h2>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center
                           hover:bg-[var(--bg-muted)] transition-colors touch-target"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-6">
              소셜 계정으로 간편하게 시작하세요
            </p>

            <div className="space-y-3">
              <button
                onClick={() => signIn("kakao", { callbackUrl })}
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl
                           text-base font-semibold bg-[#FEE500] text-[#191919]
                           hover:bg-[#FDD800] transition-colors touch-target"
              >
                <KakaoIcon className="w-5 h-5" />
                카카오로 시작하기
              </button>

              <button
                onClick={() => signIn("google", { callbackUrl })}
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl
                           text-base font-semibold border border-[var(--glass-border)]
                           bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)]
                           transition-colors touch-target"
              >
                <GoogleIcon className="w-5 h-5" />
                구글로 시작하기
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] text-center mt-4">
              로그인 시{" "}
              <span className="underline">이용약관</span> 및{" "}
              <span className="underline">개인정보처리방침</span>에 동의합니다
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
