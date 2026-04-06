import type { Metadata } from "next";
import { CommunityLayoutClient } from "./CommunityLayoutClient";

export const metadata: Metadata = {
  title: "강사 라운지 | 나이써",
  description: "강사들의 커뮤니티. 단가 정보, 수업 노하우, 구인구직",
  openGraph: {
    title: "강사 라운지 | 나이써",
    description: "강사들의 커뮤니티. 단가 정보, 수업 노하우, 구인구직",
    url: "https://naisser.ai.kr/community",
    siteName: "나이써 NAISSER",
    locale: "ko_KR",
    type: "website",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommunityLayoutClient>{children}</CommunityLayoutClient>;
}
