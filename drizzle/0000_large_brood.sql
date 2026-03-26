CREATE TABLE "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "admin_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bulletins" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"audience_scope" text DEFAULT 'all',
	"status" text DEFAULT 'draft',
	"publish_at" timestamp,
	"expire_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"author_id" text NOT NULL,
	"author_type" text NOT NULL,
	"content" text NOT NULL,
	"parent_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"board_type" text NOT NULL,
	"board_ref" text,
	"author_id" text NOT NULL,
	"author_type" text NOT NULL,
	"body" text NOT NULL,
	"images" text[],
	"tags" text[],
	"post_type" text DEFAULT 'free',
	"like_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"is_pinned" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "instructor_schools" (
	"id" text PRIMARY KEY NOT NULL,
	"instructor_id" text NOT NULL,
	"school_name" text NOT NULL,
	"school_code" text,
	"region" text,
	"year" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "instructors" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"instructor_name" text NOT NULL,
	"phone" text NOT NULL,
	"profile_image" text,
	"sns_accounts" text[],
	"topics" text[] NOT NULL,
	"methods" text[] NOT NULL,
	"regions" text[] NOT NULL,
	"lecture_content" text,
	"bio" text,
	"career" text,
	"certifications" text[],
	"address" text,
	"available_days" text[],
	"available_time_slot" text,
	"desired_fee" text,
	"portfolio_links" text[],
	"years_of_experience" integer,
	"agreed_to_terms" boolean DEFAULT false,
	"agreed_to_privacy" boolean DEFAULT false,
	"agreed_at" timestamp,
	"status" text DEFAULT 'new',
	"admin_notes" text,
	"average_rating" numeric(2, 1) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"is_early_bird" boolean DEFAULT false,
	"early_bird_granted_at" timestamp,
	"free_request_quota" integer DEFAULT 0,
	"free_request_used" integer DEFAULT 0,
	"early_bird_expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "instructors_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "lesson_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"teacher_id" text NOT NULL,
	"instructor_id" text NOT NULL,
	"preferred_dates" text[] NOT NULL,
	"topic" text NOT NULL,
	"method" text,
	"student_count" integer NOT NULL,
	"target_grade" text NOT NULL,
	"school_name" text NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending',
	"reject_reason" text,
	"instructor_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "magic_links" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"instructor_id" text NOT NULL,
	"type" text DEFAULT 'edit',
	"expires_at" timestamp,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "magic_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"reference_id" text,
	"title" text NOT NULL,
	"body" text,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "popups" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text DEFAULT 'text',
	"body" text,
	"image_url" text,
	"audience_scope" text DEFAULT 'all',
	"is_active" boolean DEFAULT false,
	"display_start" timestamp,
	"display_end" timestamp,
	"frequency" text DEFAULT 'once',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "review_replies" (
	"id" text PRIMARY KEY NOT NULL,
	"review_id" text NOT NULL,
	"instructor_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"instructor_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"rating" integer NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"nais_number" text,
	"school_name" text NOT NULL,
	"school_code" text,
	"education_office" text,
	"region" text,
	"interested_topics" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "teachers_nais_number_unique" UNIQUE("nais_number")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"user_type" text NOT NULL,
	"badge_type" text NOT NULL,
	"granted_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"role" text DEFAULT 'new',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_bookmarks" ADD CONSTRAINT "community_bookmarks_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_likes" ADD CONSTRAINT "community_likes_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructor_schools" ADD CONSTRAINT "instructor_schools_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_requests" ADD CONSTRAINT "lesson_requests_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_requests" ADD CONSTRAINT "lesson_requests_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_links" ADD CONSTRAINT "magic_links_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_community_bookmarks_user" ON "community_bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_community_bookmarks_unique" ON "community_bookmarks" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_community_comments_post" ON "community_comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_community_likes_post" ON "community_likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_community_likes_user" ON "community_likes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_community_likes_unique" ON "community_likes" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_community_posts_board" ON "community_posts" USING btree ("board_type","board_ref","created_at");--> statement-breakpoint
CREATE INDEX "idx_community_posts_author" ON "community_posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_instructor_schools" ON "instructor_schools" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "idx_instructors_status" ON "instructors" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_instructors_user" ON "instructors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_requests_teacher" ON "lesson_requests" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_requests_instructor" ON "lesson_requests" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "idx_requests_status" ON "lesson_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_unread" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_reviews_instructor" ON "reviews" USING btree ("instructor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_reviews_unique" ON "reviews" USING btree ("instructor_id","teacher_id");--> statement-breakpoint
CREATE INDEX "idx_teachers_nais" ON "teachers" USING btree ("nais_number");--> statement-breakpoint
CREATE INDEX "idx_teachers_user" ON "teachers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_badges_user" ON "user_badges" USING btree ("user_id");