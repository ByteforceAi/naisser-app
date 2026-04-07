"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Pin,
  Plus,
  Clock,
  Users,
  Bookmark,
  BookmarkCheck,
  X,
  ExternalLink,
  Lightbulb,
} from "lucide-react";
import { useSession } from "next-auth/react";

// ═══════════════════════════════════════════
// 타입
// ═══════════════════════════════════════════

interface PinData {
  id: string;
  boardId: string;
  userId: string;
  title: string;
  description?: string | null;
  images?: string[] | null;
  topic?: string | null;
  targetGrade?: string | null;
  duration?: string | null;
  materials?: string | null;
  tips?: string | null;
  sourceUrl?: string | null;
  savedCount: number;
  createdAt: string;
}

interface BoardDetailData {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  isPublic: boolean;
  pinCount: number;
  createdAt: string;
  pins: PinData[];
}

interface MyBoard {
  id: string;
  title: string;
}

const TOPIC_MAP: Record<string, string> = {
  smokingPrevention: "흡연예방",
  genderAwareness: "성인지",
  disabilityMulticultural: "장애인식",
  careerJob: "진로직업",
  multicultural: "다문화",
  cookingBaking: "요리",
  sportsPhysical: "체육",
  readingWriting: "독서",
  science: "과학",
  music: "음악",
  environmentEcology: "환경",
  characterBullying: "인성교육",
  aiDigital: "AI디지털",
  staffTraining: "교직원연수",
  etc: "기타",
};

// ═══════════════════════════════════════════
// 핀 카드 (핀터레스트 스타일)
// ═══════════════════════════════════════════

function PinCard({
  pin,
  index,
  onPinClick,
}: {
  pin: PinData;
  index: number;
  onPinClick: (pin: PinData) => void;
}) {
  const hasImage = pin.images && pin.images.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="break-inside-avoid mb-3"
    >
      <button
        onClick={() => onPinClick(pin)}
        className="w-full text-left rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        {/* 이미지 */}
        {hasImage && (
          <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
            <img
              src={pin.images![0]}
              alt={pin.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {pin.images!.length > 1 && (
              <span className="absolute bottom-2 right-2 text-[11px] px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
                +{pin.images!.length - 1}
              </span>
            )}
          </div>
        )}

        {/* 정보 */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
            {pin.title}
          </h3>

          {pin.description && (
            <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
              {pin.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2">
            {pin.targetGrade && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                {pin.targetGrade}
              </span>
            )}
            {pin.duration && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {pin.duration}
              </span>
            )}
            {pin.topic && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                {TOPIC_MAP[pin.topic] || pin.topic}
              </span>
            )}
          </div>

          {pin.savedCount > 0 && (
            <div className="flex items-center gap-1 mt-2 text-[11px] text-[var(--text-muted)]">
              <Bookmark className="w-3 h-3" />
              <span>{pin.savedCount}명이 저장</span>
            </div>
          )}
        </div>
      </button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 핀 상세 모달
// ═══════════════════════════════════════════

function PinDetailModal({
  pin,
  onClose,
  session,
}: {
  pin: PinData;
  onClose: () => void;
  session: ReturnType<typeof useSession>["data"];
}) {
  const [myBoards, setMyBoards] = useState<MyBoard[]>([]);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.id && showSaveMenu) {
      fetch(`/api/community/boards?userId=${session.user.id}&limit=50`)
        .then((r) => r.json())
        .then((json) => setMyBoards(json.data || []))
        .catch(() => setMyBoards([]));
    }
  }, [session?.user?.id, showSaveMenu]);

  const handleSave = async (boardId: string) => {
    setSaving(true);
    try {
      await fetch(`/api/community/pins/${pin.id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId }),
      });
      setShowSaveMenu(false);
    } catch {
      // 조용히 실패
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* 이미지 갤러리 */}
        {pin.images && pin.images.length > 0 && (
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {pin.images.map((img, i) => (
              <div key={i} className="w-full shrink-0 snap-center">
                <img
                  src={img}
                  alt={`${pin.title} ${i + 1}`}
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="p-6">
          {/* 제목 */}
          <h2 className="text-lg font-bold text-gray-900">{pin.title}</h2>

          {/* 태그 */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {pin.targetGrade && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                <Users className="w-3 h-3 inline mr-0.5" />
                {pin.targetGrade}
              </span>
            )}
            {pin.duration && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                <Clock className="w-3 h-3 inline mr-0.5" />
                {pin.duration}
              </span>
            )}
            {pin.topic && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-600">
                {TOPIC_MAP[pin.topic] || pin.topic}
              </span>
            )}
          </div>

          {/* 설명 */}
          {pin.description && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">활동 설명</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {pin.description}
              </p>
            </div>
          )}

          {/* 준비물 */}
          {pin.materials && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">준비물</h3>
              <p className="text-sm text-gray-600">{pin.materials}</p>
            </div>
          )}

          {/* 진행 팁 */}
          {pin.tips && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                진행 팁
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {pin.tips}
              </p>
            </div>
          )}

          {/* 참고 자료 */}
          {pin.sourceUrl && (
            <a
              href={pin.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              참고 자료 보기
            </a>
          )}

          {/* 내 보드에 저장 */}
          {session?.user && (
            <div className="mt-6">
              {!showSaveMenu ? (
                <button
                  onClick={() => setShowSaveMenu(true)}
                  className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
                  style={{
                    background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
                    boxShadow: "0 2px 12px rgba(59,108,246,0.25)",
                  }}
                >
                  <BookmarkCheck className="w-4 h-4 inline mr-1.5" />
                  내 보드에 저장
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                    저장할 보드를 선택하세요
                  </p>
                  {myBoards.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => handleSave(board.id)}
                      disabled={saving}
                      className="w-full py-2.5 px-4 rounded-xl text-sm text-left transition-all hover:bg-gray-50"
                      style={{
                        background: "rgba(255,255,255,0.7)",
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <Pin className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                      {board.title}
                    </button>
                  ))}
                  {myBoards.length === 0 && (
                    <p className="text-xs text-[var(--text-muted)] text-center py-4">
                      먼저 보드를 만들어주세요
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 핀 추가 모달
// ═══════════════════════════════════════════

function CreatePinModal({
  boardId,
  isOpen,
  onClose,
  onCreated,
}: {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetGrade, setTargetGrade] = useState("");
  const [duration, setDuration] = useState("");
  const [materials, setMaterials] = useState("");
  const [tips, setTips] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("핀 제목을 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/community/boards/${boardId}/pins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          targetGrade: targetGrade.trim() || undefined,
          duration: duration.trim() || undefined,
          materials: materials.trim() || undefined,
          tips: tips.trim() || undefined,
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "핀 추가에 실패했습니다.");
        return;
      }
      // 초기화
      setTitle("");
      setDescription("");
      setTargetGrade("");
      setDuration("");
      setMaterials("");
      setTips("");
      setSourceUrl("");
      onCreated();
      onClose();
    } catch {
      setError("핀 추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
        }}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">새 아이디어 추가</h2>

        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="활동 이름 *"
            className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            maxLength={200}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="활동 설명"
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
            maxLength={2000}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={targetGrade}
              onChange={(e) => setTargetGrade(e.target.value)}
              placeholder="대상 학년 (예: 초3~4)"
              className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="소요 시간 (예: 2차시)"
              className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <input
            type="text"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="준비물 (예: 풍선, 테이프, 가위)"
            className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            maxLength={500}
          />
          <textarea
            value={tips}
            onChange={(e) => setTips(e.target.value)}
            placeholder="진행 팁"
            rows={2}
            className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
            maxLength={1000}
          />
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="참고 자료 URL (선택)"
            className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-gray-100"
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
              {loading ? "추가 중..." : "아이디어 추가"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// 메인 페이지
// ═══════════════════════════════════════════

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;
  const { data: session } = useSession();

  const [board, setBoard] = useState<BoardDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState<PinData | null>(null);
  const [showCreatePin, setShowCreatePin] = useState(false);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/boards/${boardId}`);
      const json = await res.json();
      if (res.ok) {
        setBoard(json.data);
      }
    } catch {
      // 조용히 실패
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (boardId) loadBoard();
  }, [boardId, loadBoard]);

  const isOwner = session?.user?.id === board?.userId;

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
        <div className="max-w-[520px] mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">
              {loading ? "..." : board?.title || "보드"}
            </h1>
            {board?.description && (
              <p className="text-xs text-[var(--text-secondary)] truncate">{board.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Pin className="w-3.5 h-3.5" />
            <span>{board?.pins?.length || 0}핀</span>
          </div>
        </div>
      </header>

      {/* ─── 핀 그리드 (masonry 2열) ─── */}
      <div className="max-w-[520px] mx-auto px-4 mt-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="columns-2 gap-3"
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="break-inside-avoid mb-3 rounded-2xl animate-pulse overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.5)" }}
                >
                  <div className="aspect-[4/3] bg-gray-100" />
                  <div className="p-3 space-y-2">
                    <div className="w-3/4 h-3 bg-gray-100 rounded" />
                    <div className="w-1/2 h-2.5 bg-gray-50 rounded" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : board?.pins && board.pins.length > 0 ? (
            <motion.div
              key="pins"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="columns-2 gap-3"
            >
              {board.pins.map((pin, i) => (
                <PinCard
                  key={pin.id}
                  pin={pin}
                  index={i}
                  onPinClick={setSelectedPin}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 px-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Pin className="w-7 h-7 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                아직 핀이 없어요
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {isOwner
                  ? "첫 아이디어를 추가해보세요!"
                  : "아직 아이디어가 추가되지 않았어요"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── FAB: 핀 추가 (보드 소유자만) ─── */}
      {isOwner && (
        <button
          onClick={() => setShowCreatePin(true)}
          className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
          style={{
            background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
            boxShadow: "0 4px 20px rgba(59,108,246,0.35)",
          }}
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      )}

      {/* ─── 핀 상세 모달 ─── */}
      <AnimatePresence>
        {selectedPin && (
          <PinDetailModal
            pin={selectedPin}
            onClose={() => setSelectedPin(null)}
            session={session}
          />
        )}
      </AnimatePresence>

      {/* ─── 핀 추가 모달 ─── */}
      <AnimatePresence>
        {showCreatePin && (
          <CreatePinModal
            boardId={boardId}
            isOpen={showCreatePin}
            onClose={() => setShowCreatePin(false)}
            onCreated={loadBoard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
