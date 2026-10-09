import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function resetDb() {
  try {
    console.log("Resetting database...");

    await db.execute(sql`DROP TABLE IF EXISTS premium_subscriptions`);
    await db.execute(sql`DROP TABLE IF EXISTS profile_feedback`);
    await db.execute(sql`DROP TABLE IF EXISTS profile_widgets`);
    await db.execute(sql`DROP TABLE IF EXISTS page_views`);
    await db.execute(sql`DROP TABLE IF EXISTS user_badges`);
    await db.execute(sql`DROP TABLE IF EXISTS links`);
    await db.execute(sql`DROP TABLE IF EXISTS social_links`);
    await db.execute(sql`DROP TABLE IF EXISTS profiles`);
    await db.execute(sql`DROP TABLE IF EXISTS users`);
    await db.execute(sql`DROP TABLE IF EXISTS badges`);

    console.log("Tables dropped.");

    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_admin INTEGER NOT NULL DEFAULT 0,
        premium INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE profiles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        avatar_url TEXT,
        background_url TEXT,
        cursor_url TEXT,
        layout TEXT NOT NULL DEFAULT 'centered',
        blur INTEGER NOT NULL DEFAULT 0,
        card_blur INTEGER NOT NULL DEFAULT 20,
        overlay_enabled INTEGER NOT NULL DEFAULT 0,
        overlay_text TEXT NOT NULL DEFAULT 'Click to show',
        tilt_enabled INTEGER NOT NULL DEFAULT 0,
        tilt_mode TEXT NOT NULL DEFAULT 'tilt',
        border_radius INTEGER NOT NULL DEFAULT 24,
        border_width INTEGER NOT NULL DEFAULT 1,
        description TEXT,
        display_name TEXT,
        card_opacity INTEGER NOT NULL DEFAULT 100,
        border_opacity INTEGER NOT NULL DEFAULT 100,
        card_width INTEGER NOT NULL DEFAULT 420,
        card_blur_enabled INTEGER NOT NULL DEFAULT 1,
        avatar_shape TEXT NOT NULL DEFAULT 'circle',
        location TEXT,
        occupation TEXT,
        bio TEXT,
        show_views INTEGER NOT NULL DEFAULT 1,
        views_position TEXT NOT NULL DEFAULT 'top-right',
        badges_position TEXT NOT NULL DEFAULT 'auto',
        custom_layout TEXT,
        accent_color TEXT NOT NULL DEFAULT 'white',
        primary_color TEXT NOT NULL DEFAULT 'white',
        text_color TEXT NOT NULL DEFAULT 'white',
        border_color TEXT NOT NULL DEFAULT 'white',
        background_color TEXT NOT NULL DEFAULT '#111111',
        badge_color TEXT NOT NULL DEFAULT 'white',
        social_color TEXT NOT NULL DEFAULT 'white',
        link_hover_color TEXT NOT NULL DEFAULT 'white'
      );
    `);

    await db.execute(sql`
      CREATE TABLE social_links (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        icon_url TEXT,
        "order" INTEGER NOT NULL DEFAULT 0
      );
    `);

    await db.execute(sql`
      CREATE TABLE links (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        clicks INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE badges (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL UNIQUE,
        icon_prefix TEXT NOT NULL DEFAULT 'solid',
        icon_name TEXT NOT NULL,
        icon_url TEXT,
        color TEXT NOT NULL DEFAULT 'pink'
      );
    `);

    await db.execute(sql`
      CREATE TABLE user_badges (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
        hidden INTEGER NOT NULL DEFAULT 0
      );
    `);

    await db.execute(sql`
      CREATE TABLE page_views (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE premium_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan TEXT NOT NULL DEFAULT 'plus',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ
      );
    `);

    await db.execute(sql`CREATE INDEX page_views_user_id_idx ON page_views(user_id)`);
    await db.execute(sql`
      CREATE TABLE profile_feedback (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        profile_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        voter_ip TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'like',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await db.execute(sql`CREATE UNIQUE INDEX profile_feedback_profile_voter_idx ON profile_feedback(profile_user_id, voter_ip)`);
    await db.execute(sql`CREATE INDEX profile_feedback_profile_kind_idx ON profile_feedback(profile_user_id, kind)`);
    await db.execute(sql`
      CREATE TABLE profile_widgets (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 0,
        position INTEGER NOT NULL DEFAULT 0,
        config TEXT
      );
    `);
    await db.execute(sql`CREATE UNIQUE INDEX profile_widgets_user_type_idx ON profile_widgets(user_id, type)`);
    await db.execute(sql`CREATE INDEX profile_widgets_user_id_idx ON profile_widgets(user_id)`);
    await db.execute(sql`CREATE INDEX premium_subscriptions_user_id_idx ON premium_subscriptions(user_id)`);
    await db.execute(sql`CREATE UNIQUE INDEX social_links_user_platform_idx ON social_links(user_id, platform)`);
    await db.execute(sql`CREATE UNIQUE INDEX user_badges_user_badge_idx ON user_badges(user_id, badge_id)`);

    console.log("Database successfully reset.");
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

resetDb();
