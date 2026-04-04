"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Heart, MessageCircle, Inbox, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface ToggleProps {
  on: boolean;
  onChange: () => void;
}

function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button onClick={onChange}
      className="rounded-full transition-colors duration-300"
      style={{
        width: 51, height: 31,
        background: on ? "#34C759" : "#e5e5ea",
      }}>
      <motion.div
        animate={{ x: on ? 23 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="rounded-full bg-white"
        style={{ width: 27, height: 27, marginTop: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}
      />
    </button>
  );
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    push: true,
    likes: true,
    comments: true,
    mentions: true,
    requests: true,
    reviews: true,
    email: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const items = [
    { key: "push" as const, label: "푸시 알림", desc: "앱 알림을 받습니다", icon: Bell },
    { key: "likes" as const, label: "좋아요", desc: "내 글에 좋아요가 달리면", icon: Heart },
    { key: "comments" as const, label: "댓글", desc: "내 글에 댓글이 달리면", icon: MessageCircle },
    { key: "mentions" as const, label: "멘션", desc: "누군가 나를 멘션하면", icon: Bell },
    { key: "requests" as const, label: "수업 의뢰", desc: "새 수업 의뢰가 오면", icon: Inbox },
    { key: "reviews" as const, label: "리뷰", desc: "교사가 리뷰를 남기면", icon: Star },
    { key: "email" as const, label: "이메일 다이제스트", desc: "주 1회 인기글 요약", icon: Bell },
  ];

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots">
      <header className="sticky top-0 z-40 community-header">
        <div className="max-w-[520px] mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--subtle-hover)] transition-colors touch-target">
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <h1 className="text-[15px] font-bold text-[var(--text-primary)]">알림 설정</h1>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 pt-4 space-y-1">
        {items.map((item) => (
          <div key={item.key}
            className="flex items-center justify-between px-4 py-3.5 rounded-xl">
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-[var(--text-muted)]" />
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)]">{item.label}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{item.desc}</p>
              </div>
            </div>
            <Toggle on={settings[item.key]} onChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>
    </div>
  );
}
