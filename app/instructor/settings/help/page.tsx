"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

const FAQ = [
  { q: "프로필은 어떻게 수정하나요?", a: "강사 홈 → 프로필 수정에서 이름, 사진, 분야, 지역, 소개, SNS 등을 수정할 수 있습니다." },
  { q: "커뮤니티 글을 삭제하고 싶어요", a: "본인이 작성한 글의 ··· 메뉴에서 '삭제하기'를 선택하세요. 삭제된 글은 복구할 수 없습니다." },
  { q: "다른 사람의 글이 불편해요", a: "해당 글의 ··· 메뉴에서 '뮤트' 또는 '신고하기'를 선택하세요. 신고는 관리자가 검토합니다." },
  { q: "서류는 어떻게 업로드하나요?", a: "강사 홈 → 서류함에서 범죄경력조회 동의서, 통장사본, 이력서 등을 업로드할 수 있습니다." },
  { q: "교사는 커뮤니티를 이용할 수 없나요?", a: "강사 라운지는 강사 전용 공간입니다. 교사분은 강사 검색, 수업 요청, 리뷰 기능을 이용하실 수 있습니다." },
  { q: "단가 정보는 믿을 수 있나요?", a: "커뮤니티 글은 이용자가 자발적으로 공유한 정보입니다. 나이써가 정확성을 보장하지는 않습니다." },
  { q: "알림을 끄고 싶어요", a: "설정 → 알림 설정에서 푸시 알림, 이메일 알림을 개별적으로 끌 수 있습니다." },
];

export default function HelpPage() {
  const router = useRouter();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      <div className="sticky top-0 z-50 px-5 py-3 flex items-center gap-3"
        style={{ background: "var(--bg-grouped)", opacity: 0.95, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors touch-target">
          <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
        </button>
        <h1 className="text-[17px] font-semibold" style={{ color: "var(--text-primary)" }}>도움말</h1>
      </div>

      <div className="max-w-[520px] mx-auto px-5 pt-2 pb-24">
        <p className="text-[13px] font-medium px-4 mb-2" style={{ color: "var(--ios-gray)" }}>자주 묻는 질문</p>

        <div className="rounded-[14px] overflow-hidden" style={{ background: "var(--bg-grouped-secondary)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          {FAQ.map((item, i) => (
            <div key={i} style={i < FAQ.length - 1 ? { borderBottom: "0.5px solid var(--ios-separator)" } : {}}>
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                <span className="text-[15px] flex-1 pr-2" style={{ color: "var(--text-primary)" }}>{item.q}</span>
                <motion.div animate={{ rotate: openIdx === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "var(--ios-gray3)" }} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }}
                    exit={{ height: 0 }} className="overflow-hidden">
                    <p className="px-4 pb-3.5 text-[13px] leading-[1.7]" style={{ color: "var(--ios-gray)" }}>
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* 문의 */}
        <div className="mt-8 text-center">
          <p className="text-[13px] mb-3" style={{ color: "var(--ios-gray)" }}>원하는 답을 찾지 못하셨나요?</p>
          <a href="mailto:support@naisser.ai.kr"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[15px] font-semibold transition-colors"
            style={{ background: "var(--bg-grouped-secondary)", color: "var(--text-primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <Mail className="w-4 h-4" /> 이메일 문의
          </a>
        </div>
      </div>
    </div>
  );
}
