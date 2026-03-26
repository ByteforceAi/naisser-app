import { z } from "zod";

/** 커뮤니티 게시글 작성 Zod 스키마 */
export const postCreateSchema = z.object({
  boardType: z.enum(["all", "topic", "school"], {
    message: "게시판 유형을 선택해주세요.",
  }),
  boardRef: z.string().optional(),
  body: z
    .string()
    .min(1, "내용을 입력해주세요.")
    .max(5000, "게시글은 5000자 이하로 작성해주세요."),
  images: z
    .array(z.string().url("올바른 이미지 URL이 아닙니다."))
    .max(4, "이미지는 최대 4장까지 첨부할 수 있습니다.")
    .optional(),
  tags: z.array(z.string()).optional(),
  postType: z
    .enum(["case", "question", "info", "free"])
    .default("free"),
});

/** 댓글 작성 Zod 스키마 */
export const commentCreateSchema = z.object({
  content: z
    .string()
    .min(1, "댓글 내용을 입력해주세요.")
    .max(1000, "댓글은 1000자 이하로 작성해주세요."),
  parentId: z.string().uuid().optional(), // 대댓글
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
