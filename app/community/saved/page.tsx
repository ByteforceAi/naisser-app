"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark, FolderPlus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { useBookmarks } from "@/lib/hooks/useBookmarks";

export default function SavedPostsPage() {
  const router = useRouter();
  const { bookmarks, folders, addFolder, getFolderItems } = useBookmarks();
  const [activeFolder, setActiveFolder] = useState("default");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const items = getFolderItems(activeFolder);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-grouped)" }}>
      <header className="sticky top-0 z-40" style={{
        background: "var(--bg-grouped)",
        opacity: 0.95,
        backdropFilter: "blur(20px) saturate(1.8)",
      }}>
        <div className="max-w-[520px] mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--subtle-hover)] transition-colors touch-target">
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />
          </button>
          <h1 className="text-[15px] font-bold text-[var(--text-primary)] flex-1">저장한 글</h1>
          <button onClick={() => setShowNewFolder(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--subtle-hover)] transition-colors touch-target">
            <FolderPlus className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto">
        {/* 폴더 탭 */}
        {folders.length > 1 && (
          <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto scrollbar-hide">
            {folders.map((f) => (
              <button key={f.id} onClick={() => setActiveFolder(f.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all
                  ${activeFolder === f.id
                    ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
                    : "text-[var(--text-muted)] bg-[var(--subtle-bg)]"}`}>
                {f.name} ({getFolderItems(f.id).length})
              </button>
            ))}
          </div>
        )}

        {/* 새 폴더 입력 */}
        <AnimatePresence>
          {showNewFolder && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4 pt-2">
              <div className="flex gap-2">
                <input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="폴더 이름"
                  className="flex-1 px-3 py-2 rounded-lg text-[13px] bg-[var(--subtle-bg)]
                             border border-[var(--subtle-border)] outline-none
                             text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => { if (newFolderName.trim()) { addFolder(newFolderName.trim()); setNewFolderName(""); setShowNewFolder(false); } }}
                  className="px-3 py-2 rounded-lg text-[13px] font-semibold text-white"
                  style={{ background: "var(--accent-primary)" }}>
                  추가
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 저장된 글 목록 */}
        {items.length === 0 ? (
          <div className="px-4 pt-8">
            <EmptyState
              icon={Bookmark}
              title="저장한 글이 없어요"
              description="관심 있는 게시글의 북마크를 눌러 저장해보세요"
              actionLabel="커뮤니티 둘러보기"
              onAction={() => router.push("/community")}
              compact
            />
          </div>
        ) : (
          <div className="px-4 pt-3 space-y-2">
            {items.map((item) => (
              <motion.button key={item.postId} whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/community/post/${item.postId}`)}
                className="w-full text-left px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--subtle-border)]">
                <p className="text-[13px] text-[var(--text-primary)] line-clamp-2">게시글 #{item.postId.slice(0, 6)}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  {new Date(item.savedAt).toLocaleDateString("ko-KR")} 저장
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
