import { db } from "./lib/db.ts";
import { sql } from "drizzle-orm";

async function resetDb() {
  try {
    console.log("Resetting database...");
    
    await db.execute(sql`DROP TABLE IF EXISTS page_views`);
    await db.execute(sql`DROP TABLE IF EXISTS user_badges`);
    await db.execute(sql`DROP TABLE IF EXISTS links`);
    await db.execute(sql`DROP TABLE IF EXISTS social_links`);
    await db.execute(sql`DROP TABLE IF EXISTS profiles`);
    await db.execute(sql`DROP TABLE IF EXISTS users`);
    
    console.log("Tables dropped.");

    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
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
        overlay_enabled INTEGER NOT NULL DEFAULT 0,
        overlay_text TEXT NOT NULL DEFAULT 'Click to show',
        tilt_enabled INTEGER NOT NULL DEFAULT 0,
        tilt_mode TEXT NOT NULL DEFAULT 'tilt',
        border_radius INTEGER NOT NULL DEFAULT 24,
        description TEXT,
        display_name TEXT,
        card_opacity INTEGER NOT NULL DEFAULT 100,
        border_opacity INTEGER NOT NULL DEFAULT 100,
        card_width INTEGER NOT NULL DEFAULT 420,
        accent_color TEXT NOT NULL DEFAULT 'white',
        badge_color TEXT NOT NULL DEFAULT 'white',
        social_color TEXT NOT NULL DEFAULT 'white',
        link_hover_color TEXT NOT NULL DEFAULT 'white'
      );
    `);

    await db.execute(sql`
      CREATE TABLE social_links (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0
      );
    `);

    await db.execute(sql`
      CREATE TABLE links (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        clicks INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE badges (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        icon_prefix TEXT NOT NULL DEFAULT 'solid',
        icon_name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT 'pink'
      );
    `);

    await db.execute(sql`
      CREATE TABLE user_badges (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE
      );
    `);

    await db.execute(sql`
      CREATE TABLE page_views (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`CREATE INDEX page_views_user_id_idx ON page_views(user_id)`);
    await db.execute(sql`CREATE UNIQUE INDEX social_links_user_platform_idx ON social_links(user_id, platform)`);

    console.log("Database successfully reset. New users will start at ID 1.");
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

resetDb();
