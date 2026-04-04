"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pin,
  Plus,
  Flame,
  Clock,
  ArrowLeft,
  Lock,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// ═══════════════════════════════════════════
// 타입
// ═══════════════════════════════════════════

interface BoardData {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  isPublic: boolean;
  pinCount: number;
  createdAt: string;
}

// ═══════════════════════════════════════════
// 그라데이션 배경 (커버 이미지 없을 때)
// ═══════════════════════════════════════════

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

// ═══════════════════════════════════════════
// 보드 카드 컴포넌트
// ═══════════════════════════════════════════

function BoardCard({ board, index }: { board: BoardData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/community/boards/${board.id}`}>
        <div
          className="rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          {/* 커버 이미지 또는 그라데이션 */}
          <div
            className="h-28 relative"
            style={{
              background: board.coverImage
                ? `url(${board.coverImage}) center/cover`
                : getGradient(board.id),
            }}
          >
            {!board.isPublic && (
              <div className="absolute top-2 right-2 p-1 rounded-full bg-black/30 backdrop-blur-sm">
                <Lock className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
              {board.title}
            </h3>
            {board.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {board.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
              <Pin className="w-3 h-3" />
              <span>{board.pinCount}개 핀</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 새 보드 만들기 카드
// ═══════════════════════════════════════════

function NewBoardCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <button
        onClick={onClick}
        className="w-full rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        style={{
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(12px)",
          border: "2px dashed rgba(59,108,246,0.3)",
        }}
      >
        <div className="h-28 flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(59,108,246,0.1), rgba(91,138,255,0.15))",
            }}
          >
            <Plus className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        <div className="p-3 pt-0">
          <h3 className="text-sm font-semibold text-blue-500">새 보드 만들기</h3>
          <p className="text-xs text-gray-400 mt-0.5">아이디어를 정리해보세요</p>
        </div>
      </button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 보드 생성 모달
// ═══════════════════════════════════════════

function CreateBoardModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("보드 제목을 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/community/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, isPublic }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "보드 생성에 실패했습니다.");
        return;
      }
      setTitle("");
      setDescription("");
      setIsPublic(true);
      onCreated();
      onClose();
    } catch {
      setError("보드 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        {/* 백드롭 */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* 모달 */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md mx-4 rounded-t-3xl sm:rounded-3xl p-6"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">새 보드 만들기</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                보드 제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 2024 흡연예방 베스트 활동"
                className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                maxLength={100}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="보드에 대한 간단한 설명을 입력해주세요"
                rows={2}
                className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                maxLength={500}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">공개 설정</span>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: isPublic
                    ? "linear-gradient(135deg, #3B6CF6, #5B8AFF)"
                    : "rgba(0,0,0,0.05)",
                  color: isPublic ? "white" : "#6B7280",
                }}
              >
                {isPublic ? (
                  <>
                    <Globe className="w-3.5 h-3.5" /> 공개
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> 비공개
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-500 transition-all hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                  boxShadow: "0 2px 12px rgba(59,108,246,0.25)",
                }}
              >
                {loading ? "생성 중..." : "보드 만들기"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════
// 빈 상태
// ═══════════════════════════════════════════

function EmptyBoards() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <Pin className="w-7 h-7 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">아직 보드가 없어요</h3>
      <p className="text-sm text-gray-400">
        수업 아이디어를 보드에 정리해보세요
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════
// 메인 페이지
// ═══════════════════════════════════════════

export default function BoardsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [sort, setSort] = useState<"popular" | "recent">("popular");
  const [popularBoards, setPopularBoards] = useState<BoardData[]>([]);
  const [myBoards, setMyBoards] = useState<BoardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadBoards = useCallback(async () => {
    setLoading(true);
    try {
      // 인기 보드
      const popularRes = await fetch(`/api/community/boards?sort=${sort}&limit=12`);
      const popularJson = await popularRes.json();
      setPopularBoards(popularJson.data || []);

      // 내 보드
      if (session?.user?.id) {
        const myRes = await fetch(`/api/community/boards?userId=${session.user.id}&limit=20`);
        const myJson = await myRes.json();
        setMyBoards(myJson.data || []);
      }
    } catch {
      setPopularBoards([]);
      setMyBoards([]);
    } finally {
      setLoading(false);
    }
  }, [sort, session?.user?.id]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-warm page-bg-dots pb-24" >
      {/* ─── 헤더 ─── */}
      <header
        className="sticky top-0 z-40 px-4 pt-4 pb-3"
        style={{
          background: "rgba(248,249,252,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-[520px] mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Pin className="w-5 h-5" />
              수업 아이디어 보드
            </h1>
          </div>

          {/* 정렬 탭 */}
          <div className="flex gap-2">
            {[
              { key: "popular" as const, label: "인기순", icon: Flame },
              { key: "recent" as const, label: "최신순", icon: Clock },
            ].map((tab) => {
              const isActive = sort === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSort(tab.key)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                          color: "white",
                          boxShadow: "0 2px 12px rgba(59,108,246,0.25)",
                        }
                      : {
                          background: "rgba(255,255,255,0.65)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(0,0,0,0.06)",
                          color: "#6B7280",
                        }
                  }
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ─── 콘텐츠 ─── */}
      <div className="max-w-[520px] mx-auto px-4 mt-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl animate-pulse overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                >
                  <div className="h-28 bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="w-3/4 h-3 bg-gray-100 rounded" />
                    <div className="w-1/2 h-2.5 bg-gray-50 rounded" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* 인기 보드 섹션 */}
              {popularBoards.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-400" />
                    {sort === "popular" ? "인기 보드" : "최신 보드"}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {popularBoards.map((board, i) => (
                      <BoardCard key={board.id} board={board} index={i} />
                    ))}
                  </div>
                </section>
              )}

              {/* 내 보드 섹션 */}
              {session?.user && (
                <section>
                  <h2 className="text-sm font-semibold text-gray-500 mb-3">
                    내 보드
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {myBoards.map((board, i) => (
                      <BoardCard key={board.id} board={board} index={i} />
                    ))}
                    <NewBoardCard onClick={() => setShowCreateModal(true)} />
                  </div>
                </section>
              )}

              {/* 비로그인이고 인기 보드도 없으면 빈 상태 */}
              {!session?.user && popularBoards.length === 0 && <EmptyBoards />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 보드 생성 모달 ─── */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadBoards}
      />
    </div>
  );
}
