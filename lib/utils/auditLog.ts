/**
 * 감사 로그 — 관리자 행동 추적
 *
 * 게시글 삭제, 유저 정지, 설정 변경 등 관리자 행동을 기록
 * TODO: DB 테이블로 마이그레이션
 */

interface AuditEntry {
  action: string;
  adminId: string;
  targetType: "post" | "user" | "comment" | "setting";
  targetId: string;
  detail?: string;
  timestamp: string;
}

export function logAuditAction(entry: Omit<AuditEntry, "timestamp">) {
  const full: AuditEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // 콘솔 로그 (서버 사이드)
  console.log("[AUDIT]", JSON.stringify(full));

  // TODO: DB INSERT
  // await db.insert(schema.auditLogs).values(full);
}
