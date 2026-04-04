/**
 * 강사 서류 조회 API (교사/관리자용)
 * GET: 특정 강사의 서류 목록 + 완비 여부 + 만료 상태
 *
 * 교사: 서류 종류 + 상태 + 파일 다운로드 가능 (로그인 필수)
 * 비로그인: 서류 상태만 (유효/미등록)
 * 관리자: 전체 정보 열람 가능
 */

import { NextRequest, NextResponse } from "next/server";
import { getOptionalSession } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { documents, lessonRequests, teachers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const DOC_TYPE_LABELS: Record<string, string> = {
  criminal_record: "성범죄 조회 회보서",
  tb_test: "채용신체검사서 (결핵검진)",
  tb_latent: "잠복결핵감염검진확인서",
  bank_account: "통장사본",
  resume: "이력서",
  certificate: "자격증",
  insurance: "강사 보험 가입증빙",
  business_license: "사업자등록증",
  consent_privacy: "개인정보 수집·이용 동의서",
  consent_crime: "성범죄 조회 동의서",
  integrity_pledge: "청렴서약서",
  other: "기타",
};

const REQUIRED_TYPES = ["criminal_record", "tb_test", "consent_privacy", "integrity_pledge"];

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  void _req;
  const session = await getOptionalSession();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "admin";
  const isTeacher = session?.user?.role === "teacher";

  // 매칭 성사 여부 확인 (교사가 의뢰 보내고 강사가 수락한 경우)
  let hasAcceptedRequest = false;
  if (isTeacher && session?.user?.id) {
    try {
      const [teacher] = await db
        .select({ id: teachers.id })
        .from(teachers)
        .where(eq(teachers.userId, session.user.id))
        .limit(1);

      if (teacher) {
        const [accepted] = await db
          .select({ id: lessonRequests.id })
          .from(lessonRequests)
          .where(
            and(
              eq(lessonRequests.teacherId, teacher.id),
              eq(lessonRequests.instructorId, params.id),
              eq(lessonRequests.status, "accepted")
            )
          )
          .limit(1);

        hasAcceptedRequest = !!accepted;
      }
    } catch { /* 테이블 없을 수 있음 */ }
  }

  // 관리자 또는 매칭 성사된 교사만 다운로드 가능
  const canDownload = isAdmin || hasAcceptedRequest;

  try {
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.instructorId, params.id))
      .orderBy(documents.uploadedAt);

    const now = new Date();
    const uploadedTypes = docs.map((d) => d.docType);

    // 만료 상태 계산
    const docList = docs.map((d) => {
      const isExpired = d.expiresAt && new Date(d.expiresAt) < now;
      const isExpiringSoon = d.expiresAt && !isExpired &&
        new Date(d.expiresAt).getTime() - now.getTime() < 30 * 24 * 60 * 60 * 1000;

      const expiryStatus = isExpired ? "expired"
        : isExpiringSoon ? "expiring_soon"
        : d.expiresAt ? "valid"
        : "no_expiry";

      const base = {
        id: d.id,
        docType: d.docType,
        typeLabel: DOC_TYPE_LABELS[d.docType] || d.docType,
        expiryStatus,
        expiresAt: d.expiresAt?.toISOString() || null,
        uploadedAt: d.uploadedAt?.toISOString() || null,
        isRequired: REQUIRED_TYPES.includes(d.docType),
      };

      // 교사/관리자만 파일 URL 포함
      if (canDownload) {
        return { ...base, fileUrl: d.fileUrl, fileName: d.fileName, fileSize: d.fileSize };
      }

      return base;
    });

    // 필수 서류 완비 여부 (유효한 것만)
    const requiredComplete = REQUIRED_TYPES.every((t) => {
      const doc = docs.find((d) => d.docType === t);
      if (!doc) return false;
      if (doc.expiresAt && new Date(doc.expiresAt) < now) return false;
      return true;
    });

    return NextResponse.json({
      data: docList,
      summary: {
        total: docs.length,
        isComplete: requiredComplete,
        valid: docList.filter((d) => d.expiryStatus === "valid" || d.expiryStatus === "no_expiry").length,
        expired: docList.filter((d) => d.expiryStatus === "expired").length,
        expiringSoon: docList.filter((d) => d.expiryStatus === "expiring_soon").length,
        uploadedTypes: uploadedTypes.map((t) => ({
          type: t,
          label: DOC_TYPE_LABELS[t] || t,
        })),
      },
      canDownload,
    });
  } catch (error) {
    console.error("[GET /api/instructors/[id]/documents]", error);
    return NextResponse.json(
      { error: "서류 정보를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
