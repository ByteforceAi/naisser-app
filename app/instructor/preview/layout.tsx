import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "강사 둘러보기 | 나이써",
  description: "나이써에서 프리랜서 강사의 업무를 한곳에서 관리하세요",
  openGraph: {
    title: "강사 둘러보기 | 나이써",
    description: "나이써에서 프리랜서 강사의 업무를 한곳에서 관리하세요",
    url: "https://naisser.ai.kr/instructor/preview",
    siteName: "나이써 NAISSER",
    locale: "ko_KR",
    type: "website",
  },
};

export default function InstructorPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
