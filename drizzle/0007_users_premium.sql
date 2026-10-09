ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "premium" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "users" SET "premium" = 1 WHERE "premium" = 0 AND "id" IN (SELECT "user_id" FROM "premium_subscriptions" WHERE "status" = 'active' AND ("expires_at" IS NULL OR "expires_at" > now()));
