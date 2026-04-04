/**
 * 커뮤니티 유저 등급 시스템
 *
 * 활동 기반 자동 등급:
 * - 씨앗 (0~9점): 가입 직후
 * - 새싹 (10~49점): 글 2~3개, 댓글 5개 정도
 * - 나무 (50~199점): 꾸준한 활동
 * - 숲 (200+점): 헤비 유저
 *
 * 점수 계산:
 * - 글 작성: +5점
 * - 댓글 작성: +2점
 * - 받은 좋아요: +1점
 * - 받은 도움됐어요: +3점
 * - 연속 활동 7일: +10점 보너스
 */

export interface GradeInfo {
  level: "seed" | "sprout" | "tree" | "forest";
  label: string;
  icon: string; // 이모지 아닌 텍스트 표현
  color: string;
  minScore: number;
}

export const GRADES: GradeInfo[] = [
  { level: "seed", label: "씨앗", icon: "Lv.1", color: "#9CA3AF", minScore: 0 },
  { level: "sprout", label: "새싹", icon: "Lv.2", color: "#10B981", minScore: 10 },
  { level: "tree", label: "나무", icon: "Lv.3", color: "#3B82F6", minScore: 50 },
  { level: "forest", label: "숲", icon: "Lv.4", color: "#8B5CF6", minScore: 200 },
];

export function getGrade(score: number): GradeInfo {
  for (let i = GRADES.length - 1; i >= 0; i--) {
    if (score >= GRADES[i].minScore) return GRADES[i];
  }
  return GRADES[0];
}

export function calculateScore(stats: {
  postCount: number;
  commentCount: number;
  receivedLikes: number;
  receivedHelpfuls: number;
  streakBonus: number;
}): number {
  return (
    stats.postCount * 5 +
    stats.commentCount * 2 +
    stats.receivedLikes * 1 +
    stats.receivedHelpfuls * 3 +
    stats.streakBonus
  );
}
