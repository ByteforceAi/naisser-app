import { randomBytes } from "crypto";

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const CODE_LENGTH = 6;

/**
 * 6자 base62 shortcode 생성
 * 62^6 = 56,800,235,584 조합 (568억)
 * 강사 수만 명 규모에서 충돌 확률 사실상 0
 */
export function generateShortcode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += BASE62[bytes[i] % 62];
  }
  return code;
}

/**
 * shortcode 형식 검증
 * 6자 영숫자(a-zA-Z0-9)만 허용
 */
export function isValidShortcode(code: string): boolean {
  return /^[a-zA-Z0-9]{6}$/.test(code);
}
