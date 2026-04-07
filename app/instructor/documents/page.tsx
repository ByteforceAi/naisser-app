"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, FileText, CreditCard, Award, Heart, Briefcase,
  Upload, Trash2, AlertTriangle, CheckCircle2, Clock,
  ChevronDown, X, Loader2, File as FileIcon,
} from "lucide-react";

/* ─── 서류 종류 정의 ─── */
const DOC_SECTIONS = [
  {
    type: "criminal_record",
    label: "범죄경력조회 동의서",
    icon: Shield,
    color: "#DC2626",
    bgColor: "rgba(239,68,68,0.06)",
    required: true,
    hasExpiry: true,
    guide: "학교 출입 시 필수 서류입니다. PDF 또는 스캔본을 업로드해주세요.",
  },
  {
    type: "bank_account",
    label: "통장사본",
    icon: CreditCard,
    color: "#2563EB",
    bgColor: "rgba(37,99,235,0.06)",
    required: true,
    hasExpiry: false,
    guide: "강사료 지급을 위한 통장사본입니다. 앞면만 촬영해주세요.",
  },
  {
    type: "resume",
    label: "이력서",
    icon: FileText,
    color: "#7C3AED",
    bgColor: "rgba(124,58,237,0.06)",
    required: true,
    hasExpiry: false,
    guide: "최신 이력서를 PDF로 업로드해주세요.",
  },
  {
    type: "certificate",
    label: "자격증",
    icon: Award,
    color: "#059669",
    bgColor: "rgba(16,185,129,0.06)",
    required: false,
    hasExpiry: false,
    guide: "보유 자격증 사본입니다. 여러 개 업로드 가능합니다.",
    allowMultiple: true,
  },
  {
    type: "insurance",
    label: "보험가입증명서",
    icon: Heart,
    color: "#DB2777",
    bgColor: "rgba(236,72,153,0.06)",
    required: false,
    hasExpiry: true,
    guide: "일부 학교에서 요구하는 보험 가입 증명서입니다.",
  },
  {
    type: "business_license",
    label: "사업자등록증",
    icon: Briefcase,
    color: "#D97706",
    bgColor: "rgba(245,158,11,0.06)",
    required: false,
    hasExpiry: false,
    guide: "세금계산서 발행 시 필요합니다. 해당 시에만 업로드해주세요.",
  },
  {
    type: "tb_test",
    label: "채용신체검사서 (결핵검진)",
    icon: Shield,
    color: "#0891B2",
    bgColor: "rgba(8,145,178,0.06)",
    required: true,
    hasExpiry: true,
    guide: "흉부 X-ray 포함 채용신체검사서입니다. 검사일로부터 1년간 유효합니다.",
  },
  {
    type: "tb_latent",
    label: "잠복결핵감염검진확인서",
    icon: Shield,
    color: "#6366F1",
    bgColor: "rgba(99,102,241,0.06)",
    required: false,
    hasExpiry: false,
    guide: "신규 강사는 1개월 이내 검진 필수입니다. 생애 1회 검진으로 기존 확인서 제출 가능합니다.",
  },
  {
    type: "consent_privacy",
    label: "개인정보 수집·이용 동의서",
    icon: FileText,
    color: "#78716C",
    bgColor: "rgba(120,113,108,0.06)",
    required: true,
    hasExpiry: false,
    guide: "계약 시마다 필요한 개인정보 동의서입니다.",
  },
  {
    type: "integrity_pledge",
    label: "청렴서약서",
    icon: Shield,
    color: "#059669",
    bgColor: "rgba(5,150,105,0.06)",
    required: true,
    hasExpiry: false,
    guide: "교육의 중립성 준수 서약을 포함한 청렴서약서입니다.",
  },
] as const;

interface Document {
  id: string;
  docType: string;
  typeLabel: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  description: string | null;
  expiresAt: string | null;
  uploadedAt: string;
  expiryStatus: "expired" | "expiring_soon" | "valid" | "no_expiry";
}

interface Summary {
  total: number;
  isComplete: boolean;
  missingTypes: { type: string; label: string }[];
}

/* ─── 애니메이션 ─── */
const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const CARD_ENTER = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null); // docType being uploaded
  const [deleting, setDeleting] = useState<string | null>(null); // doc id being deleted
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // ─── Fetch ───
  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      setDocs(json.data || []);
      setSummary(json.summary || null);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // ─── 업로드 ───
  const triggerUpload = (docType: string) => {
    setUploadTarget(docType);
    setUploadDesc("");
    setUploadExpiry("");
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    const section = DOC_SECTIONS.find((s) => s.type === uploadTarget);
    if (section?.hasExpiry) {
      setPendingFile(file);
      setShowExpiryModal(true);
    } else {
      doUpload(file, uploadTarget, "", "");
    }
    // input 초기화
    e.target.value = "";
  };

  const doUpload = async (
    file: File,
    docType: string,
    expiresAt: string,
    description: string
  ) => {
    setUploading(docType);
    setShowExpiryModal(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);
      if (description) formData.append("description", description);
      if (expiresAt) formData.append("expiresAt", expiresAt);

      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "업로드에 실패했습니다.");
        return;
      }

      await fetchDocs();
    } catch {
      alert("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(null);
      setPendingFile(null);
    }
  };

  // ─── 삭제 ───
  const handleDelete = async (docId: string) => {
    if (!confirm("이 서류를 삭제하시겠습니까?")) return;
    setDeleting(docId);
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      await fetchDocs();
    } catch {
      alert("삭제에 실패했습니다.");
    } finally {
      setDeleting(null);
    }
  };

  // ─── 파일 사이즈 포맷 ───
  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // ─── 만료 상태 뱃지 ───
  const ExpiryBadge = ({ status, date }: { status: string; date: string | null }) => {
    if (status === "no_expiry") return null;
    const formatted = date ? new Date(date).toLocaleDateString("ko-KR") : "";
    if (status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600">
          <AlertTriangle className="w-3 h-3" /> 만료됨
        </span>
      );
    }
    if (status === "expiring_soon") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
          <Clock className="w-3 h-3" /> {formatted} 만료
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-[var(--text-muted)]">
        <Clock className="w-3 h-3" /> {formatted}까지
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0088ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-blue page-bg-dots px-5 pt-4 pb-24">
      {/* 히든 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFileSelect}
      />

      {/* ─── 헤더 ─── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">서류함</h1>
        <p className="text-sm text-gray-700 leading-relaxed">
          한 번 올려놓으면 어디서든 꺼내 쓸 수 있는 내 서류 금고
        </p>
      </div>

      {/* ─── 완비 상태 카드 ─── */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl"
          style={{
            background: summary.isComplete
              ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.04))"
              : "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.04))",
            border: `1.5px solid ${summary.isComplete ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"}`,
          }}
        >
          <div className="flex items-center gap-3">
            {summary.isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            )}
            <div>
              <p className="text-sm font-bold text-gray-900">
                {summary.isComplete
                  ? "서류 완비 ✅"
                  : `필수 서류 ${summary.missingTypes.length}개 미등록`}
              </p>
              {!summary.isComplete && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  미등록:{" "}
                  {summary.missingTypes.map((m) => m.label).join(", ")}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── 서류 섹션 목록 ─── */}
      <motion.div
        variants={STAGGER}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {DOC_SECTIONS.map((section) => {
          const Icon = section.icon;
          const sectionDocs = docs.filter((d) => d.docType === section.type);
          const hasDoc = sectionDocs.length > 0;
          const isUploading = uploading === section.type;

          return (
            <motion.div
              key={section.type}
              variants={CARD_ENTER}
              className="ds-card overflow-hidden"
              style={{
                border: hasDoc
                  ? `1.5px solid ${section.color}20`
                  : "1.5px solid rgba(0,0,0,0.06)",
              }}
            >
              {/* 카드 헤더 */}
              <div className="flex items-center gap-3 p-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: section.bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: section.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      {section.label}
                    </h3>
                    {section.required && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-50 text-red-500">
                        필수
                      </span>
                    )}
                  </div>
                  {hasDoc ? (
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {sectionDocs.length}개 등록됨
                    </p>
                  ) : (
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      미등록
                    </p>
                  )}
                </div>

                {/* 업로드 버튼 */}
                {(!hasDoc || section.type === "certificate" || (section as { allowMultiple?: boolean }).allowMultiple) && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => triggerUpload(section.type)}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                               transition-colors disabled:opacity-50"
                    style={{
                      background: section.bgColor,
                      color: section.color,
                    }}
                  >
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    {isUploading ? "업로드 중..." : "업로드"}
                  </motion.button>
                )}

                {/* 가이드 토글 */}
                <button
                  onClick={() =>
                    setExpandedGuide(
                      expandedGuide === section.type ? null : section.type
                    )
                  }
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-gray-50"
                >
                  <ChevronDown
                    className="w-4 h-4 transition-transform"
                    style={{
                      transform:
                        expandedGuide === section.type
                          ? "rotate(180deg)"
                          : "rotate(0)",
                    }}
                  />
                </button>
              </div>

              {/* 가이드 텍스트 */}
              <AnimatePresence>
                {expandedGuide === section.type && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-3 text-xs text-[var(--text-muted)] leading-relaxed">
                      💡 {section.guide}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 업로드된 파일 목록 */}
              {sectionDocs.length > 0 && (
                <div className="border-t border-gray-50">
                  {sectionDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <FileIcon
                        className="w-4 h-4 shrink-0"
                        style={{ color: section.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {doc.fileName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {formatSize(doc.fileSize)}
                          </span>
                          <ExpiryBadge
                            status={doc.expiryStatus}
                            date={doc.expiresAt}
                          />
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleting === doc.id}
                        className="w-8 h-8 rounded-full flex items-center justify-center
                                   text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        {deleting === doc.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ─── 만료일 입력 모달 ─── */}
      <AnimatePresence>
        {showExpiryModal && pendingFile && uploadTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ds-overlay"
              onClick={() => {
                setShowExpiryModal(false);
                setPendingFile(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="ds-sheet p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">만료일 설정</h3>
                <button
                  onClick={() => {
                    setShowExpiryModal(false);
                    setPendingFile(null);
                  }}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)] mb-4">
                {pendingFile.name} — 만료일이 있으면 입력해주세요 (선택)
              </p>

              <input
                type="date"
                value={uploadExpiry}
                onChange={(e) => setUploadExpiry(e.target.value)}
                className="ds-input mb-3"
                placeholder="만료일 선택 (선택사항)"
              />

              <input
                type="text"
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                className="ds-input mb-4"
                placeholder="메모 (선택사항)"
              />

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    doUpload(pendingFile, uploadTarget, "", "")
                  }
                  className="flex-1 py-3 rounded-2xl text-sm font-bold border border-gray-200 text-gray-600"
                >
                  만료일 없이 업로드
                </button>
                <button
                  onClick={() =>
                    doUpload(
                      pendingFile,
                      uploadTarget,
                      uploadExpiry,
                      uploadDesc
                    )
                  }
                  className="ds-btn-primary flex-1 py-3"
                >
                  업로드
                </button>
              </div>

              <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
