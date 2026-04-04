-- NAISSER 커뮤니티 확장 마이그레이션
-- 실행: psql $DATABASE_URL < add-community-fields.sql

-- 1. 게시글 조회수
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. 게시글 수정 시간
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- 3. 강사 커버 이미지
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 4. 유저 커뮤니티 등급 (씨앗/새싹/나무/숲)
-- 이미 user_community_scores 테이블 존재

-- 5. 신고 테이블
CREATE TABLE IF NOT EXISTS community_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_id TEXT REFERENCES community_posts(id) ON DELETE CASCADE,
  reporter_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  detail TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 쉐도우밴 필드
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_shadow_banned BOOLEAN DEFAULT FALSE;

-- 7. 알림 설정
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  push_enabled BOOLEAN DEFAULT TRUE,
  likes_enabled BOOLEAN DEFAULT TRUE,
  comments_enabled BOOLEAN DEFAULT TRUE,
  mentions_enabled BOOLEAN DEFAULT TRUE,
  requests_enabled BOOLEAN DEFAULT TRUE,
  reviews_enabled BOOLEAN DEFAULT TRUE,
  email_digest BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 프리미엄 구독
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  plan TEXT NOT NULL DEFAULT 'free', -- free, pro, business
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 감사 로그
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL, -- post, user, comment, setting
  target_id TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 인덱스 추가 (성능)
CREATE INDEX IF NOT EXISTS idx_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON community_reports(status);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON community_posts(view_count DESC);
