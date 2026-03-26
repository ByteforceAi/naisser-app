"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/** 3칸 분리 전화번호 입력 + 자동 포커스 + 붙여넣기 지원 */
export function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  const parts = value.split("-");
  const [p1, setP1] = useState(parts[0] || "010");
  const [p2, setP2] = useState(parts[1] || "");
  const [p3, setP3] = useState(parts[2] || "");

  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);

  const update = (np1: string, np2: string, np3: string) => {
    setP1(np1);
    setP2(np2);
    setP3(np3);
    onChange(`${np1}-${np2}-${np3}`);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (text.length >= 10) {
      const a = text.slice(0, 3);
      const b = text.length === 11 ? text.slice(3, 7) : text.slice(3, 6);
      const c = text.length === 11 ? text.slice(7) : text.slice(6);
      update(a, b, c);
      ref3.current?.focus();
    }
  };

  return (
    <div>
      <div className="flex gap-2 items-center" onPaste={handlePaste}>
        <input
          value={p1}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 3);
            update(v, p2, p3);
            if (v.length === 3) ref2.current?.focus();
          }}
          className={cn(
            "w-16 text-center px-2 py-3 rounded-xl border bg-[var(--bg-surface)] text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]",
            error && "border-[var(--accent-danger)] animate-shake"
          )}
          inputMode="numeric"
          maxLength={3}
        />
        <span className="text-[var(--text-muted)]">-</span>
        <input
          ref={ref2}
          value={p2}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            update(p1, v, p3);
            if (v.length === 4) ref3.current?.focus();
          }}
          className={cn(
            "w-20 text-center px-2 py-3 rounded-xl border bg-[var(--bg-surface)] text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]",
            error && "border-[var(--accent-danger)] animate-shake"
          )}
          inputMode="numeric"
          maxLength={4}
          placeholder="1234"
        />
        <span className="text-[var(--text-muted)]">-</span>
        <input
          ref={ref3}
          value={p3}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            update(p1, p2, v);
          }}
          className={cn(
            "w-20 text-center px-2 py-3 rounded-xl border bg-[var(--bg-surface)] text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]",
            error && "border-[var(--accent-danger)] animate-shake"
          )}
          inputMode="numeric"
          maxLength={4}
          placeholder="5678"
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-[var(--accent-danger)]"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
