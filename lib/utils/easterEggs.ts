/**
 * 이스터에그 시스템
 *
 * 특정 해시태그나 키워드에 숨겨진 이펙트
 */

interface EasterEgg {
  trigger: string;
  effect: "confetti" | "shake" | "rainbow" | "snow";
  message?: string;
}

const EGGS: EasterEgg[] = [
  { trigger: "#나이써사랑해", effect: "confetti", message: "저도 사랑해요!" },
  { trigger: "#100일", effect: "confetti", message: "축 100일!" },
  { trigger: "#파이팅", effect: "rainbow" },
  { trigger: "#감사합니다", effect: "confetti" },
  { trigger: "#첫수업", effect: "confetti", message: "첫 수업을 축하합니다!" },
];

export function checkEasterEgg(text: string): EasterEgg | null {
  for (const egg of EGGS) {
    if (text.includes(egg.trigger)) return egg;
  }
  return null;
}
