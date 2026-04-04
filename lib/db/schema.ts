/**
 * NAISSER — Drizzle ORM 스키마
 * docs/01-DB-SCHEMA.md + docs/09-REQUEST-SYSTEM.md + docs/10-BADGE-SYSTEM.md 기반
 *
 * 테이블 목록:
 * [NextAuth] users, accounts, sessions, verification_tokens
 * [핵심]   instructors, teachers, reviews, review_replies
 * [의뢰]   lesson_requests, notifications
 * [뱃지]   user_badges
 * [커뮤니티] community_posts, community_comments, community_likes, community_bookmarks, community_helpfuls
 * [아이디어] idea_boards, idea_pins, idea_pin_saves
 * [프로그램] programs, program_upvotes, program_reviews
 * [강사학교] instructor_schools
 * [등급]   user_community_scores
 * [관리]   bulletins, popups, magic_links, admin_settings
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ═══════════════════════════════════════════
// NextAuth 필수 테이블
// ═══════════════════════════════════════════

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: text("role").default("new"), // new | instructor | teacher | admin
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ═══════════════════════════════════════════
// 강사 (Instructors)
// ═══════════════════════════════════════════

export const instructors = pgTable(
  "instructors",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    instructorName: text("instructor_name").notNull(),
    phone: text("phone").notNull().unique(),
    profileImage: text("profile_image"),
    snsAccounts: text("sns_accounts").array(), // ["platform:fullUrl", ...]
    topics: text("topics").array().notNull(), // 강의주제 카테고리 ID
    methods: text("methods").array().notNull(), // 강의방법 카테고리 ID
    regions: text("regions").array().notNull(), // 지역 카테고리 ID
    lectureContent: text("lecture_content"),
    bio: text("bio"),
    career: text("career"),
    certifications: text("certifications").array(),
    address: text("address"),
    availableDays: text("available_days").array(),
    availableTimeSlot: text("available_time_slot"),
    desiredFee: text("desired_fee"),
    portfolioLinks: text("portfolio_links").array(),
    yearsOfExperience: integer("years_of_experience"),
    // 비용 안내 (Feature B)
    feeType: text("fee_type").default("school_standard"), // school_standard | fixed | negotiable
    feeNote: text("fee_note"), // "학교 기준에 따름" 등
    materialCostPerPerson: integer("material_cost_per_person"), // 재료비 인당 (원), null=없음
    materialCostNote: text("material_cost_note"), // "재료 포함" "별도 구매"
    preparation: text("preparation").default("instructor"), // instructor | school | both
    transportIncluded: boolean("transport_included").default(false),
    minStudents: integer("min_students"),
    maxStudents: integer("max_students"),
    classDuration: text("class_duration"), // "2교시", "2시간", "반일"
    // 검색 필터 확장 (Feature D)
    lessonTypes: text("lesson_types").array(), // special | afterschool | careclass | freeterm | mandatory | career
    classFormat: text("class_format").array(), // lecture | hands_on | performance | counseling | online
    targetSchoolLevel: text("target_school_level").array(), // kindergarten | elementary | middle | high | special | international
    teachingLanguages: text("teaching_languages").array(), // ko | en | zh | ja
    engagementType: text("engagement_type").array(), // short_term | regular | contract
    documentsComplete: boolean("documents_complete").default(false), // 성범죄+결핵 유효 시 자동 true
    agreedToTerms: boolean("agreed_to_terms").default(false),
    agreedToPrivacy: boolean("agreed_to_privacy").default(false),
    agreedAt: timestamp("agreed_at", { mode: "date" }),
    // CRM 필드
    status: text("status").default("new"), // new | contacted | active | inactive
    adminNotes: text("admin_notes"),
    // 집계 캐시
    averageRating: numeric("average_rating", {
      precision: 2,
      scale: 1,
    }).default("0"),
    reviewCount: integer("review_count").default(0),
    // 프로필 공유 shortcode (6자 base62)
    shortcode: text("shortcode").unique(),
    // 얼리버드
    isEarlyBird: boolean("is_early_bird").default(false),
    earlyBirdGrantedAt: timestamp("early_bird_granted_at", { mode: "date" }),
    freeRequestQuota: integer("free_request_quota").default(0),
    freeRequestUsed: integer("free_request_used").default(0),
    earlyBirdExpiresAt: timestamp("early_bird_expires_at", { mode: "date" }),
    // 타임스탬프
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    statusIdx: index("idx_instructors_status").on(table.status),
    userIdx: index("idx_instructors_user").on(table.userId),
  })
);

// ═══════════════════════════════════════════
// 교사 (Teachers)
// ═══════════════════════════════════════════

export const teachers = pgTable(
  "teachers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    naisNumber: text("nais_number").unique(),
    schoolName: text("school_name").notNull(),
    schoolCode: text("school_code"),
    educationOffice: text("education_office"),
    region: text("region"),
    interestedTopics: text("interested_topics").array(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    naisIdx: index("idx_teachers_nais").on(table.naisNumber),
    userIdx: index("idx_teachers_user").on(table.userId),
  })
);

// ═══════════════════════════════════════════
// 리뷰 (Reviews)
// ═══════════════════════════════════════════

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1~5
    content: text("content"), // 최대 500자
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    instructorIdx: index("idx_reviews_instructor").on(table.instructorId),
    uniqueReview: uniqueIndex("idx_reviews_unique").on(
      table.instructorId,
      table.teacherId
    ),
  })
);

// ═══════════════════════════════════════════
// 리뷰 답글 (Review Replies — 강사가 리뷰에 답변)
// ═══════════════════════════════════════════

export const reviewReplies = pgTable("review_replies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  reviewId: text("review_id")
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  instructorId: text("instructor_id")
    .notNull()
    .references(() => instructors.id, { onDelete: "cascade" }),
  content: text("content").notNull(), // 최대 500자
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 수업 의뢰 (Lesson Requests)
// ═══════════════════════════════════════════

export const lessonRequests = pgTable(
  "lesson_requests",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
    lessonType: text("lesson_type"), // special | afterschool | careclass | freeterm | mandatory | career
    preferredDates: text("preferred_dates").array().notNull(),
    topic: text("topic").notNull(),
    method: text("method"),
    studentCount: integer("student_count").notNull(),
    targetGrade: text("target_grade").notNull(),
    schoolName: text("school_name").notNull(),
    message: text("message"), // 최대 1000자
    status: text("status").default("pending"), // pending | viewed | accepted | rejected | cancelled | expired
    rejectReason: text("reject_reason"),
    instructorMessage: text("instructor_message"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
  },
  (table) => ({
    teacherIdx: index("idx_requests_teacher").on(table.teacherId),
    instructorIdx: index("idx_requests_instructor").on(table.instructorId),
    statusIdx: index("idx_requests_status").on(table.status),
  })
);

// ═══════════════════════════════════════════
// 알림 (Notifications)
// ═══════════════════════════════════════════

export const notifications = pgTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull(),
    type: text("type").notNull(), // request_new | request_accepted | request_rejected | ...
    referenceId: text("reference_id"),
    title: text("title").notNull(),
    body: text("body"),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_notifications_user").on(table.userId),
    unreadIdx: index("idx_notifications_unread").on(
      table.userId,
      table.isRead
    ),
  })
);

// ═══════════════════════════════════════════
// 뱃지 (User Badges)
// ═══════════════════════════════════════════

export const userBadges = pgTable(
  "user_badges",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull(),
    userType: text("user_type").notNull(), // instructor | teacher
    badgeType: text("badge_type").notNull(), // early_bird | verified | review_king | ...
    grantedAt: timestamp("granted_at", { mode: "date" }).defaultNow(),
    expiresAt: timestamp("expires_at", { mode: "date" }), // null = 영구
  },
  (table) => ({
    userIdx: index("idx_badges_user").on(table.userId),
  })
);

// ═══════════════════════════════════════════
// 커뮤니티 게시글 (Community Posts)
// ═══════════════════════════════════════════

export const communityPosts = pgTable(
  "community_posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    boardType: text("board_type").notNull(), // all | topic | school
    boardRef: text("board_ref"), // topic_id or school_code
    authorId: text("author_id").notNull(),
    authorType: text("author_type").notNull(), // instructor | teacher
    body: text("body").notNull(), // 최대 5000자
    images: text("images").array(), // URL 배열, 최대 4장
    tags: text("tags").array(),
    postType: text("post_type").default("free"), // case | question | info | free
    category: text("category").default("chat"), // price | knowhow | info | chat
    // 투표 기능
    pollQuestion: text("poll_question"),
    pollOptions: text("poll_options").array(), // ["20만원 이하", "20~25만원", ...]
    pollVotes: text("poll_votes"), // JSON: {"0": ["userId1","userId2"], "1": ["userId3"]}
    pollEndsAt: timestamp("poll_ends_at", { mode: "date" }),
    //
    likeCount: integer("like_count").default(0),
    helpfulCount: integer("helpful_count").default(0),
    commentCount: integer("comment_count").default(0),
    isPinned: boolean("is_pinned").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    boardIdx: index("idx_community_posts_board").on(
      table.boardType,
      table.boardRef,
      table.createdAt
    ),
    authorIdx: index("idx_community_posts_author").on(table.authorId),
  })
);

// ═══════════════════════════════════════════
// 커뮤니티 댓글 (Community Comments)
// ═══════════════════════════════════════════

export const communityComments = pgTable(
  "community_comments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    authorId: text("author_id").notNull(),
    authorType: text("author_type").notNull(), // instructor | teacher
    content: text("content").notNull(), // 최대 1000자
    parentId: text("parent_id"), // 대댓글 (자기참조)
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    postIdx: index("idx_community_comments_post").on(
      table.postId,
      table.createdAt
    ),
  })
);

// ═══════════════════════════════════════════
// 커뮤니티 좋아요 (Community Likes)
// ═══════════════════════════════════════════

export const communityLikes = pgTable(
  "community_likes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    postIdx: index("idx_community_likes_post").on(table.postId),
    userIdx: index("idx_community_likes_user").on(table.userId),
    uniqueLike: uniqueIndex("idx_community_likes_unique").on(
      table.postId,
      table.userId
    ),
  })
);

// ═══════════════════════════════════════════
// 커뮤니티 북마크 (Community Bookmarks)
// ═══════════════════════════════════════════

export const communityBookmarks = pgTable(
  "community_bookmarks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    userIdx: index("idx_community_bookmarks_user").on(table.userId),
    uniqueBookmark: uniqueIndex("idx_community_bookmarks_unique").on(
      table.postId,
      table.userId
    ),
  })
);

// ═══════════════════════════════════════════
// 커뮤니티 도움됐어요 (Community Helpfuls)
// ═══════════════════════════════════════════

export const communityHelpfuls = pgTable(
  "community_helpfuls",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    postIdx: index("idx_community_helpfuls_post").on(table.postId),
    userIdx: index("idx_community_helpfuls_user").on(table.userId),
    uniqueHelpful: uniqueIndex("idx_community_helpfuls_unique").on(
      table.postId,
      table.userId
    ),
  })
);

// ═══════════════════════════════════════════
// 강사 활동학교 (Instructor Schools)
// ═══════════════════════════════════════════

export const instructorSchools = pgTable(
  "instructor_schools",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
    schoolName: text("school_name").notNull(),
    schoolCode: text("school_code"),
    region: text("region"),
    year: integer("year"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    instructorIdx: index("idx_instructor_schools").on(table.instructorId),
  })
);

// ═══════════════════════════════════════════
// 공지사항 (Bulletins)
// ═══════════════════════════════════════════

export const bulletins = pgTable("bulletins", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audienceScope: text("audience_scope").default("all"), // teachers | instructors | all
  status: text("status").default("draft"), // draft | published
  publishAt: timestamp("publish_at", { mode: "date" }),
  expireAt: timestamp("expire_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 팝업 (Popups)
// ═══════════════════════════════════════════

export const popups = pgTable("popups", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  type: text("type").default("text"), // text | image
  body: text("body"),
  imageUrl: text("image_url"),
  audienceScope: text("audience_scope").default("all"),
  isActive: boolean("is_active").default(false),
  displayStart: timestamp("display_start", { mode: "date" }),
  displayEnd: timestamp("display_end", { mode: "date" }),
  frequency: text("frequency").default("once"), // once | daily
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 매직링크 (Magic Links)
// ═══════════════════════════════════════════

export const magicLinks = pgTable("magic_links", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  token: text("token").notNull().unique(),
  instructorId: text("instructor_id")
    .notNull()
    .references(() => instructors.id, { onDelete: "cascade" }),
  type: text("type").default("edit"), // edit | view
  expiresAt: timestamp("expires_at", { mode: "date" }), // null = 무기한
  usedAt: timestamp("used_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 학교 리뷰 (School Reviews — 강사가 학교를 평가)
// ═══════════════════════════════════════════

export const schoolReviews = pgTable(
  "school_reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
    schoolName: text("school_name").notNull(),
    schoolCode: text("school_code"),
    region: text("region"),
    // 카테고리별 별점 (1~5)
    facilityRating: integer("facility_rating").notNull(), // 시설
    cooperationRating: integer("cooperation_rating").notNull(), // 협조
    accessibilityRating: integer("accessibility_rating").notNull(), // 접근성
    overallRating: numeric("overall_rating", { precision: 2, scale: 1 }).notNull(), // 평균
    // 리뷰 내용
    content: text("content").notNull(), // 최대 1000자
    visitDate: text("visit_date"), // "2024.11" 형식
    wouldReturn: boolean("would_return").default(true), // 재방문 의향
    tips: text("tips"), // 팁 (주차, 급식 등)
    //
    isAnonymous: boolean("is_anonymous").default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    schoolIdx: index("idx_school_reviews_school").on(table.schoolName),
    instructorIdx: index("idx_school_reviews_instructor").on(table.instructorId),
  })
);

// ═══════════════════════════════════════════
// 관리자 설정 (Admin Settings)
// ═══════════════════════════════════════════

export const adminSettings = pgTable("admin_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 커뮤니티 등급 점수 (User Community Scores)
// ═══════════════════════════════════════════

export const userCommunityScores = pgTable("user_community_scores", {
  userId: text("user_id").primaryKey(),
  score: integer("score").default(0).notNull(),
  postCount: integer("post_count").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  receivedLikes: integer("received_likes").default(0).notNull(),
  receivedHelpfuls: integer("received_helpfuls").default(0).notNull(),
  schoolReviewCount: integer("school_review_count").default(0).notNull(),
  grade: text("grade").default("sprout").notNull(), // sprout | active | veteran | mentor
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 아이디어 보드 (Idea Boards)
// ═══════════════════════════════════════════

export const ideaBoards = pgTable("idea_boards", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  isPublic: boolean("is_public").default(true),
  pinCount: integer("pin_count").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 아이디어 핀 (Idea Pins)
// ═══════════════════════════════════════════

export const ideaPins = pgTable("idea_pins", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  boardId: text("board_id")
    .notNull()
    .references(() => ideaBoards.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  images: text("images").array(),
  topic: text("topic"),
  targetGrade: text("target_grade"),
  duration: text("duration"),
  materials: text("materials"),
  tips: text("tips"),
  sourceUrl: text("source_url"),
  savedCount: integer("saved_count").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 핀 저장 (Idea Pin Saves)
// ═══════════════════════════════════════════

export const ideaPinSaves = pgTable(
  "idea_pin_saves",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pinId: text("pin_id")
      .notNull()
      .references(() => ideaPins.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    boardId: text("board_id")
      .notNull()
      .references(() => ideaBoards.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    uniqueSave: uniqueIndex("idx_pin_saves_unique").on(
      table.pinId,
      table.userId,
      table.boardId
    ),
  })
);

// ═══════════════════════════════════════════
// 프로그램 장터 (Programs)
// ═══════════════════════════════════════════

export const programs = pgTable(
  "programs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    authorId: text("author_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    topic: text("topic"),
    targetGrade: text("target_grade"),
    duration: text("duration"),
    maxStudents: integer("max_students"),
    materialsCost: text("materials_cost"),
    includes: text("includes").array(),
    images: text("images").array(),
    price: integer("price").default(0),
    priceType: text("price_type").default("free"),
    downloadUrl: text("download_url"),
    upvoteCount: integer("upvote_count").default(0),
    usedCount: integer("used_count").default(0),
    status: text("status").default("active"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    authorIdx: index("idx_programs_author").on(table.authorId),
    topicIdx: index("idx_programs_topic").on(table.topic),
  })
);

// ═══════════════════════════════════════════
// 프로그램 업보트 (Program Upvotes)
// ═══════════════════════════════════════════

export const programUpvotes = pgTable(
  "program_upvotes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    programId: text("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    uniqueUpvote: uniqueIndex("idx_program_upvotes_unique").on(
      table.programId,
      table.userId
    ),
  })
);

// ═══════════════════════════════════════════
// 프로그램 사용 후기 (Program Reviews)
// ═══════════════════════════════════════════

export const programReviews = pgTable("program_reviews", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  programId: text("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  rating: integer("rating").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 서류함 (Documents — Document Vault)
// ═══════════════════════════════════════════

export const documents = pgTable(
  "documents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
    docType: text("doc_type").notNull(),
    // criminal_record | bank_account | resume | certificate | insurance | business_license | other
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(), // Vercel Blob URL
    fileSize: integer("file_size"), // bytes
    mimeType: text("mime_type"), // application/pdf, image/jpeg, etc.
    description: text("description"), // 자격증 이름 등 메모
    expiresAt: timestamp("expires_at", { mode: "date" }), // null = 만료 없음
    uploadedAt: timestamp("uploaded_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    instructorIdx: index("idx_documents_instructor").on(table.instructorId),
    typeIdx: index("idx_documents_type").on(
      table.instructorId,
      table.docType
    ),
  })
);

// ═══════════════════════════════════════════
// 출강이력 (Teaching Records — Career Tracker)
// ═══════════════════════════════════════════

export const teachingRecords = pgTable(
  "teaching_records",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
    teacherId: text("teacher_id").references(() => teachers.id, {
      onDelete: "set null",
    }),
    schoolName: text("school_name").notNull(),
    schoolCode: text("school_code"), // schools 테이블 연동 시 사용
    date: text("date").notNull(), // "2026-04-15" ISO 형식
    startTime: text("start_time"), // "10:00"
    endTime: text("end_time"), // "12:00"
    hours: numeric("hours", { precision: 3, scale: 1 }), // 2.0
    subject: text("subject").notNull(), // 카테고리 ID or 자유 입력
    targetGrade: text("target_grade"), // "초등 3학년"
    studentCount: integer("student_count"),
    fee: integer("fee"), // 강사료 (원)
    status: text("status").default("pending"),
    // pending | confirmed | cancelled
    confirmedAt: timestamp("confirmed_at", { mode: "date" }),
    confirmedBy: text("confirmed_by"), // teacher user_id
    // 문서번호 (PDF 발급 시)
    documentNumber: text("document_number"), // NSSR-2026-0415-001
    memo: text("memo"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    instructorIdx: index("idx_teaching_records_instructor").on(
      table.instructorId
    ),
    teacherIdx: index("idx_teaching_records_teacher").on(table.teacherId),
    dateIdx: index("idx_teaching_records_date").on(table.date),
    statusIdx: index("idx_teaching_records_status").on(table.status),
  })
);

// ═══════════════════════════════════════════
// 학교 마스터 (Schools — 전국 초중고)
// ═══════════════════════════════════════════

export const schools = pgTable(
  "schools",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    schoolCode: text("school_code").unique(), // 공공데이터 학교ID
    name: text("name").notNull(),
    level: text("level").notNull(), // 초등학교 | 중학교 | 고등학교 | 특수학교
    address: text("address"),
    sido: text("sido"), // 시도교육청명
    district: text("district"), // 교육지원청명
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    status: text("status").default("운영"), // 운영 | 폐교 | 휴교
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    nameIdx: index("idx_schools_name").on(table.name),
    sidoIdx: index("idx_schools_sido").on(table.sido),
    districtIdx: index("idx_schools_district").on(table.district),
  })
);

// ═══════════════════════════════════════════
// 즐겨찾기 (Favorites — 교사 → 강사)
// ═══════════════════════════════════════════

export const favorites = pgTable(
  "favorites",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => teachers.id, { onDelete: "cascade" }),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    teacherIdx: index("idx_favorites_teacher").on(table.teacherId),
    instructorIdx: index("idx_favorites_instructor").on(table.instructorId),
    uniqueFav: uniqueIndex("idx_favorites_unique").on(
      table.teacherId,
      table.instructorId
    ),
  })
);

// ═══════════════════════════════════════════
// Relations (Drizzle ORM 관계 정의)
// ═══════════════════════════════════════════

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  user: one(users, {
    fields: [instructors.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
  reviewReplies: many(reviewReplies),
  lessonRequests: many(lessonRequests),
  schools: many(instructorSchools),
  documents: many(documents),
  teachingRecords: many(teachingRecords),
  favorited: many(favorites),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
  lessonRequests: many(lessonRequests),
  teachingRecords: many(teachingRecords),
  favorites: many(favorites),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  instructor: one(instructors, {
    fields: [reviews.instructorId],
    references: [instructors.id],
  }),
  teacher: one(teachers, {
    fields: [reviews.teacherId],
    references: [teachers.id],
  }),
  replies: many(reviewReplies),
}));

export const reviewRepliesRelations = relations(reviewReplies, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewReplies.reviewId],
    references: [reviews.id],
  }),
  instructor: one(instructors, {
    fields: [reviewReplies.instructorId],
    references: [instructors.id],
  }),
}));

export const lessonRequestsRelations = relations(
  lessonRequests,
  ({ one }) => ({
    teacher: one(teachers, {
      fields: [lessonRequests.teacherId],
      references: [teachers.id],
    }),
    instructor: one(instructors, {
      fields: [lessonRequests.instructorId],
      references: [instructors.id],
    }),
  })
);

export const communityPostsRelations = relations(
  communityPosts,
  ({ many }) => ({
    comments: many(communityComments),
    likes: many(communityLikes),
    bookmarks: many(communityBookmarks),
    helpfuls: many(communityHelpfuls),
  })
);

export const communityCommentsRelations = relations(
  communityComments,
  ({ one }) => ({
    post: one(communityPosts, {
      fields: [communityComments.postId],
      references: [communityPosts.id],
    }),
  })
);

export const communityLikesRelations = relations(communityLikes, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityLikes.postId],
    references: [communityPosts.id],
  }),
}));

export const communityBookmarksRelations = relations(
  communityBookmarks,
  ({ one }) => ({
    post: one(communityPosts, {
      fields: [communityBookmarks.postId],
      references: [communityPosts.id],
    }),
  })
);

export const communityHelpfulsRelations = relations(
  communityHelpfuls,
  ({ one }) => ({
    post: one(communityPosts, {
      fields: [communityHelpfuls.postId],
      references: [communityPosts.id],
    }),
  })
);

export const instructorSchoolsRelations = relations(
  instructorSchools,
  ({ one }) => ({
    instructor: one(instructors, {
      fields: [instructorSchools.instructorId],
      references: [instructors.id],
    }),
  })
);

// ─── 서류함 Relations ───

export const documentsRelations = relations(documents, ({ one }) => ({
  instructor: one(instructors, {
    fields: [documents.instructorId],
    references: [instructors.id],
  }),
}));

// ─── 출강이력 Relations ───

export const teachingRecordsRelations = relations(
  teachingRecords,
  ({ one }) => ({
    instructor: one(instructors, {
      fields: [teachingRecords.instructorId],
      references: [instructors.id],
    }),
    teacher: one(teachers, {
      fields: [teachingRecords.teacherId],
      references: [teachers.id],
    }),
  })
);

// ─── 즐겨찾기 Relations ───

export const favoritesRelations = relations(favorites, ({ one }) => ({
  teacher: one(teachers, {
    fields: [favorites.teacherId],
    references: [teachers.id],
  }),
  instructor: one(instructors, {
    fields: [favorites.instructorId],
    references: [instructors.id],
  }),
}));

// ─── 아이디어 보드 Relations ───

export const ideaBoardsRelations = relations(ideaBoards, ({ many }) => ({
  pins: many(ideaPins),
  saves: many(ideaPinSaves),
}));

export const ideaPinsRelations = relations(ideaPins, ({ one, many }) => ({
  board: one(ideaBoards, {
    fields: [ideaPins.boardId],
    references: [ideaBoards.id],
  }),
  saves: many(ideaPinSaves),
}));

export const ideaPinSavesRelations = relations(ideaPinSaves, ({ one }) => ({
  pin: one(ideaPins, {
    fields: [ideaPinSaves.pinId],
    references: [ideaPins.id],
  }),
  board: one(ideaBoards, {
    fields: [ideaPinSaves.boardId],
    references: [ideaBoards.id],
  }),
}));

// ─── 프로그램 장터 Relations ───

export const programsRelations = relations(programs, ({ many }) => ({
  upvotes: many(programUpvotes),
  reviews: many(programReviews),
}));

export const programUpvotesRelations = relations(
  programUpvotes,
  ({ one }) => ({
    program: one(programs, {
      fields: [programUpvotes.programId],
      references: [programs.id],
    }),
  })
);

export const programReviewsRelations = relations(
  programReviews,
  ({ one }) => ({
    program: one(programs, {
      fields: [programReviews.programId],
      references: [programs.id],
    }),
  })
);

// ═══════════════════════════════════════════
// 커뮤니티 신고 (Reports)
// ═══════════════════════════════════════════

export const communityReports = pgTable("community_reports", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  postId: text("post_id").references(() => communityPosts.id, { onDelete: "cascade" }),
  reporterId: text("reporter_id").notNull(),
  reason: text("reason").notNull(),
  detail: text("detail"),
  status: text("status").default("pending"), // pending | reviewed | resolved | dismissed
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 알림 설정 (Notification Settings)
// ═══════════════════════════════════════════

export const notificationSettings = pgTable("notification_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  pushEnabled: boolean("push_enabled").default(true),
  likesEnabled: boolean("likes_enabled").default(true),
  commentsEnabled: boolean("comments_enabled").default(true),
  mentionsEnabled: boolean("mentions_enabled").default(true),
  requestsEnabled: boolean("requests_enabled").default(true),
  reviewsEnabled: boolean("reviews_enabled").default(true),
  emailDigest: boolean("email_digest").default(false),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 푸시 구독 (Push Subscriptions)
// ═══════════════════════════════════════════

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  keys: text("keys").notNull(), // JSON
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 구독 (Subscriptions — 프리미엄)
// ═══════════════════════════════════════════

export const subscriptions = pgTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  plan: text("plan").default("free"), // free | pro | business
  startsAt: timestamp("starts_at", { mode: "date" }).defaultNow(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 감사 로그 (Audit Logs)
// ═══════════════════════════════════════════

export const auditLogs = pgTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  adminId: text("admin_id").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(), // post | user | comment | setting
  targetId: text("target_id").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// ═══════════════════════════════════════════
// 프로필 이벤트 (Profile Events) — 강사 프로필 인사이트용
// ═══════════════════════════════════════════

export const profileEvents = pgTable(
  "profile_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(), // view | share | cta_click | sns_click | phone_click | kakao_share | favorite
    visitorId: text("visitor_id"), // user_id (로그인 시) 또는 null
    visitorIp: text("visitor_ip"), // IP (중복 방지용)
    metadata: text("metadata"), // JSON (추가 정보: referrer, channel 등)
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    instructorEventIdx: index("idx_profile_events_instructor").on(
      table.instructorId,
      table.eventType,
      table.createdAt
    ),
    dateIdx: index("idx_profile_events_date").on(table.createdAt),
  })
);

// ═══════════════════════════════════════════
// 수업 문의 (Inquiries) — 강사 프로필에서 직접 문의
// ═══════════════════════════════════════════

export const inquiries = pgTable("inquiries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  instructorId: text("instructor_id")
    .notNull()
    .references(() => instructors.id, { onDelete: "cascade" }),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email"),
  senderPhone: text("sender_phone"),
  schoolName: text("school_name"),
  message: text("message").notNull(),
  status: text("status").default("new"), // new | read | replied | archived
  repliedAt: timestamp("replied_at", { mode: "date" }),
  replyContent: text("reply_content"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});
