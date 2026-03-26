import { z } from "zod";

/** 수업 의뢰 Zod 스키마 */
export const lessonRequestSchema = z.object({
  instructorId: z.string().uuid("유효하지 않은 강사 ID입니다."),
  preferredDates: z
    .array(z.string())
    .min(1, "희망 날짜를 1개 이상 선택해주세요."),
  topic: z.string().min(1, "강의 주제를 선택해주세요."),
  method: z.string().optional(),
  studentCount: z
    .number()
    .int("정수로 입력해주세요.")
    .min(1, "예상 인원은 1명 이상이어야 합니다.")
    .max(9999, "예상 인원은 9999명 이하여야 합니다."),
  targetGrade: z.string().min(1, "대상 학년을 선택해주세요."),
  message: z
    .string()
    .max(1000, "요청 메시지는 1000자 이하로 작성해주세요.")
    .optional(),
});

/** 의뢰 응답(수락/거절) Zod 스키마 */
export const requestRespondSchema = z.object({
  action: z.enum(["accepted", "rejected"], {
    message: "수락 또는 거절을 선택해주세요.",
  }),
  rejectReason: z
    .string()
    .max(500, "거절 사유는 500자 이하로 작성해주세요.")
    .optional(),
  message: z
    .string()
    .max(500, "메시지는 500자 이하로 작성해주세요.")
    .optional(),
});

export type LessonRequestInput = z.infer<typeof lessonRequestSchema>;
export type RequestRespondInput = z.infer<typeof requestRespondSchema>;
