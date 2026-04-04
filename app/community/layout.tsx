"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const role = (session?.user as { role?: string } | undefined)?.role;

  // 교사 접근 차단
  useEffect(() => {
    if (status === "authenticated" && role === "teacher") {
      router.replace("/teacher/home");
    }
  }, [status, role, router]);

  if (status === "authenticated" && role === "teacher") return null;

  // 글쓰기/상세 등 풀스크린 페이지에서는 BottomNav 숨김
  const hideNav = pathname.includes("/write") || pathname.includes("/post/");

  return (
    <div className={hideNav ? "min-h-screen" : "min-h-screen pb-20"}>
      {children}
      {!hideNav && <BottomNav role="instructor" />}
    </div>
  );
}
