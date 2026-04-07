"use client";

import { motion } from "framer-motion";
import { Check, FileText, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ConsentStepProps {
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  onToggleTerms: () => void;
  onTogglePrivacy: () => void;
}

/** 약관 동의 단계 */
export function ConsentStep({
  agreedToTerms,
  agreedToPrivacy,
  onToggleTerms,
  onTogglePrivacy,
}: ConsentStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* 이용약관 */}
      <button
        onClick={onToggleTerms}
        className={cn(
          "w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
          agreedToTerms
            ? "border-[var(--accent-primary)] bg-[rgba(0,122,255,0.06)]"
            : "border-[var(--glass-border)] bg-[var(--bg-surface)]"
        )}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            agreedToTerms
              ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
              : "border-[var(--bg-muted)]"
          )}
        >
          {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
        <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
        <span className="text-sm font-medium">(필수) 이용약관 동의</span>
      </button>

      {/* 개인정보처리방침 */}
      <button
        onClick={onTogglePrivacy}
        className={cn(
          "w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
          agreedToPrivacy
            ? "border-[var(--accent-primary)] bg-[rgba(0,122,255,0.06)]"
            : "border-[var(--glass-border)] bg-[var(--bg-surface)]"
        )}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
            agreedToPrivacy
              ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
              : "border-[var(--bg-muted)]"
          )}
        >
          {agreedToPrivacy && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
        <Shield className="w-4 h-4 text-[var(--text-secondary)]" />
        <span className="text-sm font-medium">
          (필수) 개인정보처리방침 동의
        </span>
      </button>
    </motion.div>
  );
}
