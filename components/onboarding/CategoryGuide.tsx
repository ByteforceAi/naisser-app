"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb } from "lucide-react";

interface CategoryGuideProps {
  type: "subject" | "method";
}

const GUIDE_TEXT = {
  subject: `보통 학교에서는 '창의적체험활동'의 일환으로 특강을 많이 합니다.
주제가 명확한 프로그램이 좋습니다. 관련있는 주제를 다 체크해주세요.
무엇을 만드냐 보다 무엇을 주제로 만드냐가 중요합니다.

• 주제가 불분명한 경우 '기타'보다는 '인성&학폭예방','진로&직업'이 좋습니다.
• 예) '조향','퍼스널컬러' → 조향사 '직업체험' → 진로&직업
• 예) '레진','라탄' → 정서안정 → 인성&학폭예방
• 만들고 작업물이 나오는 프로그램 → 공예 선택 (음식, 원예 제외)`,
  method: `강의방법은 수업을 진행하는 형태를 말합니다.
여러 방법을 조합하는 경우 해당되는 항목을 모두 선택해주세요.`,
};

/** 참고사항 접이식 가이드 */
export function CategoryGuide({ type }: CategoryGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-2"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-[var(--accent-primary)] font-medium touch-target"
      >
        <Lightbulb className="w-3.5 h-3.5" />
        참고사항
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
              {GUIDE_TEXT[type]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
