/**
 * 주간 활동 리포트 — 앱 내 알림
 *
 * "이번 주 3명이 도움됐다고 했어요"
 * 매주 일요일 오후에 표시
 */

export interface WeeklyReport {
  newLikes: number;
  newComments: number;
  newHelpfuls: number;
  newFollowers: number;
  postViews: number;
  topPost?: { id: string; title: string; likeCount: number };
}

export function generateWeeklyReportMessage(report: WeeklyReport): string | null {
  const total = report.newLikes + report.newComments + report.newHelpfuls;
  if (total === 0) return null;

  const parts: string[] = [];

  if (report.newHelpfuls > 0) {
    parts.push(`${report.newHelpfuls}명이 도움됐다고 했어요`);
  }
  if (report.newLikes > 0) {
    parts.push(`좋아요 ${report.newLikes}개`);
  }
  if (report.newComments > 0) {
    parts.push(`댓글 ${report.newComments}개`);
  }

  return `이번 주: ${parts.join(" · ")}`;
}

/**
 * 주간 리포트 표시 여부 확인
 * 일요일 15~21시 사이에만 표시, 주 1회
 */
export function shouldShowWeeklyReport(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = 일요일
  const hour = now.getHours();

  if (day !== 0 || hour < 15 || hour > 21) return false;

  const lastShown = localStorage.getItem("naisser_weekly_report_shown");
  if (lastShown) {
    const lastDate = new Date(lastShown);
    const daysDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff < 6) return false; // 최소 6일 간격
  }

  return true;
}

export function markWeeklyReportShown() {
  localStorage.setItem("naisser_weekly_report_shown", new Date().toISOString());
}
