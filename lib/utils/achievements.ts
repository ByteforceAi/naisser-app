/**
 * 달성 시스템 — "첫 투표 생성", "댓글 50개 달성" 등 업적
 *
 * localStorage 기반 (추후 서버 연동)
 */

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  condition: string; // 조건 설명
  points: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // 기본
  { id: "first_post", title: "첫 발자국", desc: "첫 글을 작성했습니다", condition: "글 1개 작성", points: 10 },
  { id: "first_comment", title: "대화의 시작", desc: "첫 댓글을 남겼습니다", condition: "댓글 1개 작성", points: 5 },
  { id: "first_like", title: "공감의 시작", desc: "첫 좋아요를 눌렀습니다", condition: "좋아요 1회", points: 3 },
  { id: "first_poll", title: "투표 만들기", desc: "첫 투표를 생성했습니다", condition: "투표 1개 생성", points: 10 },

  // 활동
  { id: "posts_5", title: "꾸준한 작가", desc: "5개의 글을 작성했습니다", condition: "글 5개", points: 20 },
  { id: "posts_20", title: "다작의 달인", desc: "20개의 글을 작성했습니다", condition: "글 20개", points: 50 },
  { id: "comments_10", title: "적극 참여자", desc: "10개의 댓글을 남겼습니다", condition: "댓글 10개", points: 15 },
  { id: "comments_50", title: "토론의 달인", desc: "50개의 댓글을 남겼습니다", condition: "댓글 50개", points: 40 },

  // 인기
  { id: "likes_10", title: "인기 상승", desc: "좋아요 10개를 받았습니다", condition: "받은 좋아요 10", points: 15 },
  { id: "likes_100", title: "인기 스타", desc: "좋아요 100개를 받았습니다", condition: "받은 좋아요 100", points: 50 },
  { id: "helpful_10", title: "도움의 손길", desc: "도움됐어요 10개를 받았습니다", condition: "받은 도움 10", points: 20 },
  { id: "helpful_50", title: "동료의 빛", desc: "도움됐어요 50개를 받았습니다", condition: "받은 도움 50", points: 60 },

  // 스트릭
  { id: "streak_3", title: "시작이 반", desc: "3일 연속 활동했습니다", condition: "3일 연속", points: 10 },
  { id: "streak_7", title: "일주일 챔피언", desc: "7일 연속 활동했습니다", condition: "7일 연속", points: 30 },
  { id: "streak_30", title: "한 달의 기적", desc: "30일 연속 활동했습니다", condition: "30일 연속", points: 100 },

  // 프로필
  { id: "profile_complete", title: "프로필 마스터", desc: "프로필 100% 완성했습니다", condition: "프로필 완성도 100%", points: 25 },
  { id: "cover_image", title: "커버 아티스트", desc: "커버 이미지를 등록했습니다", condition: "커버 이미지 업로드", points: 10 },
  { id: "sns_linked", title: "연결의 달인", desc: "SNS 링크를 3개 이상 등록했습니다", condition: "SNS 3개+", points: 15 },
];

const ACHIEVED_KEY = "naisser_achievements";

export function getAchievedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(ACHIEVED_KEY) || "[]");
  } catch { return []; }
}

export function markAchieved(id: string): boolean {
  const achieved = getAchievedIds();
  if (achieved.includes(id)) return false;
  achieved.push(id);
  try { localStorage.setItem(ACHIEVED_KEY, JSON.stringify(achieved)); } catch { /* */ }
  return true;
}

export function getTotalPoints(): number {
  const achieved = getAchievedIds();
  return ACHIEVEMENTS
    .filter((a) => achieved.includes(a.id))
    .reduce((sum, a) => sum + a.points, 0);
}
