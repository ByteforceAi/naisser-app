/**
 * 재방문 유도 — 푸시 알림 메시지 생성
 *
 * 마지막 방문으로부터 경과 시간에 따라 다른 메시지
 */

const LAST_VISIT_KEY = "naisser_last_visit";

export function recordVisit() {
  localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
}

export function getLastVisit(): Date | null {
  const saved = localStorage.getItem(LAST_VISIT_KEY);
  return saved ? new Date(saved) : null;
}

export function getDaysSinceLastVisit(): number {
  const last = getLastVisit();
  if (!last) return 999;
  return Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 재방문 유도 푸시 메시지 선택
 */
export function getReEngagementMessage(): { title: string; body: string } | null {
  const days = getDaysSinceLastVisit();

  if (days <= 1) return null; // 어제 방문했으면 안 보냄

  if (days <= 3) {
    return {
      title: "어제 인기글 못 보셨죠?",
      body: "강사 라운지에 새로운 노하우가 올라왔어요",
    };
  }

  if (days <= 7) {
    return {
      title: "이번 주 단가 정보 업데이트",
      body: "다른 강사님들은 얼마 받고 계실까요?",
    };
  }

  if (days <= 14) {
    return {
      title: "요즘 강사 라운지가 뜨겁습니다",
      body: `${days}일 동안 새 글 ${Math.floor(days * 3)}개가 올라왔어요`,
    };
  }

  return {
    title: "오랜만이에요!",
    body: "동료 강사님들이 기다리고 있어요. 근황 한 줄 남겨보세요",
  };
}
