CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon_prefix" text DEFAULT 'solid' NOT NULL,
	"icon_name" text NOT NULL,
	"color" text DEFAULT 'pink' NOT NULL,
	CONSTRAINT "badges_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "page_views" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "page_views" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "social_links" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "social_links" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "tilt_enabled" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "tilt_mode" text DEFAULT 'tilt' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "border_radius" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "border_width" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "display_name" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "card_opacity" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "border_opacity" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "card_width" integer DEFAULT 420 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "card_blur_enabled" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "avatar_shape" text DEFAULT 'circle' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "occupation" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "intro_screen_enabled" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "intro_screen_text" text DEFAULT 'Welcome!' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "accent_color" text DEFAULT 'white' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "badge_color" text DEFAULT 'white' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "social_color" text DEFAULT 'white' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "link_hover_color" text DEFAULT 'white' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;