import { ko } from "./ko";

type Translations = typeof ko;

const locales: Record<string, Translations> = {
  ko,
  // en: en, // 추후 추가
};

let currentLocale = "ko";

export function setLocale(locale: string) {
  if (locales[locale]) currentLocale = locale;
}

/**
 * 번역 함수
 *
 * 사용: t("community.write") → "글 쓰기"
 */
export function t(key: string): string {
  const translations = locales[currentLocale] || ko;
  const keys = key.split(".");
  let value: unknown = translations;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // 키를 못 찾으면 키 자체를 반환
    }
  }

  return typeof value === "string" ? value : key;
}
