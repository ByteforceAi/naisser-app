/**
 * NAISSER — Drizzle ORM 스키마
 * docs/01-DB-SCHEMA.md + docs/09-REQUEST-SYSTEM.md + docs/10-BADGE-SYSTEM.md 기반
 *
 * 테이블 목록:
 * [NextAuth] users, accounts, sessions, verification_tokens
 * [핵심]   instructors, teachers, reviews, review_replies
 * [의뢰]   lesson_requests, notifications
 * [뱃지]   user_badges
 * [커뮤니티] community_posts, community_comments, community_likes, community_bookmarks
 * [강사학교] instructor_schools
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
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, {
    fields: [teachers.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
  lessonRequests: many(lessonRequests),
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

export const instructorSchoolsRelations = relations(
  instructorSchools,
  ({ one }) => ({
    instructor: one(instructors, {
      fields: [instructorSchools.instructorId],
      references: [instructors.id],
    }),
  })
);
