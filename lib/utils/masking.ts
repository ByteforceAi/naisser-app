/**
 * 서버단 연락처 마스킹 유틸
 * docs/02-AUTH-SYSTEM.md — "연락처 마스킹 (서버단)" 섹션 참조
 *
 * 마스킹 정책:
 * - 비로그인/비회원: phone 뒤 4자리 ****, SNS 빈 배열, CRM 필드 제거
 * - 로그인 교사: 전체 노출
 * - 강사 본인: 본인 프로필 전체 노출
 */

import type { AuthSession } from "@/lib/auth/middleware";

/** 전화번호 마스킹: 010-1234-5678 → 010-****-5678 */
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})-(\d{4})-(\d{4})/, "$1-****-$3");
}

/** 이메일 마스킹: user@email.com → u***@email.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked = local.charAt(0) + "***";
  return `${masked}@${domain}`;
}

/** SNS URL 마스킹: platform:url → platform:*** */
export function maskSns(snsEntries: string[]): string[] {
  return snsEntries.map((entry) => {
    const [platform] = entry.split(":");
    return `${platform}:***`;
  });
}

/** 강사 프로필 응답에서 민감 정보를 마스킹 */
export function maskInstructorProfile<
  T extends {
    id: string;
    userId?: string | null;
    phone: string;
    snsAccounts?: string[] | null;
    adminNotes?: string | null;
    status?: string | null;
  },
>(
  instructor: T,
  session: AuthSession | null
): T {
  // 1. 관리자 → 전체 노출
  if (session?.user?.role === "admin") return instructor;

  // 2. 강사 본인 → 전체 노출
  if (
    session?.user?.role === "instructor" &&
    session.user.profileId === instructor.id
  ) {
    return instructor;
  }

  // 3. 로그인한 교사 → 연락처 노출, CRM 필드 제거
  if (session?.user?.role === "teacher") {
    return {
      ...instructor,
      adminNotes: null,
      status: null,
    };
  }

  // 4. 비로그인/기타 → 마스킹
  return {
    ...instructor,
    phone: maskPhone(instructor.phone),
    snsAccounts: [],
    adminNotes: null,
    status: null,
  };
}
