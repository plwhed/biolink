CREATE TABLE "profile_feedback" (
	"id" text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,
	"profile_user_id" integer NOT NULL,
	"voter_ip" text NOT NULL,
	"kind" text DEFAULT 'like' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_feedback" ADD CONSTRAINT "profile_feedback_profile_user_id_users_id_fk" FOREIGN KEY ("profile_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "profile_feedback_profile_voter_idx" ON "profile_feedback" USING btree ("profile_user_id","voter_ip");--> statement-breakpoint
CREATE INDEX "profile_feedback_profile_kind_idx" ON "profile_feedback" USING btree ("profile_user_id","kind");
