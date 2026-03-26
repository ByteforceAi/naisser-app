import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "나이써 | 학교 찾아가는 강사 매칭",
    template: "%s | 나이써",
  },
  description:
    "학교 찾아가는 강사와 교사를 연결하는 교육 매칭 플랫폼. 검증된 강사를 쉽고 빠르게 찾아보세요.",
  keywords: ["강사 매칭", "학교 강사", "교육 플랫폼", "찾아가는 강사", "나이써"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "나이써 NAISSER",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
