import { z } from "zod";

/** 리뷰 작성 Zod 스키마 */
export const reviewCreateSchema = z.object({
  instructorId: z.string().uuid("유효하지 않은 강사 ID입니다."),
  rating: z
    .number()
    .int()
    .min(1, "별점은 1점 이상이어야 합니다.")
    .max(5, "별점은 5점 이하여야 합니다."),
  content: z
    .string()
    .max(500, "리뷰는 500자 이하로 작성해주세요.")
    .optional(),
});

/** 리뷰 답글 Zod 스키마 */
export const reviewReplySchema = z.object({
  content: z
    .string()
    .min(1, "답글 내용을 입력해주세요.")
    .max(500, "답글은 500자 이하로 작성해주세요."),
});

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type ReviewReplyInput = z.infer<typeof reviewReplySchema>;
