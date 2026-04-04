/**
 * 올해의 활동 리뷰 — 연말 요약 카드
 *
 * "2026년, 당신의 한 해"
 * 학교 N곳, 수업 M시간, 도움됐어요 K개...
 */

export interface YearReviewData {
  year: number;
  totalSchools: number;
  totalClasses: number;
  totalHours: number;
  totalPosts: number;
  totalComments: number;
  totalLikesReceived: number;
  totalHelpfulsReceived: number;
  topCategory: string; // 가장 많이 활동한 카테고리
  longestStreak: number;
  rank: string; // "상위 10%", "상위 30%" 등
}

export function generateReviewMessage(data: YearReviewData): string {
  const lines: string[] = [];

  lines.push(`${data.year}년, 당신의 한 해`);
  lines.push("");

  if (data.totalSchools > 0) {
    lines.push(`${data.totalSchools}개 학교에서`);
    lines.push(`${data.totalClasses}번의 수업을 진행했어요.`);
    lines.push(`총 ${data.totalHours}시간의 소중한 시간이었습니다.`);
    lines.push("");
  }

  if (data.totalPosts > 0) {
    lines.push(`커뮤니티에서 ${data.totalPosts}개의 글을 작성하고`);
    lines.push(`${data.totalLikesReceived}개의 좋아요를 받았어요.`);
  }

  if (data.totalHelpfulsReceived >= 10) {
    lines.push(`무려 ${data.totalHelpfulsReceived}명에게 도움이 되었습니다!`);
  }

  if (data.longestStreak >= 7) {
    lines.push("");
    lines.push(`최장 ${data.longestStreak}일 연속 활동!`);
  }

  lines.push("");
  lines.push(`당신은 나이써 ${data.rank} 강사입니다.`);
  lines.push("내년에도 함께해요. 감사합니다.");

  return lines.join("\n");
}
