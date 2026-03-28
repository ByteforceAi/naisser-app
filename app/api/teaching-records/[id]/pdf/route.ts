/**
 * 출강확인서 HTML API
 * GET: 단건 출강확인서를 인쇄 가능한 HTML로 반환
 * 브라우저에서 Ctrl+P로 PDF 저장 가능
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { teachingRecords, instructors } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const [record] = await db
      .select()
      .from(teachingRecords)
      .where(eq(teachingRecords.id, params.id))
      .limit(1);

    if (!record) {
      return NextResponse.json(
        { error: "출강 기록을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (record.status !== "confirmed") {
      return NextResponse.json(
        { error: "확인된 출강 기록만 발급할 수 있습니다." },
        { status: 400 }
      );
    }

    const [instructor] = await db
      .select({ name: instructors.instructorName, phone: instructors.phone })
      .from(instructors)
      .where(eq(instructors.id, record.instructorId))
      .limit(1);

    const confirmDate = record.confirmedAt
      ? new Date(record.confirmedAt).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("ko-KR");

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>출강확인서 - ${record.documentNumber || ""}</title>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Pretendard', -apple-system, sans-serif; background: #f8f9fc; padding: 20px; }
    .page { max-width: 700px; margin: 0 auto; background: white; padding: 60px 50px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; border-radius: 0; padding: 40px; }
      .no-print { display: none !important; }
    }
    .header-line { height: 3px; background: linear-gradient(90deg, #2563eb, #7c3aed); border-radius: 2px; margin-bottom: 40px; }
    .title { font-size: 28px; font-weight: 800; color: #1a1a1a; text-align: center; letter-spacing: 12px; margin-bottom: 8px; }
    .subtitle { font-size: 12px; color: #2563eb; text-align: center; margin-bottom: 30px; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
    .table td:first-child { width: 120px; background: #f8f9fc; color: #6b7280; font-weight: 600; font-size: 13px; }
    .table td:last-child { color: #1f2937; }
    .confirm-text { text-align: center; font-size: 15px; color: #374151; line-height: 1.8; margin: 40px 0; }
    .confirm-date { text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 40px; }
    .footer { border-top: 2px solid #2563eb; padding-top: 16px; margin-top: 40px; }
    .footer-text { font-size: 10px; color: #9ca3af; text-align: center; line-height: 1.8; }
    .footer-brand { font-size: 14px; font-weight: 700; color: #2563eb; text-align: center; margin-top: 8px; }
    .print-btn { display: block; margin: 20px auto; padding: 12px 32px; background: linear-gradient(135deg, #3B6CF6, #5B8AFF); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
    .print-btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
  <div class="page">
    <div class="header-line"></div>
    <div class="title">출 강 확 인 서</div>
    <div class="subtitle">NAISSER Teaching Confirmation</div>
    <div class="divider"></div>
    <table class="table">
      <tr><td>문서번호</td><td>${record.documentNumber || "-"}</td></tr>
      <tr><td>강사명</td><td>${instructor?.name || "-"}</td></tr>
      <tr><td>학교명</td><td>${record.schoolName}</td></tr>
      <tr><td>수업일자</td><td>${record.date}</td></tr>
      <tr><td>수업시간</td><td>${record.startTime || ""} ~ ${record.endTime || ""} (${record.hours || "-"}시간)</td></tr>
      <tr><td>수업과목</td><td>${record.subject}</td></tr>
      <tr><td>대상학년</td><td>${record.targetGrade || "-"}</td></tr>
      <tr><td>학생수</td><td>${record.studentCount ? record.studentCount + "명" : "-"}</td></tr>
    </table>
    <div class="confirm-text">
      위 강사가 상기 내용과 같이 수업을 실시하였음을 확인합니다.
    </div>
    <div class="confirm-date">${confirmDate}</div>
    <div class="footer">
      <div class="footer-text">
        본 확인서는 NAISSER 시스템에 의해 자동 생성되었으며, 해당 학교 교사의 확인을 받았습니다.<br>
        발급일: ${new Date().toLocaleDateString("ko-KR")} | ${record.documentNumber || ""}
      </div>
      <div class="footer-brand">NAISSER</div>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("[GET /api/teaching-records/[id]/pdf]", error);
    return NextResponse.json(
      { error: "확인서 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
