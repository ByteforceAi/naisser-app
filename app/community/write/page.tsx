"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, BarChart3, X, Plus, Hash, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { canPublish } from "@/lib/utils/contentFilter";
import { resizeImage } from "@/lib/utils/image";

const CATEGORIES = [
  { id: "price", label: "단가", placeholder: "단가, 계약 관련 이야기를 나눠보세요" },
  { id: "knowhow", label: "노하우", placeholder: "수업 노하우나 팁을 공유해주세요" },
  { id: "info", label: "정보", placeholder: "교육청 공모, 입찰 등 유용한 정보를 공유해주세요" },
  { id: "chat", label: "수다", placeholder: "편하게 이야기 나눠요" },
] as const;

function WriteContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "chat";

  const [body, setBody] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const DRAFT_KEY = "naisser_community_draft";

  // 임시저장 복원
  const [draftRestored, setDraftRestored] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.body) { setBody(d.body); setDraftRestored(true); }
        if (d.category) setCategory(d.category);
        if (d.images?.length) setImages(d.images);
      }
    } catch { /* */ }
  }, []);

  // 자동 임시저장
  useEffect(() => {
    if (!body.trim() && images.length === 0) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ body, category, images })); } catch { /* */ }
    }, 3000);
    return () => clearTimeout(t);
  }, [body, category, images]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* */ }
  }, []);

  // Auto-grow
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(60, el.scrollHeight) + "px";
  }, [body]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 4 - images.length)) {
        if (file.size > 10 * 1024 * 1024) continue;
        // WebP 리사이즈 (최대 1200x1200, 클라이언트에서 압축)
        const resized = await resizeImage(file, 1200, 1200);
        const formData = new FormData();
        formData.append("file", new File([resized], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
        const res = await fetch("/api/upload/profile", { method: "POST", body: formData });
        if (res.ok) { const json = await res.json(); if (json.url) setImages((p) => [...p, json.url]); }
      }
    } catch { /* */ }
    setUploading(false);
    e.target.value = "";
  };

  const placeholder = CATEGORIES.find((c) => c.id === category)?.placeholder || "무슨 생각을 하고 계세요?";
  const canSubmit = body.trim().length > 0 && (!showPoll || (pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const check = canPublish(body);
    if (!check.ok) { setPublishError(check.reason || null); return; }
    setPublishError(null);
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = { boardType: "all", body, category, postType: "free" };
      if (showPoll && pollQuestion.trim()) { payload.pollQuestion = pollQuestion; payload.pollOptions = pollOptions.filter((o) => o.trim()); }
      if (images.length > 0) payload.images = images;
      const res = await fetch("/api/community/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { clearDraft(); router.push("/community"); }
    } finally { setIsSubmitting(false); }
  };

  // 유저 이니셜
  const userName = session?.user?.name || "나";
  const userInitial = userName.charAt(0);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="min-h-screen bg-[var(--bg-primary)]"
    >
      {/* 헤더 — 미니멀 */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--bg-primary)", borderBottom: "0.5px solid var(--subtle-border)" }}>
        <button onClick={() => {
          if (body.trim()) { if (confirm("임시저장됩니다.")) router.back(); }
          else { clearDraft(); router.back(); }
        }} className="text-[14px] text-[var(--text-secondary)] font-medium touch-target">
          취소
        </button>
        <motion.button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}
          whileTap={canSubmit ? { scale: 0.95 } : {}}
          className="px-5 py-1.5 rounded-full text-[13px] font-bold transition-all"
          style={{
            background: canSubmit ? "var(--accent-primary)" : "var(--subtle-bg)",
            color: canSubmit ? "white" : "var(--text-muted)",
          }}>
          {isSubmitting ? "..." : "게시"}
        </motion.button>
      </header>

      {/* ═══ X 스타일 작성 영역 — 아바타 + 텍스트 ═══ */}
      <div className="max-w-[520px] mx-auto">

        {/* 임시저장 복원 알림 */}
        <AnimatePresence>
          {draftRestored && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 text-[11px]"
                style={{ background: "var(--subtle-bg)" }}>
                <span className="text-[var(--text-secondary)]">임시저장된 글을 불러왔습니다</span>
                <button onClick={() => { setBody(""); setImages([]); clearDraft(); setDraftRestored(false); }}
                  className="text-[var(--text-muted)] font-medium">삭제</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 메인 작성 영역 */}
        <div className="flex gap-3 px-4 pt-4">
          {/* 아바타 */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--accent-primary), #8B5CF6)" }}>
            {userInitial}
          </div>

          {/* 텍스트 + 카테고리 */}
          <div className="flex-1 min-w-0">
            {/* 카테고리 드롭다운 */}
            <div className="relative mb-2">
              <button onClick={() => setShowCatPicker(!showCatPicker)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold
                           border transition-colors"
                style={{ borderColor: "var(--accent-primary)", color: "var(--accent-primary)" }}>
                {CATEGORIES.find((c) => c.id === category)?.label || "수다"}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showCatPicker && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-1 z-10 rounded-xl overflow-hidden
                               border bg-[var(--bg-surface)] border-[var(--subtle-border)] shadow-lg">
                    {CATEGORIES.map((c) => (
                      <button key={c.id} onClick={() => { setCategory(c.id); setShowCatPicker(false); }}
                        className={`block w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors
                          ${category === c.id ? "text-[var(--accent-primary)] bg-[var(--subtle-bg)]" : "text-[var(--text-secondary)]"}`}>
                        {c.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 본문 */}
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => { setBody(e.target.value); setPublishError(null); }}
              placeholder={placeholder}
              maxLength={5000}
              autoFocus
              className="w-full text-[15px] leading-[1.65] resize-none bg-transparent
                         placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
              style={{ outline: "none", border: "none", boxShadow: "none", minHeight: 60 }}
            />

            {/* 에러 */}
            {publishError && (
              <p className="text-[11px] text-red-500 font-medium mt-1">{publishError}</p>
            )}

            {/* 이미지 미리보기 */}
            {images.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                {images.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <motion.button whileTap={{ scale: 0.8 }}
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </motion.button>
                  </div>
                ))}
              </div>
            )}

            {/* 투표 */}
            <AnimatePresence>
              {showPoll && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-3 p-3 rounded-xl border border-[var(--subtle-border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5" />투표
                      </span>
                      <button onClick={() => setShowPoll(false)}><X className="w-4 h-4 text-[var(--text-muted)]" /></button>
                    </div>
                    <input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="투표 질문"
                      className="w-full px-3 py-2 rounded-lg text-[13px] bg-[var(--subtle-bg)] outline-none
                                 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={opt} onChange={(e) => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }}
                          placeholder={`선택지 ${i + 1}`}
                          className="flex-1 px-3 py-2 rounded-lg text-[13px] bg-[var(--subtle-bg)] outline-none
                                     text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
                        {pollOptions.length > 2 && (
                          <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}>
                            <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          </button>
                        )}
                      </div>
                    ))}
                    {pollOptions.length < 6 && (
                      <button onClick={() => setPollOptions([...pollOptions, ""])}
                        className="flex items-center gap-1 text-[11px] text-[var(--accent-primary)] font-medium">
                        <Plus className="w-3 h-3" />선택지 추가
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 구분선 */}
        <div className="h-[0.5px] mx-4 mt-4" style={{ background: "var(--divider)" }} />
      </div>

      {/* ═══ 하단 툴바 — 고정 ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-40"
        style={{ background: "var(--bg-primary)", borderTop: "0.5px solid var(--subtle-border)",
                 paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}>
        <div className="max-w-[520px] mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-0.5">
            <label className="w-9 h-9 flex items-center justify-center rounded-full
                               text-[var(--accent-primary)] hover:bg-[var(--subtle-hover)]
                               transition-colors cursor-pointer touch-target">
              <ImagePlus className="w-5 h-5" strokeWidth={1.5} />
              {uploading && <span className="text-[9px] ml-0.5">...</span>}
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={handleImageUpload} disabled={uploading || images.length >= 4} />
            </label>
            {!showPoll && (
              <button onClick={() => setShowPoll(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full
                           text-[var(--accent-primary)] hover:bg-[var(--subtle-hover)]
                           transition-colors touch-target">
                <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
              </button>
            )}
            <button className="w-9 h-9 flex items-center justify-center rounded-full
                               text-[var(--accent-primary)] hover:bg-[var(--subtle-hover)]
                               transition-colors touch-target">
              <Hash className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* 글자수 — 원형 프로그레스 */}
          <div className="flex items-center gap-2">
            {body.length > 0 && (
              <div className="relative w-6 h-6">
                <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none"
                    stroke="var(--subtle-border)" strokeWidth="2" />
                  <circle cx="12" cy="12" r="10" fill="none"
                    stroke={body.length > 4500 ? "#EF4444" : body.length > 4000 ? "#F59E0B" : "var(--accent-primary)"}
                    strokeWidth="2"
                    strokeDasharray={`${(body.length / 5000) * 62.83} 62.83`}
                    strokeLinecap="round" />
                </svg>
                {body.length > 4000 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold"
                    style={{ color: body.length > 4500 ? "#EF4444" : "var(--text-muted)" }}>
                    {5000 - body.length}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunityWritePage() {
  return <Suspense><WriteContent /></Suspense>;
}
