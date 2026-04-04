/**
 * 한국어 번역 (기본)
 *
 * 추후 영어 등 다국어 추가 시 en.ts 생성
 * 사용: import { t } from "@/lib/i18n";
 *       t("community.write") → "글 쓰기"
 */

export const ko = {
  // 공통
  common: {
    cancel: "취소",
    save: "저장",
    delete: "삭제",
    edit: "수정",
    confirm: "확인",
    back: "뒤로",
    loading: "로딩 중...",
    error: "오류가 발생했습니다",
    retry: "다시 시도",
    search: "검색",
    close: "닫기",
  },

  // 커뮤니티
  community: {
    title: "강사 라운지",
    write: "글 쓰기",
    post: "게시",
    comment: "댓글",
    reply: "답글",
    like: "좋아요",
    helpful: "도움됐어요",
    bookmark: "저장",
    share: "공유",
    report: "신고",
    mute: "뮤트",
    copyLink: "링크 복사",
    newPosts: "새 글이 있습니다",
    allLoaded: "모든 글을 불러왔습니다",
    emptyFeed: "게시글이 없어요",
    writeFirst: "첫 글을 작성해보세요",
    draftRestored: "임시저장된 글을 불러왔습니다",
    tabs: {
      hot: "HOT",
      price: "단가",
      knowhow: "노하우",
      info: "정보",
      chat: "수다",
    },
    sort: {
      recommended: "추천순",
      latest: "최신순",
    },
    filter: {
      allRegions: "전국",
      myTopic: "내분야",
    },
  },

  // 프로필
  profile: {
    edit: "프로필 수정",
    preview: "미리보기",
    share: "프로필 공유",
    stats: {
      classes: "수업",
      reviews: "리뷰",
      helpful: "도움됐어요",
    },
    completeness: "프로필 완성도",
  },

  // 설정
  settings: {
    title: "설정",
    notifications: "알림 설정",
    privacy: "개인정보 보호",
    blocked: "차단/뮤트 관리",
    help: "도움말",
    terms: "이용약관",
    logout: "로그아웃",
    version: "NAISSER v1.0.0",
  },

  // 인증
  auth: {
    login: "로그인",
    loginRequired: "로그인이 필요합니다",
    selectRole: "역할을 선택하세요",
  },

  // 시간
  time: {
    now: "방금",
    minutesAgo: "분",
    hoursAgo: "시간",
    daysAgo: "일",
  },
} as const;

// 타입 안전한 접근
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? (T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K) : never }[keyof T]
  : never;

export type TranslationKey = NestedKeyOf<typeof ko>;
