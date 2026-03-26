/** 전화번호 정규화: 하이픈 포함 통일 형식 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

/** 전화번호 유효성 검사 */
export function isValidPhone(phone: string): boolean {
  return /^01[016789]-\d{3,4}-\d{4}$/.test(phone);
}
