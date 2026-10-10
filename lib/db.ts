import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

// During `next build` ("Collecting page data") Vercel evaluates route
// modules without runtime env vars. `neon()` throws when the connection
// string is empty, which fails the whole build. Use a placeholder so
// module evaluation never throws — real requests will use the actual
// DATABASE_URL set in the Vercel dashboard. If it's still missing at
// request time, queries will fail with a clear error.
const sql = neon(
  connectionString ||
    "postgresql://placeholder:placeholder@localhost:5432/placeholder"
);
export { sql };
export const db = drizzle(sql, { schema });

export async function ensureUserBadgeSchema() {
  try {
    await sql`ALTER TABLE IF EXISTS user_badges ADD COLUMN IF NOT EXISTS hidden INTEGER NOT NULL DEFAULT 0`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS user_badges_user_badge_idx ON user_badges (user_id, badge_id)`;
    await sql`CREATE INDEX IF NOT EXISTS user_badges_user_hidden_idx ON user_badges (user_id, hidden)`;
  } catch (error) {
    console.error("ensureUserBadgeSchema error:", error);
  }
}

export async function ensureSocialLinksSchema() {
  try {
    await sql`ALTER TABLE IF EXISTS social_links ADD COLUMN IF NOT EXISTS icon_url TEXT`;
    await sql`ALTER TABLE IF EXISTS social_links ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS social_links_user_platform_idx ON social_links (user_id, platform)`;
  } catch (error) {
    console.error("ensureSocialLi                                         nksSchema error:", error);
  }
}

export async function ensureUsersSchema() {
  try {
    await sql`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS is_admin INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS premium INTEGER NOT NULL DEFAULT 0`;
  } catch (error) {
    console.error("ensureUsersSchema error:", error);
  }
}

export async function ensurePremiumSchema() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS premium_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL DEFAULT 'plus',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ
    )`;
    await sql`CREATE INDEX IF NOT EXISTS premium_subscriptions_user_id_idx ON premium_subscriptions (user_id)`;
    await ensureUsersSchema();
    // Backfill the flag for users with an active subscription.
    await sql`UPDATE users SET premium = 1 WHERE premium = 0 AND id IN (SELECT user_id FROM premium_subscriptions WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW()))`;
  } catch (error) {
    console.error("ensurePremiumSchema error:", error);
  }
}

export async function ensureWidgetsSchema() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS profile_widgets (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0,
      config TEXT
    )`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS profile_widgets_user_type_idx ON profile_widgets (user_id, type)`;
    await sql`CREATE INDEX IF NOT EXISTS profile_widgets_user_id_idx ON profile_widgets (user_id)`;
  } catch (error) {
    console.error("ensureWidgetsSchema error:", error);
  }
}

export async function ensureFeedbackSchema() {  try {
    await sql`CREATE TABLE IF NOT EXISTS profile_feedback (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      profile_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      voter_ip TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'like',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS profile_feedback_profile_voter_idx ON profile_feedback (profile_user_id, voter_ip)`;
    await sql`CREATE INDEX IF NOT EXISTS profile_feedback_profile_kind_idx ON profile_feedback (profile_user_id, kind)`;
  } catch (error) {
    console.error("ensureFeedbackSchema error:", error);
  }
}

export async function ensureProfileSchema() {  try {
    await sql`ALTER TABLE IF EXISTS profiles
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS show_views INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS views_position TEXT NOT NULL DEFAULT 'top-right',
      ADD COLUMN IF NOT EXISTS badges_position TEXT NOT NULL DEFAULT 'auto',
      ADD COLUMN IF NOT EXISTS custom_layout TEXT,
      ADD COLUMN IF NOT EXISTS border_width INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS card_blur INTEGER NOT NULL DEFAULT 20,
      ADD COLUMN IF NOT EXISTS card_blur_enabled INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS avatar_shape TEXT NOT NULL DEFAULT 'circle',
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS occupation TEXT,
      ADD COLUMN IF NOT EXISTS primary_color TEXT NOT NULL DEFAULT 'white',
      ADD COLUMN IF NOT EXISTS text_color TEXT NOT NULL DEFAULT 'white',
      ADD COLUMN IF NOT EXISTS border_color TEXT NOT NULL DEFAULT 'white',
      ADD COLUMN IF NOT EXISTS background_color TEXT NOT NULL DEFAULT '#111111'`;
  } catch (error) {
    console.error("ensureProfileSchema error:", error);
  }
}
