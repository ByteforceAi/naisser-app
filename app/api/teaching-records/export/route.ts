/**
 * 출강이력서 HTML API
 * GET: 강사의 전체 출강이력을 인쇄 가능한 HTML 이력서로 반환
 */

import { NextRequest, NextResponse } from "next/server";
import { requireInstructor, isErrorResponse } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { teachingRecords, instructors } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(_request: NextRequest) {
  const session = await requireInstructor();
  if (isErrorResponse(session)) return session;

  try {
    const [instructor] = await db
      .select()
      .from(instructors)
      .where(eq(instructors.userId, session.user.id))
      .limit(1);

    if (!instructor) {
      return NextResponse.json(
        { error: "강사 프로필이 없습니다." },
        { status: 404 }
      );
    }

    const records = await db
      .select()
      .from(teachingRecords)
      .where(
        sql`${teachingRecords.instructorId} = ${instructor.id} AND ${teachingRecords.status} = 'confirmed'`
      )
      .orderBy(desc(teachingRecords.date));

    const totalRecords = records.length;
    const totalHours = records.reduce(
      (sum, r) => sum + (parseFloat(r.hours || "0") || 0),
      0
    );
    const avgRating = parseFloat(instructor.averageRating || "0");
    const topics = (instructor.topics || []).join(", ");
    const docNum = `NSSR-CR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${instructor.id.slice(0, 4)}`;

    const tableRows = records
      .map(
        (r, i) => `
      <tr class="${i % 2 === 0 ? "stripe" : ""}">
        <td>${r.date || "-"}</td>
        <td>${r.schoolName || "-"}</td>
        <td>${r.subject || "-"}</td>
        <td>${r.hours ? r.hours + "h" : "-"}</td>
        <td>${r.targetGrade || "-"}</td>
        <td>${r.studentCount || "-"}</td>
      </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>출강이력서 - ${instructor.instructorName}</title>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Pretendard', -apple-system, sans-serif; background: #f8f9fc; padding: 20px; }
    .page { max-width: 800px; margin: 0 auto; background: white; padding: 50px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; border-radius: 0; padding: 30px; }
      .no-print { display: none !important; }
    }
    .header-line { height: 3px; background: linear-gradient(90deg, #2563eb, #7c3aed, #10b981); border-radius: 2px; margin-bottom: 30px; }
    .title { font-size: 28px; font-weight: 800; color: #1a1a1a; text-align: center; letter-spacing: 8px; margin-bottom: 6px; }
    .subtitle { font-size: 11px; color: #2563eb; text-align: center; margin-bottom: 30px; }
    .profile { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .profile-name { font-size: 22px; font-weight: 700; color: #1f2937; }
    .profile-topic { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .stat-cards { display: flex; gap: 12px; }
    .stat-card { background: #f8f9fc; border-radius: 12px; padding: 12px 16px; text-align: center; min-width: 80px; }
    .stat-value { font-size: 18px; font-weight: 800; color: #2563eb; }
    .stat-label { font-size: 10px; color: #9ca3af; margin-top: 2px; }
    .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
    .section-title { font-size: 14px; font-weight: 700; color: #1f2937; margin-bottom: 12px; }
    .records-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .records-table th { background: #2563eb; color: white; padding: 10px 12px; text-align: left; font-weight: 600; }
    .records-table td { padding: 8px 12px; color: #374151; border-bottom: 1px solid #f3f4f6; }
    .records-table tr.stripe td { background: #fafbfc; }
    .empty { text-align: center; padding: 40px; color: #9ca3af; font-size: 13px; }
    .footer { border-top: 2px solid #2563eb; padding-top: 12px; margin-top: 30px; }
    .footer-text { font-size: 9px; color: #9ca3af; text-align: center; line-height: 1.8; }
    .footer-brand { font-size: 13px; font-weight: 700; color: #2563eb; text-align: center; margin-top: 6px; }
    .print-btn { display: block; margin: 20px auto; padding: 12px 32px; background: linear-gradient(135deg, #3B6CF6, #5B8AFF); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ 인쇄 / PDF 저장</button>
  <div class="page">
    <div class="header-line"></div>
    <div class="title">출 강 이 력 서</div>
    <div class="subtitle">NAISSER Certified Career Record</div>
    <div class="divider"></div>

    <div class="profile">
      <div>
        <div class="profile-name">${instructor.instructorName}</div>
        <div class="profile-topic">${topics || "교육 강사"}</div>
      </div>
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-value">${totalRecords}</div>
          <div class="stat-label">총 출강</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalHours.toFixed(0)}</div>
          <div class="stat-label">누적 시간</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${avgRating > 0 ? avgRating.toFixed(1) : "-"}</div>
          <div class="stat-label">평균 평점</div>
        </div>
      </div>
    </div>

    <div class="divider"></div>
    <div class="section-title">출강 상세 이력</div>

    ${
      records.length > 0
        ? `<table class="records-table">
      <thead>
        <tr>
          <th>날짜</th>
          <th>학교명</th>
          <th>과목</th>
          <th>시간</th>
          <th>대상</th>
          <th>학생수</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>`
        : `<div class="empty">확인된 출강 이력이 없습니다.</div>`
    }

    <div class="footer">
      <div class="footer-text">
        본 이력서는 NAISSER 시스템에 의해 자동 생성되었으며, 각 출강 기록은 해당 학교 교사의 확인을 받았습니다.<br>
        발급일: ${new Date().toLocaleDateString("ko-KR")} | 문서번호: ${docNum}
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
    console.error("[GET /api/teaching-records/export]", error);
    return NextResponse.json(
      { error: "이력서 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
