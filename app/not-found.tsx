import { Search, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen page-bg-mesh page-bg-dots flex items-center justify-center px-6">
      <div className="relative z-10 text-center max-w-sm">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.08))",
            border: "1px solid rgba(37,99,235,0.10)",
          }}
        >
          <Search className="w-8 h-8 text-[var(--accent-primary)]" style={{ opacity: 0.6 }} />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold text-white
                     transition-all duration-200 hover:shadow-lg"
          style={{
            background: "linear-gradient(135deg, #3B6CF6, #5B8AFF)",
            boxShadow: "0 4px 16px rgba(59,108,246,0.3)",
          }}
        >
          <Home className="w-4 h-4" />
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
