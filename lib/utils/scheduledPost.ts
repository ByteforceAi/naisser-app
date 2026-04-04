/**
 * 예약 게시 — 특정 시간에 자동 게시
 *
 * 작성 시 scheduledAt 시간을 설정하면
 * 해당 시간까지 draft 상태, 이후 published로 전환
 *
 * TODO: 서버 cron job으로 실제 전환 구현
 * 현재는 클라이언트에서 UI 구조만
 */

export interface ScheduledPostData {
  body: string;
  category: string;
  images?: string[];
  pollQuestion?: string;
  pollOptions?: string[];
  scheduledAt: string; // ISO 8601
}

const SCHEDULED_KEY = "naisser_scheduled_posts";

export function getScheduledPosts(): ScheduledPostData[] {
  try {
    return JSON.parse(localStorage.getItem(SCHEDULED_KEY) || "[]");
  } catch { return []; }
}

export function addScheduledPost(post: ScheduledPostData) {
  const posts = getScheduledPosts();
  posts.push(post);
  localStorage.setItem(SCHEDULED_KEY, JSON.stringify(posts));
}

export function removeScheduledPost(index: number) {
  const posts = getScheduledPosts();
  posts.splice(index, 1);
  localStorage.setItem(SCHEDULED_KEY, JSON.stringify(posts));
}

/**
 * 예약 시간이 지난 글 확인
 * 앱 시작 시 호출하여 자동 게시
 */
export function getReadyToPublish(): ScheduledPostData[] {
  const now = new Date().toISOString();
  return getScheduledPosts().filter((p) => p.scheduledAt <= now);
}
