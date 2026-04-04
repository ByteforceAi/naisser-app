import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    url: "https://naisser.ai.kr",
    title: "나이써 | 학교 찾아가는 강사 매칭",
    description: "학교 찾아가는 강사와 교사를 연결하는 교육 매칭 플랫폼",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://naisser.ai.kr"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "나이써",
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
      <head>
        {/* 테마 FOUC 방지 — hydration 전 즉시 실행 */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('naisser_theme');
              if (t === 'dark') { document.documentElement.setAttribute('data-theme','dark'); }
              else if (t === 'schedule') {
                var h = new Date().getHours();
                document.documentElement.setAttribute('data-theme', h<6||h>=18 ? 'dark' : 'light');
              } else if (t === 'light') { document.documentElement.setAttribute('data-theme','light'); }
              else {
                var d = window.matchMedia('(prefers-color-scheme:dark)').matches;
                document.documentElement.setAttribute('data-theme', d?'dark':'light');
              }
            } catch(e) { document.documentElement.setAttribute('data-theme','light'); }
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
