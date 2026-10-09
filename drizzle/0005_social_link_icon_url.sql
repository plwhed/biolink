ALTER TABLE "social_links" ADD COLUMN IF NOT EXISTS "icon_url" text;--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN IF NOT EXISTS "order" integer NOT NULL DEFAULT 0;
