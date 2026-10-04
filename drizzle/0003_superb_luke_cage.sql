ALTER TABLE "profiles" ADD COLUMN "blur" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "overlay_enabled" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "overlay_text" text DEFAULT 'Click to show' NOT NULL;--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;