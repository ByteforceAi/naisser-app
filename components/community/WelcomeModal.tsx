"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pen, Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

/**
 * WelcomeModal — 첫 커뮤니티 방문 시 온보딩
 *
 * localStorage에 "naisser_community_welcomed" 키로 1회만 표시
 */
export function WelcomeModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const welcomed = localStorage.getItem("naisser_community_welcomed");
    if (!welcomed) {
      setTimeout(() => setShow(true), 1000); // 1초 후 표시
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("naisser_community_welcomed", "1");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center px-6"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] rounded-2xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--subtle-border)]"
          >
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--subtle-bg)" }}>
                  <Pen className="w-5 h-5 text-[var(--accent-primary)]" />
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--subtle-bg)" }}>
                  <Heart className="w-5 h-5 text-[var(--accent-danger)]" />
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--subtle-bg)" }}>
                  <MessageCircle className="w-5 h-5 text-[var(--accent-success)]" />
                </div>
              </div>

              <h2 className="text-[16px] font-bold text-[var(--text-primary)] mb-2">강사 라운지에 오신 걸 환영합니다</h2>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-5">
                단가 정보, 수업 노하우, 교육청 공고 등<br />
                동료 강사님들과 자유롭게 나눠보세요.
              </p>

              <div className="space-y-2">
                <Link href="/community/write?category=chat" onClick={dismiss}>
                  <motion.button whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-xl text-[14px] font-bold text-white"
                    style={{ background: "var(--accent-primary)" }}>
                    첫 글 작성하기
                  </motion.button>
                </Link>
                <button onClick={dismiss}
                  className="w-full py-3 rounded-xl text-[13px] font-medium text-[var(--text-muted)]">
                  나중에 할게요
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
