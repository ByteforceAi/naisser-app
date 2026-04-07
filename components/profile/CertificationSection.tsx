"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface CertificationSectionProps {
  certifications: string[];
}

export function CertificationSection({ certifications }: CertificationSectionProps) {
  if (!certifications || certifications.length === 0) return null;

  return (
    <div className="px-6 mb-8">
      <h2 className="text-[12px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
        자격/인증
      </h2>
      <div className="p-4 rounded-xl space-y-2.5"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--glass-border)",
        }}>
        {certifications.map((cert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-2.5"
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "rgba(5,150,105,0.08)" }}>
              <Shield className="w-3.5 h-3.5 text-[var(--accent-success)]" />
            </div>
            <span className="text-[14px] text-[var(--text-primary)]">{cert}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
