"use client";

import { useState } from "react";
import { ArrowLeft, ImagePlus, BarChart3, X, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { id: "price", label: "💰 단가", placeholder: "단가, 계약 관련 이야기를 나눠보세요" },
  { id: "knowhow", label: "📚 노하우", placeholder: "수업 노하우나 팁을 공유해주세요" },
  { id: "info", label: "📢 정보", placeholder: "교육청 공모, 입찰 등 유용한 정보를 공유해주세요" },
  { id: "chat", label: "💬 수다", placeholder: "편하게 이야기 나눠요" },
] as const;

export default function CommunityWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "chat";

  const [body, setBody] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 투표
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const addPollOption = () => {
    if (pollOptions.length < 6) setPollOptions([...pollOptions, ""]);
  };
  const removePollOption = (idx: number) => {
    if (pollOptions.length > 2) setPollOptions(pollOptions.filter((_, i) => i !== idx));
  };
  const updatePollOption = (idx: number, value: string) => {
    setPollOptions(pollOptions.map((o, i) => (i === idx ? value : o)));
  };

  const placeholder = CATEGORIES.find((c) => c.id === category)?.placeholder || "자유롭게 작성해주세요";

  const canSubmit = body.trim().length > 0 && (!showPoll || (pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        boardType: "all",
        body,
        category,
        postType: "free",
      };
      if (showPoll && pollQuestion.trim()) {
        payload.pollQuestion = pollQuestion;
        payload.pollOptions = pollOptions.filter((o) => o.trim());
      }
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push("/community");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FC" }}>
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(248,249,252,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors touch-target">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">글 쓰기</h1>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-200"
          style={{
            background: canSubmit
              ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)"
              : "#E5E7EB",
            color: canSubmit ? "white" : "#9CA3AF",
            boxShadow: canSubmit ? "0 2px 12px rgba(59,108,246,0.25)" : "none",
          }}
        >
          {isSubmitting ? "등록 중..." : "등록"}
        </button>
      </header>

      <div className="max-w-[520px] mx-auto px-4 py-4 space-y-4">
        {/* 카테고리 선택 */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                category === cat.id
                  ? {
                      background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                      color: "white",
                      boxShadow: "0 2px 8px rgba(59,108,246,0.2)",
                    }
                  : {
                      background: "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      color: "#6B7280",
                    }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 본문 */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          rows={8}
          maxLength={5000}
          autoFocus
          className="w-full p-4 text-[15px] leading-relaxed rounded-2xl resize-none
                     focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(0,0,0,0.06)",
          }}
        />

        {/* 투표 영역 */}
        <AnimatePresence>
          {showPoll && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl space-y-3"
                style={{
                  background: "rgba(255,255,255,0.65)",
                  backdropFilter: "blur(12px)",
                  border: "1.5px solid rgba(59,108,246,0.15)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    투표 만들기
                  </span>
                  <button onClick={() => setShowPoll(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <input
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="투표 질문 (예: 올해 단가 얼마 받으세요?)"
                  className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/80 border border-gray-100
                             focus:outline-none focus:border-blue-300"
                />

                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={opt}
                      onChange={(e) => updatePollOption(i, e.target.value)}
                      placeholder={`선택지 ${i + 1}`}
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-white/80 border border-gray-100
                                 focus:outline-none focus:border-blue-300"
                    />
                    {pollOptions.length > 2 && (
                      <button onClick={() => removePollOption(i)} className="text-gray-300 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 6 && (
                  <button
                    onClick={addPollOption}
                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> 선택지 추가
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 하단 툴바 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-gray-500
                               hover:bg-white/60 transition-colors touch-target">
              <ImagePlus className="w-4 h-4" />
              사진
            </button>
            {!showPoll && (
              <button
                onClick={() => setShowPoll(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-gray-500
                           hover:bg-white/60 transition-colors touch-target"
              >
                <BarChart3 className="w-4 h-4" />
                투표
              </button>
            )}
          </div>
          <span className="text-[11px] text-gray-400 tabular-nums">{body.length}/5,000</span>
        </div>
      </div>
    </div>
  );
}
