import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "교사 둘러보기 | 나이써",
  description: "나이써에서 검증된 강사를 검색하고 수업을 의뢰하는 경험을 미리 체험해보세요",
  openGraph: {
    title: "교사 둘러보기 | 나이써",
    description: "나이써에서 검증된 강사를 검색하고 수업을 의뢰하는 경험을 미리 체험해보세요",
    url: "https://naisser.ai.kr/teacher/preview",
    siteName: "나이써 NAISSER",
    locale: "ko_KR",
    type: "website",
  },
};

export default function TeacherPreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
