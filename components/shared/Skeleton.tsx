"use client";

/**
 * 스켈레톤 로딩 컴포넌트
 * shimmer 효과 — 왼→오 빛나는 애니메이션
 */

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

export function Skeleton({
  className = "",
  width,
  height,
  rounded = "rounded-xl",
}: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${rounded} ${className}`}
      style={{ width, height }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
          animation: "shimmer 1.5s infinite",
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

/** 강사 카드 스켈레톤 */
export function InstructorCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-white/70 border border-gray-50 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="w-14 h-14" rounded="rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" />
          <Skeleton height={12} width="30%" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton height={24} width={50} rounded="rounded-full" />
        <Skeleton height={24} width={40} rounded="rounded-full" />
        <Skeleton height={24} width={45} rounded="rounded-full" />
      </div>
    </div>
  );
}

/** 통계 카드 스켈레톤 */
export function StatCardSkeleton() {
  return (
    <div className="p-3 rounded-2xl bg-white/70 border border-gray-50 text-center space-y-2">
      <Skeleton className="w-8 h-8 mx-auto" rounded="rounded-xl" />
      <Skeleton height={20} width="50%" className="mx-auto" />
      <Skeleton height={10} width="40%" className="mx-auto" />
    </div>
  );
}

/** 리스트 아이템 스켈레톤 */
export function ListItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/70 border border-gray-50">
          <Skeleton className="w-10 h-10 shrink-0" rounded="rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton height={14} width="70%" />
            <Skeleton height={10} width="45%" />
          </div>
        </div>
      ))}
    </div>
  );
}
