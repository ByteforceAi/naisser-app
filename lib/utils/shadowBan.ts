/**
 * 쉐도우밴 시스템
 *
 * 쉐도우밴된 유저의 글은 본인에게만 보임
 * 다른 유저에게는 피드에서 자동 필터됨
 *
 * TODO: DB 기반으로 마이그레이션 (현재는 인메모리)
 */

// 서버에서 관리할 쉐도우밴 유저 ID 목록
// 실제로는 DB에 is_shadow_banned 컬럼 추가
let shadowBannedUsers: Set<string> = new Set();

export function isShadowBanned(userId: string): boolean {
  return shadowBannedUsers.has(userId);
}

export function shadowBan(userId: string) {
  shadowBannedUsers.add(userId);
  // TODO: await db.update(users).set({ isShadowBanned: true }).where(eq(users.id, userId));
}

export function removeShadowBan(userId: string) {
  shadowBannedUsers.delete(userId);
}

/**
 * 피드 필터 — 쉐도우밴 유저의 글을 제외
 * API route에서 사용
 *
 * const posts = await db.query.communityPosts.findMany({ ... });
 * const filtered = filterShadowBanned(posts, currentUserId);
 */
export function filterShadowBanned<T extends { authorId: string }>(
  posts: T[],
  currentUserId?: string
): T[] {
  return posts.filter((p) => {
    // 본인 글은 항상 보임
    if (p.authorId === currentUserId) return true;
    // 쉐도우밴 유저의 글은 숨김
    return !isShadowBanned(p.authorId);
  });
}
