"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, FileText } from "lucide-react";

interface PortfolioItem {
  id: string;
  type: "image" | "video" | "pdf";
  url: string;
  title: string;
  description?: string;
}

export function PortfolioGallery({ instructorId }: { instructorId: string }) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    fetch(`/api/instructors/${instructorId}/portfolio`)
      .then((r) => r.json())
      .then((json) => setItems(json.data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [instructorId]);

  if (loading || items.length === 0) return null;

  const images = items.filter((i) => i.type === "image");
  const videos = items.filter((i) => i.type === "video");

  return (
    <div className="px-6 mb-8">
      <h2 className="text-[12px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
        포트폴리오
      </h2>

      {/* 이미지 그리드 (2열) */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {images.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(item)}
              className="relative aspect-square rounded-xl overflow-hidden"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* 영상 링크 */}
      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((v) => (
            <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl touch-target"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--glass-border)",
              }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(239,68,68,0.08)" }}>
                <Play className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{v.title}</p>
                <p className="text-[11px] text-[var(--text-muted)]">YouTube</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* 전체화면 뷰어 */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setSelected(null)}
          >
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10
                               flex items-center justify-center touch-target z-10"
              onClick={() => setSelected(null)}>
              <X className="w-5 h-5 text-white" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selected.url}
              alt={selected.title}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
