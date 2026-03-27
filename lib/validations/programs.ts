import { z } from "zod";

/** 프로그램 등록 */
export const programCreateSchema = z.object({
  title: z
    .string()
    .min(1, "프로그램 제목을 입력해주세요.")
    .max(200, "제목은 200자 이하로 작성해주세요."),
  description: z
    .string()
    .min(10, "프로그램 설명을 10자 이상 작성해주세요.")
    .max(5000, "설명은 5000자 이하로 작성해주세요."),
  topic: z.string().optional(),
  targetGrade: z.string().optional(),
  duration: z.string().optional(),
  maxStudents: z.number().int().min(1).max(500).optional(),
  materialsCost: z.string().optional(),
  includes: z
    .array(z.string())
    .max(20, "포함 항목은 최대 20개까지 입력할 수 있습니다.")
    .optional(),
  images: z
    .array(z.string().url("올바른 이미지 URL이 아닙니다."))
    .max(10, "이미지는 최대 10장까지 첨부할 수 있습니다.")
    .optional(),
  price: z.number().int().min(0, "가격은 0원 이상이어야 합니다.").default(0),
  priceType: z.enum(["free", "paid"]).default("free"),
  downloadUrl: z.string().url("올바른 다운로드 URL이 아닙니다.").optional(),
});

/** 프로그램 수정 */
export const programUpdateSchema = programCreateSchema.partial();

/** 프로그램 후기 작성 */
export const programReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "별점을 선택해주세요.")
    .max(5, "별점은 5점까지입니다."),
  content: z
    .string()
    .max(1000, "후기는 1000자 이하로 작성해주세요.")
    .optional(),
});

export type ProgramCreateInput = z.infer<typeof programCreateSchema>;
export type ProgramUpdateInput = z.infer<typeof programUpdateSchema>;
export type ProgramReviewInput = z.infer<typeof programReviewSchema>;
