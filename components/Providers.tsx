"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/shared/Toast";
import { useTheme } from "@/lib/hooks/useTheme";

function ThemeInit() {
  useTheme(); // 테마 초기화 (localStorage에서 읽어서 data-theme 속성 적용)
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeInit />
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
