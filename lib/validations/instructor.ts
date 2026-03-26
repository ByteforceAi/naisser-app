import { z } from "zod";

/** 강사 온보딩 등록 Zod 스키마 */
export const instructorCreateSchema = z.object({
  instructorName: z
    .string()
    .min(2, "이름은 2자 이상 입력해주세요.")
    .max(50, "이름은 50자 이하로 입력해주세요."),
  phone: z
    .string()
    .regex(
      /^01[016789]-\d{3,4}-\d{4}$/,
      "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)"
    ),
  profileImage: z.string().url("올바른 이미지 URL이 아닙니다.").optional(),
  snsAccounts: z.array(z.string()).optional(),
  topics: z
    .array(z.string())
    .min(1, "강의주제를 1개 이상 선택해주세요.")
    .max(10, "강의주제는 최대 10개까지 선택할 수 있습니다."),
  methods: z
    .array(z.string())
    .min(1, "강의방법을 1개 이상 선택해주세요."),
  regions: z
    .array(z.string())
    .min(1, "활동지역을 1개 이상 선택해주세요."),
  lectureContent: z
    .string()
    .max(2000, "강의내용은 2000자 이하로 입력해주세요.")
    .optional(),
  bio: z
    .string()
    .max(1000, "자기소개는 1000자 이하로 입력해주세요.")
    .optional(),
  career: z
    .string()
    .max(1000, "주요경력은 1000자 이하로 입력해주세요.")
    .optional(),
  certifications: z.array(z.string()).optional(),
  address: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
  availableTimeSlot: z.string().optional(),
  desiredFee: z.string().optional(),
  portfolioLinks: z.array(z.string().url("올바른 URL 형식이 아닙니다.")).optional(),
  yearsOfExperience: z
    .number()
    .int("정수로 입력해주세요.")
    .min(0, "0 이상의 숫자를 입력해주세요.")
    .optional(),
  agreedToTerms: z.literal(true, {
    message: "이용약관에 동의해주세요.",
  }),
  agreedToPrivacy: z.literal(true, {
    message: "개인정보처리방침에 동의해주세요.",
  }),
});

export type InstructorCreateInput = z.infer<typeof instructorCreateSchema>;
