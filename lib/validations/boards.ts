import { z } from "zod";

/** 아이디어 보드 생성 */
export const boardCreateSchema = z.object({
  title: z
    .string()
    .min(1, "보드 제목을 입력해주세요.")
    .max(100, "보드 제목은 100자 이하로 작성해주세요."),
  description: z
    .string()
    .max(500, "설명은 500자 이하로 작성해주세요.")
    .optional(),
  coverImage: z.string().url("올바른 이미지 URL이 아닙니다.").optional(),
  isPublic: z.boolean().default(true),
});

/** 아이디어 보드 수정 */
export const boardUpdateSchema = boardCreateSchema.partial();

/** 아이디어 핀 생성 */
export const pinCreateSchema = z.object({
  title: z
    .string()
    .min(1, "핀 제목을 입력해주세요.")
    .max(200, "핀 제목은 200자 이하로 작성해주세요."),
  description: z
    .string()
    .max(2000, "설명은 2000자 이하로 작성해주세요.")
    .optional(),
  images: z
    .array(z.string().url("올바른 이미지 URL이 아닙니다."))
    .max(10, "이미지는 최대 10장까지 첨부할 수 있습니다.")
    .optional(),
  topic: z.string().optional(),
  targetGrade: z.string().optional(),
  duration: z.string().optional(),
  materials: z.string().max(500, "재료 목록은 500자 이하로 작성해주세요.").optional(),
  tips: z.string().max(1000, "팁은 1000자 이하로 작성해주세요.").optional(),
  sourceUrl: z.string().url("올바른 URL이 아닙니다.").optional(),
});

/** 핀 저장 (내 보드에 핀하기) */
export const pinSaveSchema = z.object({
  boardId: z.string().min(1, "보드를 선택해주세요."),
});

export type BoardCreateInput = z.infer<typeof boardCreateSchema>;
export type BoardUpdateInput = z.infer<typeof boardUpdateSchema>;
export type PinCreateInput = z.infer<typeof pinCreateSchema>;
export type PinSaveInput = z.infer<typeof pinSaveSchema>;
