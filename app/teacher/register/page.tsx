"use client";

import { useState } from "react";
import { ArrowLeft, Search, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    schoolName: "",
    naisNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "이름을 입력해주세요.";
    if (!formData.schoolName) newErrors.schoolName = "학교를 선택해주세요.";
    if (formData.naisNumber && !/^[A-Za-z]\d{9}$/.test(formData.naisNumber)) {
      newErrors.naisNumber = "나이스번호 형식이 올바르지 않습니다. (영문 1자 + 숫자 9자)";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          schoolName: formData.schoolName,
          naisNumber: formData.naisNumber || undefined,
        }),
      });

      if (res.ok) {
        router.push("/teacher/home");
      } else {
        const err = await res.json();
        if (res.status === 409) {
          setErrors({ name: err.error || "이미 등록되어 있습니다." });
        } else {
          setErrors({ name: err.error || "가입 중 오류가 발생했습니다." });
        }
      }
    } catch {
      setErrors({ name: "네트워크 오류가 발생했습니다." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="px-4 pt-3 pb-4 bg-[var(--bg-surface)] border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="touch-target">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold">교사 가입</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">이름 *</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="실명을 입력해주세요"
            className={cn(
              "w-full px-4 py-3 rounded-xl border bg-[var(--bg-surface)] text-sm",
              "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30",
              errors.name ? "border-[var(--accent-danger)]" : "border-[var(--glass-border)]"
            )}
          />
          {errors.name && <p className="mt-1 text-xs text-[var(--accent-danger)]">{errors.name}</p>}
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">전화번호</label>
          <input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="010-1234-5678"
            className="w-full px-4 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-surface)] text-sm
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">이메일</label>
          <input
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
            type="email"
            className="w-full px-4 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-surface)] text-sm
                       focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
          />
        </div>

        {/* 학교명 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">학교명 *</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              placeholder="학교 검색 (예: 해강초등학교)"
              className={cn(
                "w-full pl-9 pr-4 py-3 rounded-xl border bg-[var(--bg-surface)] text-sm",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30",
                errors.schoolName ? "border-[var(--accent-danger)]" : "border-[var(--glass-border)]"
              )}
            />
          </div>
          {errors.schoolName && <p className="mt-1 text-xs text-[var(--accent-danger)]">{errors.schoolName}</p>}
        </div>

        {/* 나이스번호 */}
        <div>
          <label className="block text-sm font-medium mb-1.5">나이스번호</label>
          <input
            value={formData.naisNumber}
            onChange={(e) => setFormData({ ...formData, naisNumber: e.target.value.toUpperCase() })}
            placeholder="A123456789"
            className={cn(
              "w-full px-4 py-3 rounded-xl border bg-[var(--bg-surface)] text-sm",
              "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30",
              errors.naisNumber ? "border-[var(--accent-danger)] animate-shake" : "border-[var(--glass-border)]"
            )}
          />
          {errors.naisNumber && <p className="mt-1 text-xs text-[var(--accent-danger)]">{errors.naisNumber}</p>}
        </div>

        {/* 주의사항 */}
        <div className="glass-card p-4 text-xs text-[var(--text-secondary)] leading-relaxed">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[var(--accent-warning)] mt-0.5 shrink-0" />
            <p>계약 체결 전 강사님과 꼭 통화하시고 수업에 대한 이야기를 나누시기 바랍니다.</p>
          </div>
        </div>

        {/* 제출 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={cn(
            "w-full py-3.5 text-white rounded-xl font-semibold transition-all duration-200 touch-target",
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[var(--accent-primary)] shadow-btn-primary hover:shadow-btn-primary-hover"
          )}
        >
          {submitting ? "가입 중..." : "가입 완료"}
        </button>
      </div>
    </div>
  );
}
