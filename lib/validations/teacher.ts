import { z } from "zod";

/** 나이스번호 정규식: 영문1자 + 숫자9자 */
const NAIS_NUMBER_REGEX = /^[A-Za-z]\d{9}$/;

/** 교사 가입 Zod 스키마 */
export const teacherCreateSchema = z.object({
  name: z
    .string()
    .min(2, "이름은 2자 이상 입력해주세요.")
    .max(20, "이름은 20자 이하로 입력해주세요."),
  phone: z
    .string()
    .regex(
      /^01[016789]-\d{3,4}-\d{4}$/,
      "올바른 전화번호 형식이 아닙니다."
    )
    .optional(),
  email: z.string().email("올바른 이메일 형식이 아닙니다.").optional(),
  naisNumber: z
    .string()
    .regex(NAIS_NUMBER_REGEX, "나이스번호 형식이 올바르지 않습니다. (영문 1자 + 숫자 9자)")
    .optional(),
  schoolName: z
    .string()
    .min(2, "학교명을 입력해주세요.")
    .max(50, "학교명은 50자 이하로 입력해주세요."),
  schoolCode: z.string().optional(),
  educationOffice: z.string().optional(),
  region: z.string().optional(),
  interestedTopics: z.array(z.string()).optional(),
});

export type TeacherCreateInput = z.infer<typeof teacherCreateSchema>;
