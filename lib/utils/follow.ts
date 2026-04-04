/**
 * 관심 강사 (팔로우) 시스템
 *
 * 현재: localStorage 기반
 * 추후: DB 연동 + 알림
 *
 * MAU 500+ 이후 활성화 권장
 * 유저 수 적을 때 "팔로워 0명"이 보이면 서비스가 죽어보임
 */

const FOLLOW_KEY = "naisser_following";

export function getFollowing(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]");
  } catch { return []; }
}

export function isFollowing(userId: string): boolean {
  return getFollowing().includes(userId);
}

export function toggleFollow(userId: string): boolean {
  const list = getFollowing();
  const idx = list.indexOf(userId);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    return false; // unfollowed
  } else {
    list.push(userId);
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
    return true; // followed
  }
}

export function getFollowingCount(): number {
  return getFollowing().length;
}
