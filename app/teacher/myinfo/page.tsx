"use client";

import { motion } from "framer-motion";
import {
  User, Star, Settings, LogOut, ChevronRight, Shield,
  FileText, HelpCircle, Bell, Moon, Bookmark, Clock,
} from "lucide-react";
import Link from "next/link";

/**
 * 교사 마이페이지 — iOS 설정 스타일
 * 프로필 카드 + 그룹드 리스트 (iOS Settings 레이아웃)
 */

const MENU_SECTIONS = [
  {
    items: [
      { label: "내 리뷰", icon: Star, href: "#", desc: "작성한 리뷰 관리" },
      { label: "저장한 글", icon: Bookmark, href: "/community/saved" },
      { label: "최근 본 강사", icon: Clock, href: "#" },
    ],
  },
  {
    items: [
      { label: "알림", icon: Bell, href: "#" },
      { label: "화면 테마", icon: Moon, href: "#" },
    ],
  },
  {
    items: [
      { label: "개인정보 보호", icon: Shield, href: "#" },
      { label: "이용약관", icon: FileText, href: "/p/terms" },
      { label: "도움말", icon: HelpCircle, href: "#" },
    ],
  },
  {
    items: [
      { label: "로그아웃", icon: LogOut, href: "#", danger: true },
    ],
  },
];

export default function TeacherMyInfoPage() {
  return (
    <div className="min-h-screen pb-24" style={{ background: "#F2F2F7" }}>
      {/* ═══ 프로필 카드 — iOS 설정 최상단 ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-4 mt-4 mb-6"
      >
        <Link href="#" className="flex items-center gap-4 p-4 rounded-xl active:scale-[0.98] transition-transform"
          style={{
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
          {/* 아바타 */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)" }}>
            <User className="w-7 h-7" style={{ color: "#059669" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-semibold" style={{ color: "#000" }}>교사님</h2>
            <p className="text-[13px]" style={{ color: "#8e8e93" }}>학교를 등록해주세요</p>
          </div>
          <ChevronRight className="w-5 h-5 shrink-0" style={{ color: "#c7c7cc" }} />
        </Link>
      </motion.div>

      {/* ═══ 그룹드 리스트 — iOS Settings 스타일 ═══ */}
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.04 }}
        className="space-y-8 px-4"
      >
        {MENU_SECTIONS.map((section, si) => (
          <motion.div
            key={si}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.06 }}
          >
            <div className="rounded-[14px] overflow-hidden"
              style={{ background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              {section.items.map((item, ii) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 active:bg-[var(--bg-muted)] transition-colors"
                  style={ii < section.items.length - 1 ? { borderBottom: "0.5px solid #e5e5ea" } : {}}
                >
                  {/* 아이콘 — iOS 설정 스타일 (컬러 사각형) */}
                  <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center shrink-0 my-2.5"
                    style={{
                      background: "danger" in item && item.danger
                        ? "var(--accent-danger)"
                        : item.label === "알림" ? "var(--accent-danger)"
                        : item.label === "화면 테마" ? "#007AFF"
                        : item.label === "내 리뷰" ? "#FF9500"
                        : item.label === "저장한 글" ? "#5856D6"
                        : item.label === "최근 본 강사" ? "#34C759"
                        : item.label === "개인정보 보호" ? "#007AFF"
                        : item.label === "이용약관" ? "#8E8E93"
                        : item.label === "도움말" ? "#34C759"
                        : "#8E8E93",
                    }}>
                    <item.icon className="w-[17px] h-[17px] text-white" />
                  </div>

                  <span className="flex-1 text-[17px] py-3"
                    style={{ color: "danger" in item && item.danger ? "var(--accent-danger)" : "var(--text-primary)" }}>
                    {item.label}
                  </span>

                  {"desc" in item && item.desc && (
                    <span className="text-[15px]" style={{ color: "#8e8e93" }}>{item.desc as string}</span>
                  )}

                  {!("danger" in item && item.danger) && (
                    <ChevronRight className="w-[14px] h-[14px] shrink-0" style={{ color: "#c7c7cc" }} />
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 버전 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-[13px] pt-8 pb-4"
        style={{ color: "#8e8e93" }}
      >
        NAISSER v1.0.0
      </motion.p>
    </div>
  );
}
