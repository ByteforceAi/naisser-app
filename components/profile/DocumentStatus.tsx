"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileCheck2, AlertTriangle, Clock, Download, Shield } from "lucide-react";

interface DocItem {
  id: string;
  docType: string;
  typeLabel: string;
  expiryStatus: "valid" | "expired" | "expiring_soon" | "no_expiry";
  expiresAt: string | null;
  isRequired: boolean;
  fileUrl?: string;
  fileName?: string;
}

interface DocSummary {
  total: number;
  isComplete: boolean;
  valid: number;
  expired: number;
  expiringSoon: number;
}

const STATUS_CONFIG = {
  valid: { icon: FileCheck2, color: "#059669", bg: "rgba(5,150,105,0.08)", label: "유효" },
  no_expiry: { icon: FileCheck2, color: "#059669", bg: "rgba(5,150,105,0.08)", label: "확인됨" },
  expiring_soon: { icon: Clock, color: "#D97706", bg: "rgba(217,119,6,0.08)", label: "만료 임박" },
  expired: { icon: AlertTriangle, color: "#DC2626", bg: "rgba(220,38,38,0.08)", label: "만료됨" },
};

export function DocumentStatus({ instructorId }: { instructorId: string }) {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [summary, setSummary] = useState<DocSummary | null>(null);
  const [canDownload, setCanDownload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/instructors/${instructorId}/documents`)
      .then((r) => r.json())
      .then((json) => {
        setDocs(json.data || []);
        setSummary(json.summary || null);
        setCanDownload(json.canDownload || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [instructorId]);

  if (loading || !docs.length) return null;

  return (
    <div className="px-6 mb-8">
      <h2 className="text-[12px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5" />
        서류 현황
      </h2>

      {/* 완비 뱃지 */}
      {summary?.isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
          style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.12)" }}
        >
          <FileCheck2 className="w-4 h-4 text-[var(--accent-success)]" />
          <span className="text-[13px] font-semibold text-[var(--accent-success)]">
            필수 서류 완비
          </span>
        </motion.div>
      )}

      <div className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--glass-border)" }}>
        {docs.map((doc, i) => {
          const config = STATUS_CONFIG[doc.expiryStatus];
          return (
            <motion.div
              key={doc.id || doc.docType}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-4 py-3"
              style={i < docs.length - 1 ? { borderBottom: "1px solid var(--glass-border)" } : {}}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: config.bg }}>
                <config.icon className="w-3.5 h-3.5" style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[var(--text-primary)]">{doc.typeLabel}</p>
                {doc.expiresAt && (
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {new Date(doc.expiresAt).toLocaleDateString("ko-KR")}까지
                  </p>
                )}
              </div>
              <span className="text-[11px] font-medium shrink-0" style={{ color: config.color }}>
                {config.label}
              </span>
              {canDownload && doc.fileUrl && (
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                             hover:bg-[var(--bg-elevated)] transition-colors touch-target">
                  <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                </a>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
