CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"avatar_url" text,
	"background_url" text,
	"cursor_url" text,
	"layout" text DEFAULT 'centered' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	CONSTRAINT "social_links_user_platform_idx" UNIQUE("user_id","platform")
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;