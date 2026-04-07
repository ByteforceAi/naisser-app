"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, FileText, CreditCard, Award, Heart, Briefcase,
  Upload, Trash2, AlertTriangle, CheckCircle2, Clock,
  ChevronRight, X, Loader2, File as FileIcon, ArrowLeft, Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ─── 서류 종류 정의 ─── */
const DOC_SECTIONS = [
  { type: "criminal_record", label: "범죄경력조회 동의서", icon: Shield, color: "#FF3B30", required: true, hasExpiry: true, guide: "학교 출입 시 필수 서류입니다. PDF 또는 스캔본을 업로드해주세요." },
  { type: "bank_account", label: "통장사본", icon: CreditCard, color: "#007AFF", required: true, hasExpiry: false, guide: "강사료 지급을 위한 통장사본입니다. 앞면만 촬영해주세요." },
  { type: "resume", label: "이력서", icon: FileText, color: "#5856D6", required: true, hasExpiry: false, guide: "최신 이력서를 PDF로 업로드해주세요." },
  { type: "certificate", label: "자격증", icon: Award, color: "#34C759", required: false, hasExpiry: false, guide: "보유 자격증 사본입니다. 여러 개 업로드 가능합니다.", allowMultiple: true },
  { type: "insurance", label: "보험가입증명서", icon: Heart, color: "#FF2D55", required: false, hasExpiry: true, guide: "일부 학교에서 요구하는 보험 가입 증명서입니다." },
  { type: "business_license", label: "사업자등록증", icon: Briefcase, color: "#FF9500", required: false, hasExpiry: false, guide: "세금계산서 발행 시 필요합니다." },
  { type: "tb_test", label: "채용신체검사서 (결핵검진)", icon: Shield, color: "#30B0C7", required: true, hasExpiry: true, guide: "흉부 X-ray 포함. 검사일로부터 1년간 유효합니다." },
  { type: "tb_latent", label: "잠복결핵감염검진확인서", icon: Shield, color: "#5856D6", required: false, hasExpiry: false, guide: "신규 강사는 1개월 이내 검진 필수. 생애 1회 검진으로 기존 확인서 제출 가능." },
  { type: "consent_privacy", label: "개인정보 수집·이용 동의서", icon: FileText, color: "#8E8E93", required: true, hasExpiry: false, guide: "계약 시마다 필요한 개인정보 동의서입니다." },
  { type: "integrity_pledge", label: "청렴서약서", icon: Shield, color: "#34C759", required: true, hasExpiry: false, guide: "교육의 중립성 준수 서약을 포함한 청렴서약서입니다." },
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

export default function DocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      setDocs(json.data || []);
      setSummary(json.summary || null);
    } catch { setDocs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

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
    if (section?.hasExpiry) { setPendingFile(file); setShowExpiryModal(true); }
    else { doUpload(file, uploadTarget, "", ""); }
    e.target.value = "";
  };

  const doUpload = async (file: File, docType: string, expiresAt: string, description: string) => {
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
      if (!res.ok) { alert(json.error || "업로드에 실패했습니다."); return; }
      await fetchDocs();
    } catch { alert("업로드 중 오류가 발생했습니다."); }
    finally { setUploading(null); setPendingFile(null); }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("이 서류를 삭제하시겠습니까?")) return;
    setDeleting(docId);
    try { await fetch(`/api/documents/${docId}`, { method: "DELETE" }); await fetchDocs(); }
    catch { alert("삭제에 실패했습니다."); }
    finally { setDeleting(null); }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent-primary)" }} />
      </div>
    );
  }

  const requiredDocs = DOC_SECTIONS.filter(s => s.required);
  const optionalDocs = DOC_SECTIONS.filter(s => !s.required);

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg-grouped)" }}>
      {/* 히든 파일 input */}
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileSelect} />

      {/* ═══ iOS Large Title Header ═══ */}
      <div className="sticky top-0 z-30" style={{
        background: "var(--bg-grouped)", opacity: 0.95,
        backdropFilter: "blur(20px) saturate(1.8)", WebkitBackdropFilter: "blur(20px) saturate(1.8)",
      }}>
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-lg active:bg-[var(--bg-muted)] touch-target">
              <ArrowLeft className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />
            </button>
          </div>
          <h1 className="text-[28px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>서류함</h1>
          <p className="text-[15px] mt-1" style={{ color: "var(--ios-gray)" }}>
            한 번 올려놓으면 어디서든 꺼내 쓸 수 있는 내 서류 금고
          </p>
        </div>
      </div>

      <div className="px-5 pt-2">
        {/* ═══ 상태 요약 카드 ═══ */}
        {summary && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{
              background: summary.isComplete ? "rgba(52,199,89,0.08)" : "rgba(255,149,0,0.08)",
              border: `1px solid ${summary.isComplete ? "rgba(52,199,89,0.15)" : "rgba(255,149,0,0.15)"}`,
            }}>
            {summary.isComplete
              ? <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: "var(--accent-success)" }} />
              : <AlertTriangle className="w-6 h-6 shrink-0" style={{ color: "var(--accent-warning, #FF9500)" }} />}
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                {summary.isComplete ? "서류 완비 ✅" : `필수 서류 ${summary.missingTypes.length}개 미등록`}
              </p>
              {!summary.isComplete && (
                <p className="text-[13px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {summary.missingTypes.map(m => m.label).join(", ")}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ 필수 서류 섹션 ═══ */}
        <p className="text-[13px] font-medium uppercase tracking-wide mb-2 px-1" style={{ color: "var(--ios-gray)" }}>
          필수 서류
        </p>
        <div className="rounded-xl overflow-hidden mb-6" style={{ background: "var(--bg-grouped-secondary)" }}>
          {requiredDocs.map((section, i) => {
            const sectionDocs = docs.filter(d => d.docType === section.type);
            const hasDoc = sectionDocs.length > 0;
            const isUploading = uploading === section.type;

            return (
              <div key={section.type}>
                <div className="flex items-center gap-3 px-4 py-[11px]"
                  style={{ borderBottom: i < requiredDocs.length - 1 || hasDoc ? `0.5px solid var(--ios-separator)` : "none" }}>
                  {/* 아이콘 배지 (Apple Settings 스타일) */}
                  <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center shrink-0"
                    style={{ background: section.color }}>
                    <section.icon className="w-[17px] h-[17px] text-white" />
                  </div>

                  {/* 텍스트 */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[17px]" style={{ color: "var(--text-primary)" }}>{section.label}</span>
                    <p className="text-[13px]" style={{ color: hasDoc ? "var(--accent-success)" : "var(--ios-gray)" }}>
                      {hasDoc ? `등록됨 · ${sectionDocs[0].fileName}` : "미등록"}
                    </p>
                  </div>

                  {/* 업로드/정보 버튼 */}
                  {!hasDoc ? (
                    <button onClick={() => triggerUpload(section.type)} disabled={isUploading}
                      className="px-3 py-1.5 rounded-full text-[13px] font-semibold disabled:opacity-50"
                      style={{ background: "var(--accent-primary)", color: "#FFFFFF" }}>
                      {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : "업로드"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      {sectionDocs[0].expiryStatus === "expired" && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: "rgba(255,59,48,0.1)", color: "var(--accent-danger)" }}>만료</span>
                      )}
                      {sectionDocs[0].expiryStatus === "expiring_soon" && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: "rgba(255,149,0,0.1)", color: "var(--accent-warning, #FF9500)" }}>곧 만료</span>
                      )}
                      <button onClick={() => setExpandedGuide(expandedGuide === section.type ? null : section.type)}
                        className="p-1 touch-target">
                        <ChevronRight className="w-[14px] h-[14px] transition-transform" style={{
                          color: "var(--ios-gray3)",
                          transform: expandedGuide === section.type ? "rotate(90deg)" : "rotate(0deg)",
                        }} />
                      </button>
                    </div>
                  )}
                </div>

                {/* 확장: 파일 상세 + 삭제 */}
                <AnimatePresence>
                  {expandedGuide === section.type && hasDoc && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      {sectionDocs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 px-4 py-2.5 ml-[46px]"
                          style={{ borderBottom: "0.5px solid var(--ios-separator)" }}>
                          <FileIcon className="w-4 h-4 shrink-0" style={{ color: section.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] truncate" style={{ color: "var(--text-secondary)" }}>{doc.fileName}</p>
                            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                              {formatSize(doc.fileSize)}
                              {doc.expiresAt && ` · 만료 ${new Date(doc.expiresAt).toLocaleDateString("ko-KR")}`}
                            </p>
                          </div>
                          <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id}
                            className="p-2 rounded-full touch-target" style={{ color: "var(--accent-danger)" }}>
                            {deleting === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                      <p className="px-4 py-2.5 ml-[46px] text-[13px] leading-relaxed" style={{ color: "var(--ios-gray)" }}>
                        💡 {section.guide}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ═══ 선택 서류 섹션 ═══ */}
        <p className="text-[13px] font-medium uppercase tracking-wide mb-2 px-1" style={{ color: "var(--ios-gray)" }}>
          선택 서류
        </p>
        <div className="rounded-xl overflow-hidden mb-6" style={{ background: "var(--bg-grouped-secondary)" }}>
          {optionalDocs.map((section, i) => {
            const sectionDocs = docs.filter(d => d.docType === section.type);
            const hasDoc = sectionDocs.length > 0;
            const isUploading = uploading === section.type;

            return (
              <div key={section.type}>
                <div className="flex items-center gap-3 px-4 py-[11px]"
                  style={{ borderBottom: i < optionalDocs.length - 1 || hasDoc ? `0.5px solid var(--ios-separator)` : "none" }}>
                  <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center shrink-0"
                    style={{ background: section.color }}>
                    <section.icon className="w-[17px] h-[17px] text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[17px]" style={{ color: "var(--text-primary)" }}>{section.label}</span>
                    <p className="text-[13px]" style={{ color: hasDoc ? "var(--accent-success)" : "var(--ios-gray)" }}>
                      {hasDoc ? `${sectionDocs.length}개 등록됨` : "미등록"}
                    </p>
                  </div>
                  {!hasDoc || (section as { allowMultiple?: boolean }).allowMultiple ? (
                    <button onClick={() => triggerUpload(section.type)} disabled={isUploading}
                      className="px-3 py-1.5 rounded-full text-[13px] font-medium disabled:opacity-50"
                      style={{ color: "var(--accent-primary)" }}>
                      {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : "업로드"}
                    </button>
                  ) : (
                    <button onClick={() => setExpandedGuide(expandedGuide === section.type ? null : section.type)}
                      className="p-1 touch-target">
                      <ChevronRight className="w-[14px] h-[14px] transition-transform" style={{
                        color: "var(--ios-gray3)",
                        transform: expandedGuide === section.type ? "rotate(90deg)" : "rotate(0deg)",
                      }} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {expandedGuide === section.type && hasDoc && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      {sectionDocs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 px-4 py-2.5 ml-[46px]"
                          style={{ borderBottom: "0.5px solid var(--ios-separator)" }}>
                          <FileIcon className="w-4 h-4 shrink-0" style={{ color: section.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] truncate" style={{ color: "var(--text-secondary)" }}>{doc.fileName}</p>
                            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{formatSize(doc.fileSize)}</p>
                          </div>
                          <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id}
                            className="p-2 rounded-full touch-target" style={{ color: "var(--accent-danger)" }}>
                            {deleting === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ 만료일 입력 모달 ═══ */}
      <AnimatePresence>
        {showExpiryModal && pendingFile && uploadTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.3)" }}
              onClick={() => { setShowExpiryModal(false); setPendingFile(null); }} />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-5 rounded-t-[20px]"
              style={{ background: "var(--bg-grouped-secondary)" }}
            >
              <div className="w-9 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--ios-separator)" }} />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-bold" style={{ color: "var(--text-primary)" }}>만료일 설정</h3>
                <button onClick={() => { setShowExpiryModal(false); setPendingFile(null); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
                  <X className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                </button>
              </div>
              <p className="text-[13px] mb-4" style={{ color: "var(--ios-gray)" }}>
                {pendingFile.name} — 만료일이 있으면 입력해주세요
              </p>
              <input type="date" value={uploadExpiry} onChange={(e) => setUploadExpiry(e.target.value)}
                className="w-full px-4 py-3 rounded-[10px] text-[15px] outline-none mb-3"
                style={{ background: "var(--ios-fill)", color: "var(--text-primary)" }} />
              <input type="text" value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)}
                placeholder="메모 (선택사항)"
                className="w-full px-4 py-3 rounded-[10px] text-[15px] outline-none mb-4"
                style={{ background: "var(--ios-fill)", color: "var(--text-primary)" }} />
              <div className="flex gap-2">
                <button onClick={() => { if (pendingFile && uploadTarget) doUpload(pendingFile, uploadTarget, "", ""); }}
                  className="flex-1 py-3.5 rounded-xl text-[15px] font-medium"
                  style={{ color: "var(--accent-primary)", border: "1px solid var(--ios-separator)" }}>
                  만료일 없이 업로드
                </button>
                <button onClick={() => { if (pendingFile && uploadTarget) doUpload(pendingFile, uploadTarget, uploadExpiry, uploadDesc); }}
                  className="flex-1 py-3.5 rounded-xl text-[15px] font-semibold text-white"
                  style={{ background: "var(--accent-primary)" }}>
                  업로드
                </button>
              </div>
              <div style={{ height: "env(safe-area-inset-bottom)" }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
