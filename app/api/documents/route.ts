/**
 * 서류함 API — 내 서류 CRUD
 * POST: 서류 업로드 (Vercel Blob + DB 저장)
 * GET: 내 서류 목록 조회
 */

import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";
import { documents, instructors } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// 허용 서류 종류
const DOC_TYPES = [
  "criminal_record", // 범죄경력조회 동의서
  "bank_account", // 통장사본
  "resume", // 이력서
  "certificate", // 자격증
  "insurance", // 보험가입증명서
  "business_license", // 사업자등록증
  "other", // 기타
] as const;

const DOC_TYPE_LABELS: Record<string, string> = {
  criminal_record: "범죄경력조회 동의서",
  bank_account: "통장사본",
  resume: "이력서",
  certificate: "자격증",
  insurance: "보험가입증명서",
  business_license: "사업자등록증",
  other: "기타",
};

// 허용 파일 타입
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ─── GET: 내 서류 목록 ───
export async function GET() {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  try {
    // 강사 프로필 ID 조회
    const [instructor] = await db
      .select({ id: instructors.id })
      .from(instructors)
      .where(eq(instructors.userId, session.user.id))
      .limit(1);

    if (!instructor) {
      return NextResponse.json(
        { error: "강사 프로필이 없습니다." },
        { status: 404 }
      );
    }

    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.instructorId, instructor.id))
      .orderBy(documents.uploadedAt);

    // 서류 완비 상태 계산
    const requiredTypes = ["criminal_record", "bank_account", "resume"];
    const uploadedTypes = docs.map((d) => d.docType);
    const missingTypes = requiredTypes.filter(
      (t) => !uploadedTypes.includes(t)
    );
    const isComplete = missingTypes.length === 0;

    // 만료 경고 (30일 이내)
    const now = new Date();
    const thirtyDaysLater = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const docsWithStatus = docs.map((d) => ({
      ...d,
      typeLabel: DOC_TYPE_LABELS[d.docType] || d.docType,
      expiryStatus: d.expiresAt
        ? d.expiresAt < now
          ? "expired"
          : d.expiresAt < thirtyDaysLater
            ? "expiring_soon"
            : "valid"
        : "no_expiry",
    }));

    return NextResponse.json({
      data: docsWithStatus,
      summary: {
        total: docs.length,
        isComplete,
        missingTypes: missingTypes.map((t) => ({
          type: t,
          label: DOC_TYPE_LABELS[t],
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/documents]", error);
    return NextResponse.json(
      { error: "서류 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

// ─── POST: 서류 업로드 ───
export async function POST(request: NextRequest) {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as string;
    const description = formData.get("description") as string | null;
    const expiresAt = formData.get("expiresAt") as string | null;

    // 유효성 검사
    if (!file) {
      return NextResponse.json(
        { error: "파일을 선택해주세요." },
        { status: 400 }
      );
    }

    if (!docType || !DOC_TYPES.includes(docType as (typeof DOC_TYPES)[number])) {
      return NextResponse.json(
        { error: "올바른 서류 종류를 선택해주세요." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 10MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "PDF, JPG, PNG, WebP 파일만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }

    // 강사 프로필 ID 조회
    const [instructor] = await db
      .select({ id: instructors.id })
      .from(instructors)
      .where(eq(instructors.userId, session.user.id))
      .limit(1);

    if (!instructor) {
      return NextResponse.json(
        { error: "강사 프로필이 없습니다." },
        { status: 404 }
      );
    }

    // 같은 종류의 서류가 이미 있으면 체크 (certificate는 복수 허용)
    if (docType !== "certificate" && docType !== "other") {
      const existing = await db
        .select({ id: documents.id })
        .from(documents)
        .where(
          and(
            eq(documents.instructorId, instructor.id),
            eq(documents.docType, docType)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          {
            error: `이미 ${DOC_TYPE_LABELS[docType]}이(가) 등록되어 있습니다. 기존 서류를 삭제 후 다시 업로드해주세요.`,
          },
          { status: 409 }
        );
      }
    }

    // Vercel Blob 업로드
    const ext = file.name.split(".").pop() || "pdf";
    const filename = `documents/${instructor.id}/${docType}/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // DB 저장
    const [newDoc] = await db
      .insert(documents)
      .values({
        instructorId: instructor.id,
        docType,
        fileName: file.name,
        fileUrl: blob.url,
        fileSize: file.size,
        mimeType: file.type,
        description: description || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    return NextResponse.json({
      data: {
        ...newDoc,
        typeLabel: DOC_TYPE_LABELS[docType],
      },
    });
  } catch (error) {
    console.error("[POST /api/documents]", error);

    if (
      error instanceof Error &&
      error.message.includes("BLOB_READ_WRITE_TOKEN")
    ) {
      return NextResponse.json(
        {
          error:
            "파일 저장소가 설정되지 않았습니다. 관리자에게 문의해주세요.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "서류 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
