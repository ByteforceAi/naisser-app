/**
 * 강사 서류 조회 API (교사/관리자용)
 * GET: 특정 강사의 서류 목록 + 완비 여부
 *
 * 교사: 서류 종류 + 완비 뱃지만 볼 수 있음 (파일 URL 비공개)
 * 관리자: 전체 정보 열람 가능
 */

import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DOC_TYPE_LABELS: Record<string, string> = {
  criminal_record: "범죄경력조회 동의서",
  bank_account: "통장사본",
  resume: "이력서",
  certificate: "자격증",
  insurance: "보험가입증명서",
  business_license: "사업자등록증",
  other: "기타",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getOptionalSession();

  try {
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.instructorId, params.id))
      .orderBy(documents.uploadedAt);

    // 서류 완비 상태 계산
    const requiredTypes = ["criminal_record", "bank_account", "resume"];
    const uploadedTypes = docs.map((d) => d.docType);
    const isComplete = requiredTypes.every((t) => uploadedTypes.includes(t));

    const isAdmin = session?.user?.role === "admin";
    const isOwner = false; // 강사 본인은 /api/documents 사용

    // 교사에겐 종류 + 상태만, 관리자에겐 전체 정보
    const sanitized = docs.map((d) => {
      const base = {
        id: d.id,
        docType: d.docType,
        typeLabel: DOC_TYPE_LABELS[d.docType] || d.docType,
        uploadedAt: d.uploadedAt,
        expiresAt: d.expiresAt,
        hasFile: true,
      };

      if (isAdmin || isOwner) {
        return { ...base, fileUrl: d.fileUrl, fileName: d.fileName };
      }

      return base; // 교사에겐 파일 URL 비공개
    });

    return NextResponse.json({
      data: sanitized,
      summary: {
        total: docs.length,
        isComplete,
        uploadedTypes: uploadedTypes.map((t) => ({
          type: t,
          label: DOC_TYPE_LABELS[t] || t,
        })),
      },
    });
  } catch (error) {
    console.error("[GET /api/instructors/[id]/documents]", error);
    return NextResponse.json(
      { error: "서류 정보를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
