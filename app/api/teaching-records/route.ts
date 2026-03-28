/**
 * 출강이력 API
 * POST: 출강 기록 생성 (강사 또는 교사)
 * GET: 내 출강 이력 목록
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/auth/middleware";
import { rateLimitGeneral, rateLimitStrict } from "@/lib/utils/rate-limit";
import { teachingRecordCreateSchema, formatZodError } from "@/lib/validations/schemas";
import { db } from "@/lib/db";
import { teachingRecords, instructors, teachers } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// ─── GET: 내 출강이력 ───
export async function GET(request: NextRequest) {
  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status"); // pending | confirmed | all
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    let instructorId: string | null = null;
    let teacherId: string | null = null;

    if (session.user.role === "instructor") {
      const [inst] = await db
        .select({ id: instructors.id })
        .from(instructors)
        .where(eq(instructors.userId, session.user.id))
        .limit(1);
      if (inst) instructorId = inst.id;
    } else if (session.user.role === "teacher") {
      const [teach] = await db
        .select({ id: teachers.id })
        .from(teachers)
        .where(eq(teachers.userId, session.user.id))
        .limit(1);
      if (teach) teacherId = teach.id;
    }

    if (!instructorId && !teacherId) {
      return NextResponse.json({ data: [], pagination: { total: 0 } });
    }

    // 조건 빌드
    const conditions = [];
    if (instructorId) conditions.push(eq(teachingRecords.instructorId, instructorId));
    if (teacherId) conditions.push(eq(teachingRecords.teacherId, teacherId));
    if (status && status !== "all") conditions.push(eq(teachingRecords.status, status));

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    const records = await db
      .select()
      .from(teachingRecords)
      .where(whereClause)
      .orderBy(desc(teachingRecords.date))
      .limit(limit)
      .offset(offset);

    // 총 건수
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(teachingRecords)
      .where(whereClause);

    // 통계 (강사용)
    let stats = null;
    if (instructorId) {
      const [s] = await db
        .select({
          totalRecords: sql<number>`count(*)::int`,
          confirmedRecords: sql<number>`count(*) filter (where status = 'confirmed')::int`,
          totalHours: sql<string>`coalesce(sum(hours::numeric) filter (where status = 'confirmed'), 0)`,
          totalFee: sql<number>`coalesce(sum(fee) filter (where status = 'confirmed'), 0)::int`,
        })
        .from(teachingRecords)
        .where(eq(teachingRecords.instructorId, instructorId));

      stats = {
        totalRecords: s.totalRecords,
        confirmedRecords: s.confirmedRecords,
        totalHours: parseFloat(s.totalHours) || 0,
        totalFee: s.totalFee,
      };
    }

    return NextResponse.json({
      data: records,
      stats,
      pagination: { total: count, limit, offset },
    });
  } catch (error) {
    console.error("[GET /api/teaching-records]", error);
    return NextResponse.json(
      { error: "출강이력을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

// ─── POST: 출강 기록 생성 ───
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const rl = await rateLimitStrict(ip);
  if (rl) return rl;

  const session = await requireAuth();
  if (isErrorResponse(session)) return session;

  try {
    const body = await request.json();

    // Zod 검증
    const parsed = teachingRecordCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const {
      instructorId,
      schoolName,
      schoolCode,
      date,
      startTime,
      endTime,
      hours,
      subject,
      targetGrade,
      studentCount,
      fee,
      memo,
    } = body;

    // 강사가 직접 등록하는 경우
    let resolvedInstructorId = instructorId;
    let resolvedTeacherId = null;

    if (session.user.role === "instructor") {
      const [inst] = await db
        .select({ id: instructors.id })
        .from(instructors)
        .where(eq(instructors.userId, session.user.id))
        .limit(1);
      if (!inst) {
        return NextResponse.json(
          { error: "강사 프로필이 없습니다." },
          { status: 404 }
        );
      }
      resolvedInstructorId = inst.id;
    } else if (session.user.role === "teacher") {
      // 교사가 등록하는 경우 — instructorId 필수
      if (!instructorId) {
        return NextResponse.json(
          { error: "강사를 선택해주세요." },
          { status: 400 }
        );
      }
      const [teach] = await db
        .select({ id: teachers.id })
        .from(teachers)
        .where(eq(teachers.userId, session.user.id))
        .limit(1);
      if (teach) resolvedTeacherId = teach.id;
    }

    const [record] = await db
      .insert(teachingRecords)
      .values({
        instructorId: resolvedInstructorId,
        teacherId: resolvedTeacherId,
        schoolName,
        schoolCode: schoolCode || null,
        date,
        startTime: startTime || null,
        endTime: endTime || null,
        hours: hours ? String(hours) : null,
        subject,
        targetGrade: targetGrade || null,
        studentCount: studentCount || null,
        fee: fee || null,
        memo: memo || null,
        status: session.user.role === "teacher" ? "confirmed" : "pending",
        confirmedAt: session.user.role === "teacher" ? new Date() : null,
        confirmedBy: session.user.role === "teacher" ? session.user.id : null,
      })
      .returning();

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error("[POST /api/teaching-records]", error);
    return NextResponse.json(
      { error: "출강 기록을 저장하지 못했습니다." },
      { status: 500 }
    );
  }
}
