CREATE TABLE "community_helpfuls" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "idea_boards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"cover_image" text,
	"is_public" boolean DEFAULT true,
	"pin_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "idea_pin_saves" (
	"id" text PRIMARY KEY NOT NULL,
	"pin_id" text NOT NULL,
	"user_id" text NOT NULL,
	"board_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "idea_pins" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"images" text[],
	"topic" text,
	"target_grade" text,
	"duration" text,
	"materials" text,
	"tips" text,
	"source_url" text,
	"saved_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "program_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "program_upvotes" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"topic" text,
	"target_grade" text,
	"duration" text,
	"max_students" integer,
	"materials_cost" text,
	"includes" text[],
	"images" text[],
	"price" integer DEFAULT 0,
	"price_type" text DEFAULT 'free',
	"download_url" text,
	"upvote_count" integer DEFAULT 0,
	"used_count" integer DEFAULT 0,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"instructor_id" text NOT NULL,
	"school_name" text NOT NULL,
	"school_code" text,
	"region" text,
	"facility_rating" integer NOT NULL,
	"cooperation_rating" integer NOT NULL,
	"accessibility_rating" integer NOT NULL,
	"overall_rating" numeric(2, 1) NOT NULL,
	"content" text NOT NULL,
	"visit_date" text,
	"would_return" boolean DEFAULT true,
	"tips" text,
	"is_anonymous" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_community_scores" (
	"user_id" text PRIMARY KEY NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"post_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"received_likes" integer DEFAULT 0 NOT NULL,
	"received_helpfuls" integer DEFAULT 0 NOT NULL,
	"school_review_count" integer DEFAULT 0 NOT NULL,
	"grade" text DEFAULT 'sprout' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "category" text DEFAULT 'chat';--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "poll_question" text;--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "poll_options" text[];--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "poll_votes" text;--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "poll_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "community_posts" ADD COLUMN "helpful_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "community_helpfuls" ADD CONSTRAINT "community_helpfuls_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_pin_saves" ADD CONSTRAINT "idea_pin_saves_pin_id_idea_pins_id_fk" FOREIGN KEY ("pin_id") REFERENCES "public"."idea_pins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_pin_saves" ADD CONSTRAINT "idea_pin_saves_board_id_idea_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."idea_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_pins" ADD CONSTRAINT "idea_pins_board_id_idea_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."idea_boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_reviews" ADD CONSTRAINT "program_reviews_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_upvotes" ADD CONSTRAINT "program_upvotes_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_reviews" ADD CONSTRAINT "school_reviews_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_community_helpfuls_post" ON "community_helpfuls" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "idx_community_helpfuls_user" ON "community_helpfuls" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_community_helpfuls_unique" ON "community_helpfuls" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_pin_saves_unique" ON "idea_pin_saves" USING btree ("pin_id","user_id","board_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_program_upvotes_unique" ON "program_upvotes" USING btree ("program_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_programs_author" ON "programs" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_programs_topic" ON "programs" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "idx_school_reviews_school" ON "school_reviews" USING btree ("school_name");--> statement-breakpoint
CREATE INDEX "idx_school_reviews_instructor" ON "school_reviews" USING btree ("instructor_id");