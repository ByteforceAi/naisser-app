"use client";

import { motion } from "framer-motion";
import { DollarSign, Package, Truck, Users, Clock } from "lucide-react";

interface CostSectionProps {
  feeType?: string | null;
  feeNote?: string | null;
  materialCostPerPerson?: number | null;
  materialCostNote?: string | null;
  preparation?: string | null;
  transportIncluded?: boolean;
  minStudents?: number | null;
  maxStudents?: number | null;
  classDuration?: string | null;
}

const PREP_LABELS: Record<string, string> = {
  instructor: "강사 지참",
  school: "학교 준비",
  both: "협의",
};

export function CostSection({
  feeType,
  feeNote,
  materialCostPerPerson,
  materialCostNote,
  preparation,
  transportIncluded,
  minStudents,
  maxStudents,
  classDuration,
}: CostSectionProps) {
  // 표시할 정보가 하나도 없으면 렌더 안 함
  const hasInfo = feeType || materialCostPerPerson || preparation || classDuration;
  if (!hasInfo) return null;

  const items = [
    {
      icon: DollarSign,
      label: "강사비",
      value: feeNote || (feeType === "school_standard" ? "학교 기준에 따름" : feeType === "negotiable" ? "협의" : "별도 안내"),
    },
    materialCostPerPerson !== null && materialCostPerPerson !== undefined ? {
      icon: Package,
      label: "재료비",
      value: materialCostPerPerson === 0
        ? "없음"
        : `인당 ${materialCostPerPerson.toLocaleString()}원${materialCostNote ? ` (${materialCostNote})` : ""}`,
    } : null,
    preparation ? {
      icon: Package,
      label: "준비물",
      value: PREP_LABELS[preparation] || preparation,
    } : null,
    transportIncluded !== undefined ? {
      icon: Truck,
      label: "교통비",
      value: transportIncluded ? "포함" : "별도 협의",
    } : null,
    (minStudents || maxStudents) ? {
      icon: Users,
      label: "인원",
      value: minStudents && maxStudents
        ? `${minStudents}~${maxStudents}명`
        : minStudents
        ? `최소 ${minStudents}명`
        : `최대 ${maxStudents}명`,
    } : null,
    classDuration ? {
      icon: Clock,
      label: "수업 시간",
      value: classDuration,
    } : null,
  ].filter(Boolean) as { icon: typeof DollarSign; label: string; value: string }[];

  return (
    <div className="px-6 mb-8">
      <h2 className="text-[12px] font-bold tracking-wider text-[var(--text-muted)] uppercase mb-3">
        비용 안내
      </h2>
      <div className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--glass-border)" }}>
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3"
            style={i < items.length - 1 ? { borderBottom: "1px solid var(--glass-border)" } : {}}
          >
            <item.icon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <span className="text-[13px] text-[var(--text-secondary)] w-16 shrink-0">{item.label}</span>
            <span className="text-[14px] text-[var(--text-primary)] flex-1">{item.value}</span>
          </motion.div>
        ))}
      </div>
      {/* 교육청 기준 단가 참고 */}
      <div className="mt-3 rounded-xl px-3 py-2.5"
        style={{ background: "color-mix(in srgb, var(--accent-primary) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--accent-primary) 10%, transparent)" }}>
        <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--accent-primary)" }}>
          교육청 기준 참고 단가
        </p>
        <div className="space-y-0.5">
          <p className="text-[11px] text-[var(--text-secondary)]">
            외부특강 (무상방과후): 차시당 40,000원
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            방과후학교 수강료: 월 28,000~56,000원
          </p>
        </div>
        <p className="text-[11px] mt-1 text-[var(--text-muted)]">
          실제 비용은 지역·학교 기준에 따라 다를 수 있습니다
        </p>
      </div>
    </div>
  );
}
