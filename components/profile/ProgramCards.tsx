"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Users, BookOpen, Package } from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string;
  topic: string | null;
  targetGrade: string | null;
  duration: string | null;
  maxStudents: number | null;
  materialsCost: string | null;
  includes: string[] | null;
  images: string[] | null;
}

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function ProgramCards({ instructorId }: { instructorId: string }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/instructors/${instructorId}/programs`)
      .then((r) => r.json())
      .then((json) => setPrograms(json.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [instructorId]);

  if (loading || programs.length === 0) return null;

  return (
    <div className="px-6 mb-8">
      <h2 className="text-[12px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
        수업 프로그램
      </h2>
      <div className="space-y-3">
        {programs.map((p, i) => (
          <motion.div
            key={p.id}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-2">
              {p.title}
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mb-3"
              style={{ lineHeight: 1.6 }}>
              {p.description}
            </p>
            <div className="flex flex-wrap gap-3 text-[12px] text-[var(--text-muted)]">
              {p.targetGrade && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> {p.targetGrade}
                </span>
              )}
              {p.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {p.duration}
                </span>
              )}
              {p.maxStudents && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> 최대 {p.maxStudents}명
                </span>
              )}
              {p.materialsCost && (
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" /> {p.materialsCost}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
