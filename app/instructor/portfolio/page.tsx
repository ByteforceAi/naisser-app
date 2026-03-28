"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImagePlus, FileText, Video, X, Loader2, Plus,
  ArrowLeft, Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PortfolioItem {
  id: string;
  type: "image" | "pdf" | "video";
  url: string;
  title: string;
  description?: string;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);

  // 비디오 링크 추가 폼
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch("/api/instructors/me/portfolio");
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch {
      // 아직 API 없으면 빈 배열
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

  // 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`${file.name}: 10MB 이하만 업로드 가능합니다.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "image");
        formData.append("title", file.name.replace(/\.[^.]+$/, ""));

        const res = await fetch("/api/instructors/me/portfolio", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          setItems((prev) => [...prev, json.data]);
        }
      }
    } catch {
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      setShowAddSheet(false);
    }
  };

  // PDF 업로드
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("10MB 이하만 업로드 가능합니다.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "pdf");
      formData.append("title", file.name.replace(/\.[^.]+$/, ""));

      const res = await fetch("/api/instructors/me/portfolio", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        setItems((prev) => [...prev, json.data]);
      }
    } catch {
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      setShowAddSheet(false);
    }
  };

  // 비디오 링크 추가
  const addVideoLink = async () => {
    if (!videoUrl) return;
    setUploading(true);
    try {
      const res = await fetch("/api/instructors/me/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video",
          url: videoUrl,
          title: videoTitle || "수업 영상",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setItems((prev) => [...prev, json.data]);
        setVideoUrl("");
        setVideoTitle("");
      }
    } catch {
      alert("추가 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      setShowAddSheet(false);
    }
  };

  // 삭제
  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/instructors/me/portfolio/${id}`, { method: "DELETE" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const images = items.filter((i) => i.type === "image");
  const pdfs = items.filter((i) => i.type === "pdf");
  const videos = items.filter((i) => i.type === "video");

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* 헤더 */}
      <div className="ds-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="ds-back-btn">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-900">포트폴리오</h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddSheet(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)" }}
        >
          <Plus className="w-3.5 h-3.5" /> 추가
        </motion.button>
      </div>

      <div className="px-5 pt-4 pb-24">
        {items.length === 0 ? (
          <div className="ds-empty">
            <ImagePlus className="ds-empty-icon" />
            <p className="ds-empty-text">아직 포트폴리오가 없습니다</p>
            <p className="text-xs text-gray-300 mt-1">수업 사진, 커리큘럼, 영상을 추가해보세요</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 수업 사진 갤러리 */}
            {images.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
                  <ImagePlus className="w-3.5 h-3.5" /> 수업 사진 ({images.length}/20)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                      <button
                        onClick={() => deleteItem(img.id)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 커리큘럼 PDF */}
            {pdfs.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> 커리큘럼/자료
                </h3>
                <div className="space-y-2">
                  {pdfs.map((pdf) => (
                    <div key={pdf.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-gray-100">
                      <FileText className="w-8 h-8 text-red-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{pdf.title}</p>
                        <a href={pdf.url} target="_blank" rel="noopener" className="text-xs text-blue-500">열기</a>
                      </div>
                      <button onClick={() => deleteItem(pdf.id)}>
                        <Trash2 className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 수업 영상 */}
            {videos.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" /> 수업 영상
                </h3>
                <div className="space-y-2">
                  {videos.map((vid) => (
                    <div key={vid.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-gray-100">
                      <Video className="w-8 h-8 text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{vid.title}</p>
                        <a href={vid.url} target="_blank" rel="noopener" className="text-xs text-blue-500 truncate block">{vid.url}</a>
                      </div>
                      <button onClick={() => deleteItem(vid.id)}>
                        <Trash2 className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 추가 바텀시트 */}
      <AnimatePresence>
        {showAddSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="ds-overlay"
              onClick={() => setShowAddSheet(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl"
              style={{ background: "#F8F9FC", paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}
            >
              <div className="px-5 pt-4 pb-2">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-1.5 rounded-full bg-gray-300/80" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">포트폴리오 추가</h2>

                <div className="space-y-3">
                  {/* 사진 업로드 */}
                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 cursor-pointer active:bg-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <ImagePlus className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">수업 사진</p>
                      <p className="text-xs text-gray-400">JPG, PNG (최대 10MB)</p>
                    </div>
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={handleImageUpload} disabled={uploading} />
                  </label>

                  {/* PDF 업로드 */}
                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 cursor-pointer active:bg-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">커리큘럼 PDF</p>
                      <p className="text-xs text-gray-400">PDF (최대 10MB)</p>
                    </div>
                    <input type="file" accept=".pdf" className="hidden"
                      onChange={handlePdfUpload} disabled={uploading} />
                  </label>

                  {/* 영상 링크 */}
                  <div className="p-4 rounded-2xl bg-white border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <Video className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">수업 영상 링크</p>
                        <p className="text-xs text-gray-400">유튜브, 인스타 릴스 등</p>
                      </div>
                    </div>
                    <input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      placeholder="https://youtube.com/..."
                    />
                    <input
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      placeholder="영상 제목 (선택)"
                    />
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={addVideoLink}
                      disabled={!videoUrl || uploading}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg, #8B5CF6, #A78BFA)" }}
                    >
                      {uploading ? "추가 중..." : "영상 추가"}
                    </motion.button>
                  </div>
                </div>

                {uploading && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-blue-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    업로드 중...
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
