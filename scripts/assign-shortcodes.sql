-- ═══════════════════════════════════════════
-- NAISSER — 기존 강사에 shortcode 배치 할당
-- 실행: Neon Console SQL Editor에서 실행
-- 전제: instructors.shortcode 컬럼이 이미 추가된 상태
-- ═══════════════════════════════════════════

-- 1. shortcode 컬럼 추가 (없으면)
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS shortcode VARCHAR(10) UNIQUE;

-- 2. profileEvents 테이블 생성
CREATE TABLE IF NOT EXISTS profile_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  instructor_id TEXT NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  visitor_id TEXT,
  visitor_ip TEXT,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profile_events_instructor ON profile_events(instructor_id, event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_profile_events_date ON profile_events(created_at);

-- 3. inquiries 테이블 생성
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  instructor_id TEXT NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT,
  sender_phone TEXT,
  school_name TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  replied_at TIMESTAMP,
  reply_content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. 비용 안내 + 검색 필터 컬럼 추가
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS fee_type TEXT DEFAULT 'school_standard';
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS fee_note TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS material_cost_per_person INTEGER;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS material_cost_note TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS preparation TEXT DEFAULT 'instructor';
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS transport_included BOOLEAN DEFAULT FALSE;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS min_students INTEGER;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS max_students INTEGER;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS class_duration TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS lesson_types TEXT[];
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS class_format TEXT[];

-- lesson_requests에 lesson_type 추가
ALTER TABLE lesson_requests ADD COLUMN IF NOT EXISTS lesson_type TEXT;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS target_school_level TEXT[];
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS teaching_languages TEXT[];
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS engagement_type TEXT[];
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS documents_complete BOOLEAN DEFAULT FALSE;

-- 5. 기존 강사에 shortcode 배치 할당 (6자 랜덤 base62)
-- PostgreSQL에서 base62 shortcode 생성 함수
CREATE OR REPLACE FUNCTION generate_shortcode() RETURNS TEXT AS $$
DECLARE
  chars TEXT := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * 62 + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- shortcode가 없는 강사에 할당
UPDATE instructors
SET shortcode = generate_shortcode()
WHERE shortcode IS NULL;

-- 중복 확인 (혹시 충돌 시 재실행)
-- SELECT shortcode, COUNT(*) FROM instructors GROUP BY shortcode HAVING COUNT(*) > 1;

-- 6. 할당 결과 확인
SELECT id, instructor_name, shortcode FROM instructors ORDER BY created_at;

-- 완료!
-- 이제 /p/{shortcode} URL로 강사 프로필 접근 가능
