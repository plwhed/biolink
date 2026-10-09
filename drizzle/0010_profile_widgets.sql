CREATE TABLE "profile_widgets" (
	"id" text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid()::text,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"enabled" integer DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"config" text
);
--> statement-breakpoint
ALTER TABLE "profile_widgets" ADD CONSTRAINT "profile_widgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "profile_widgets_user_type_idx" ON "profile_widgets" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "profile_widgets_user_id_idx" ON "profile_widgets" USING btree ("user_id");
