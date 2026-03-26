/** 강의주제 (15개 + 기타) — docs/08-CATEGORIES.md */
export const SUBJECT_CATEGORIES = [
  { id: "smokingPrevention", label: "흡연예방" },
  { id: "genderAwareness", label: "성인지" },
  { id: "disabilityMulticultural", label: "장애인식&다문화" },
  { id: "careerJob", label: "진로&직업" },
  { id: "multicultural", label: "다문화" },
  { id: "cookingBaking", label: "요리&베이킹" },
  { id: "sportsPhysical", label: "체육&신체활동" },
  { id: "readingWriting", label: "독서&글쓰기" },
  { id: "science", label: "과학" },
  { id: "music", label: "음악" },
  { id: "environmentEcology", label: "환경&생태" },
  { id: "characterBullying", label: "인성&학폭,자살예방" },
  { id: "aiDigital", label: "AI디지털" },
  { id: "staffTraining", label: "교직원연수" },
  { id: "etc", label: "기타" },
] as const;

/** 강의방법 (14개) — docs/08-CATEGORIES.md */
export const METHOD_CATEGORIES = [
  { id: "lecture", label: "강의" },
  { id: "craft", label: "공예" },
  { id: "sandArt", label: "샌드아트" },
  { id: "magic", label: "마술" },
  { id: "performance", label: "공연" },
  { id: "practiceExperience", label: "실습체험" },
  { id: "fieldTrip", label: "현장탐방" },
  { id: "storytelling", label: "동화구연" },
  { id: "debateDiscussion", label: "토의토론" },
  { id: "puppetShow", label: "인형극" },
  { id: "onlineCollaboration", label: "온라인공동작업" },
  { id: "oneOnOneConsulting", label: "1:1 상담" },
  { id: "remote", label: "비대면" },
  { id: "etc", label: "기타" },
] as const;

/** 지역 (9개) — docs/08-CATEGORIES.md */
export const REGION_CATEGORIES = [
  { id: "metropolitan", label: "수도권" },
  { id: "daejeonChungnam", label: "대전충남" },
  { id: "chungbuk", label: "충북권" },
  { id: "busanGyeongnam", label: "부산경남" },
  { id: "daeguGyeongbuk", label: "대구경북" },
  { id: "gangwon", label: "강원" },
  { id: "gwangjuJeonnam", label: "광주전남" },
  { id: "jeonbuk", label: "전북" },
  { id: "jeju", label: "제주" },
] as const;

/** 카테고리 ID → 라벨 변환 헬퍼 */
export function getCategoryLabel(
  id: string,
  type: "subject" | "method" | "region"
): string {
  const categories = {
    subject: SUBJECT_CATEGORIES,
    method: METHOD_CATEGORIES,
    region: REGION_CATEGORIES,
  }[type];
  return categories.find((c) => c.id === id)?.label ?? id;
}
