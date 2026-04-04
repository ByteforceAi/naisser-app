/**
 * Zod 검증 스키마 — 한국어 에러 메시지
 * 프론트 + 서버 양쪽에서 사용
 */

import { z } from "zod";

// ─── 공통 ───
const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
const snsRegex = /^[a-zA-Z]+:.+$/; // platform:fullUrl

export const phoneSchema = z
  .string()
  .regex(phoneRegex, "전화번호 형식이 올바르지 않습니다 (010-1234-5678)")
  .or(z.literal(""));

export const snsLinkSchema = z
  .string()
  .regex(snsRegex, "SNS 링크는 'platform:URL' 형식이어야 합니다");

// ─── 강사 등록 (온보딩) ───
export const instructorCreateSchema = z.object({
  instructorName: z
    .string()
    .min(2, "이름은 2자 이상 입력해주세요")
    .max(20, "이름은 20자 이내로 입력해주세요"),
  phone: phoneSchema,
  email: z.string().email("이메일 형식이 올바르지 않습니다").optional().or(z.literal("")),
  topics: z
    .array(z.string())
    .min(1, "주제를 하나 이상 선택해주세요")
    .max(5, "주제는 최대 5개까지 선택할 수 있습니다"),
  methods: z
    .array(z.string())
    .min(1, "수업 방식을 하나 이상 선택해주세요"),
  regions: z
    .array(z.string())
    .min(1, "활동 지역을 하나 이상 선택해주세요"),
  bio: z.string().max(500, "소개는 500자 이내로 입력해주세요").optional(),
  career: z.string().max(1000, "경력은 1000자 이내로 입력해주세요").optional(),
  snsLinks: z.array(snsLinkSchema).optional(),
  agreedToTerms: z.literal(true, {
    error: "이용약관에 동의해주세요",
  }),
  agreedToPrivacy: z.literal(true, {
    error: "개인정보처리방침에 동의해주세요",
  }),
});

// ─── 교사 등록 ───
export const teacherCreateSchema = z.object({
  name: z
    .string()
    .min(2, "이름은 2자 이상 입력해주세요")
    .max(20, "이름은 20자 이내로 입력해주세요"),
  schoolName: z
    .string()
    .min(2, "학교명을 입력해주세요"),
  phone: phoneSchema.optional(),
});

// ─── 의뢰 (수업요청) ───
export const requestCreateSchema = z.object({
  instructorId: z.string().min(1, "강사를 선택해주세요"),
  schoolName: z.string().min(2, "학교명을 입력해주세요"),
  date: z.string().min(1, "날짜를 선택해주세요"),
  category: z.string().min(1, "수업 분야를 선택해주세요"),
  targetGrade: z.string().min(1, "대상 학년을 선택해주세요"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  hours: z.string().optional(),
  studentCount: z.number().int().positive("학생 수는 1 이상이어야 합니다").nullable().optional(),
  budget: z.number().int().positive("예산은 1 이상이어야 합니다").nullable().optional(),
  memo: z.string().max(500, "메모는 500자 이내로 입력해주세요").optional(),
});

// ─── 리뷰 ───
export const reviewCreateSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, "별점을 선택해주세요")
    .max(5, "별점은 1~5 사이여야 합니다"),
  content: z
    .string()
    .min(5, "리뷰는 5자 이상 입력해주세요")
    .max(100, "리뷰는 100자 이내로 입력해주세요"),
  categoryRatings: z.object({
    content: z.number().min(0).max(5).optional(),
    punctuality: z.number().min(0).max(5).optional(),
    engagement: z.number().min(0).max(5).optional(),
  }).optional(),
  wouldRebook: z.boolean().nullable().optional(),
});

// ─── 출강 기록 ───
export const teachingRecordCreateSchema = z.object({
  schoolName: z.string().min(2, "학교명을 입력해주세요"),
  date: z.string().min(1, "날짜를 선택해주세요"),
  subject: z.string().min(1, "과목을 입력해주세요"),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  hours: z.string().optional().nullable(),
  targetGrade: z.string().optional().nullable(),
  studentCount: z.number().int().positive().nullable().optional(),
  fee: z.number().int().positive().nullable().optional(),
  memo: z.string().max(300).optional().nullable(),
  instructorId: z.string().optional(),
  schoolCode: z.string().optional().nullable(),
});

// ─── 서류 업로드 ───
export const documentUploadSchema = z.object({
  docType: z.enum(
    ["criminal_record", "bank_account", "resume", "certificate", "insurance", "business_registration"],
    { error: "유효한 서류 종류를 선택해주세요" }
  ),
  expiresAt: z.string().optional().nullable(),
});

// ─── 커뮤니티 게시글 ───
export const communityPostSchema = z.object({
  title: z
    .string()
    .min(2, "제목은 2자 이상 입력해주세요")
    .max(100, "제목은 100자 이내로 입력해주세요"),
  content: z
    .string()
    .min(5, "내용은 5자 이상 입력해주세요")
    .max(2000, "내용은 2000자 이내로 입력해주세요"),
  category: z.string().optional(),
  pollQuestion: z.string().max(200).optional(),
  pollOptions: z.array(z.string()).max(6).optional(),
});

// ─── 유틸: Zod 에러 → 한국어 메시지 ───
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(", ");
}
