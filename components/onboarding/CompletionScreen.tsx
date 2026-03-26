"use client";

import { motion } from "framer-motion";
import { PartyPopper, AlertCircle } from "lucide-react";
import Link from "next/link";

interface CompletionScreenProps {
  instructorName: string;
}

/** 온보딩 완료 화면 — 개인화된 성공 메시지 + 강사 주의사항 */
export function CompletionScreen({ instructorName }: CompletionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center text-center px-4 py-12"
    >
      {/* 성공 아이콘 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-[var(--accent-success)]/10 flex items-center justify-center mb-6"
      >
        <PartyPopper className="w-10 h-10 text-[var(--accent-success)]" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold mb-2"
      >
        등록 완료!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-[var(--text-secondary)] mb-8 leading-relaxed"
      >
        <span className="font-semibold text-[var(--text-primary)]">
          {instructorName}
        </span>{" "}
        님의 프로필이
        <br />
        성공적으로 등록되었어요! 🎉
      </motion.p>

      {/* 강사 주의사항 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 w-full max-w-sm mb-8"
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[var(--accent-warning)] mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed text-left">
            본 어플에서 계약은 진행하지 않습니다. 계약은 직접 학교로 가셔서
            대면하게 진행하시기 바랍니다.
          </p>
        </div>
      </motion.div>

      {/* 나의 페이지로 이동 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          href="/instructor"
          className="inline-flex items-center px-8 py-3 bg-[var(--accent-primary)] text-white rounded-xl
                     font-semibold shadow-btn-primary hover:shadow-btn-primary-hover
                     transition-all duration-200 ease-out hover:-translate-y-0.5"
        >
          나의 페이지로 이동
        </Link>
      </motion.div>
    </motion.div>
  );
}
