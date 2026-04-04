"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommunityGuidelinesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen page-bg-mesh page-bg-mesh-warm page-bg-dots">
      <header className="sticky top-0 z-40 community-header">
        <div className="max-w-[520px] mx-auto flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--subtle-hover)] transition-colors touch-target">
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
          <h1 className="text-[15px] font-bold text-[var(--text-primary)]">커뮤니티 가이드라인</h1>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 pt-4 pb-24 space-y-6">
        <section>
          <h2 className="text-[14px] font-bold text-[var(--text-primary)] mb-2">강사 라운지는</h2>
          <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
            학교 찾아가는 강사들이 서로의 경험과 정보를 나누는 전문가 커뮤니티입니다.
            서로를 존중하고, 건설적인 대화를 나눠주세요.
          </p>
        </section>

        <section>
          <h2 className="text-[14px] font-bold text-[var(--text-primary)] mb-2">지켜주세요</h2>
          <ul className="space-y-2 text-[13px] text-[var(--text-secondary)] leading-[1.7]">
            <li className="flex gap-2"><span className="text-[var(--accent-success)] shrink-0">✓</span> 실명으로 활동하며, 전문가로서의 예의를 지켜주세요</li>
            <li className="flex gap-2"><span className="text-[var(--accent-success)] shrink-0">✓</span> 단가 정보는 지역과 분야를 함께 공유해주세요</li>
            <li className="flex gap-2"><span className="text-[var(--accent-success)] shrink-0">✓</span> 노하우와 정보는 구체적일수록 도움이 됩니다</li>
            <li className="flex gap-2"><span className="text-[var(--accent-success)] shrink-0">✓</span> 출처를 밝히고, 정확한 정보를 공유해주세요</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[14px] font-bold text-[var(--text-primary)] mb-2">금지 사항</h2>
          <ul className="space-y-2 text-[13px] text-[var(--text-secondary)] leading-[1.7]">
            <li className="flex gap-2"><span className="text-[var(--accent-danger)] shrink-0">✕</span> 욕설, 비방, 차별적 표현</li>
            <li className="flex gap-2"><span className="text-[var(--accent-danger)] shrink-0">✕</span> 광고, 스팸, 홍보성 게시글</li>
            <li className="flex gap-2"><span className="text-[var(--accent-danger)] shrink-0">✕</span> 타인의 개인정보 노출 (전화번호, 주소 등)</li>
            <li className="flex gap-2"><span className="text-[var(--accent-danger)] shrink-0">✕</span> 허위 정보, 루머 유포</li>
            <li className="flex gap-2"><span className="text-[var(--accent-danger)] shrink-0">✕</span> 학교/교사에 대한 비난이나 명예훼손</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[14px] font-bold text-[var(--text-primary)] mb-2">위반 시</h2>
          <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
            가이드라인을 위반한 게시글은 사전 통보 없이 삭제될 수 있으며,
            반복 위반 시 활동이 제한될 수 있습니다.
            부당하다고 느끼시면 설정 → 도움말에서 이의제기할 수 있습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
