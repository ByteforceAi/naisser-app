/**
 * 강사 인증마크 시스템
 *
 * 조건:
 * 1. 필수 서류 3종 완비 (범죄경력, 통장, 이력서)
 * 2. 출강 확인 5회 이상
 * 3. 평균 평점 4.0 이상
 * 4. 프로필 완성도 80% 이상
 *
 * 등급:
 * - 없음: 조건 미달
 * - 🔵 인증: 조건 1+2 충족
 * - 🟡 골드인증: 조건 1+2+3 충족
 * - 💎 다이아인증: 전부 충족 + 출강 20회+
 */

export type CertLevel = "none" | "certified" | "gold" | "diamond";

export interface CertResult {
  level: CertLevel;
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
  reasons: string[];
  missing: string[];
}

export function calculateCertification(params: {
  documentsComplete: boolean; // 필수 서류 3종 완비
  confirmedCount: number;     // 확인된 출강 수
  averageRating: number;      // 평균 평점
  profileCompleteness: number; // 프로필 완성도 (0~100)
}): CertResult {
  const { documentsComplete, confirmedCount, averageRating, profileCompleteness } = params;

  const reasons: string[] = [];
  const missing: string[] = [];

  // 체크
  if (documentsComplete) reasons.push("서류 완비");
  else missing.push("필수 서류 3종 업로드");

  if (confirmedCount >= 5) reasons.push(`출강 ${confirmedCount}회`);
  else missing.push(`출강 확인 ${5 - confirmedCount}회 더 필요`);

  if (averageRating >= 4.0) reasons.push(`평점 ${averageRating.toFixed(1)}`);
  else if (confirmedCount > 0) missing.push("평균 평점 4.0 이상 필요");

  if (profileCompleteness >= 80) reasons.push("프로필 완성");
  else missing.push(`프로필 ${80 - profileCompleteness}% 더 완성`);

  // 등급 판정
  if (documentsComplete && confirmedCount >= 20 && averageRating >= 4.0 && profileCompleteness >= 80) {
    return { level: "diamond", label: "다이아 인증", color: "#6366F1", bgColor: "rgba(99,102,241,0.08)", emoji: "💎", reasons, missing };
  }
  if (documentsComplete && confirmedCount >= 5 && averageRating >= 4.0) {
    return { level: "gold", label: "골드 인증", color: "#D97706", bgColor: "rgba(217,119,6,0.08)", emoji: "🏅", reasons, missing };
  }
  if (documentsComplete && confirmedCount >= 5) {
    return { level: "certified", label: "인증 강사", color: "#2563EB", bgColor: "rgba(37,99,235,0.08)", emoji: "✅", reasons, missing };
  }

  return { level: "none", label: "미인증", color: "#9CA3AF", bgColor: "rgba(156,163,175,0.08)", emoji: "", reasons, missing };
}
