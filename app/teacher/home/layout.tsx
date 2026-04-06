import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "강사 검색 | 나이써",
  description: "검증된 학교 찾아가는 강사를 검색하고 수업을 의뢰하세요",
  openGraph: {
    title: "강사 검색 | 나이써",
    description: "검증된 학교 찾아가는 강사를 검색하고 수업을 의뢰하세요",
    url: "https://naisser.ai.kr/teacher/home",
    siteName: "나이써 NAISSER",
    locale: "ko_KR",
    type: "website",
  },
};

export default function TeacherHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
