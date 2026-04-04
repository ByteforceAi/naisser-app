/**
 * 접근성 유틸리티
 *
 * - 키보드 이벤트 핸들러
 * - 스크린리더 전용 텍스트
 * - 포커스 트랩
 */

/**
 * Enter/Space 키로 클릭 가능하게 만드는 키보드 핸들러
 * div나 span에 onClick 있을 때 키보드로도 활성화되게
 */
export function onKeyActivate(handler: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}

/**
 * 시간 값을 스크린리더 친화적으로 변환
 * "2시간" → "2시간 전에 작성됨"
 */
export function ariaTimeLabel(timeAgo: string): string {
  return `${timeAgo} 전에 작성됨`;
}

/**
 * 좋아요 수를 스크린리더 친화적으로
 * 45 → "좋아요 45개"
 */
export function ariaLikeLabel(count: number, liked: boolean): string {
  return liked
    ? `좋아요 취소. 현재 ${count}개`
    : `좋아요. 현재 ${count}개`;
}

/**
 * 포커스 트랩 — 모달/시트 내부에서 Tab이 밖으로 나가지 않게
 */
export function trapFocus(container: HTMLElement) {
  const focusable = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  const handler = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  container.addEventListener("keydown", handler);
  first?.focus();

  return () => container.removeEventListener("keydown", handler);
}
