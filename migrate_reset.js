const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetDb() {
  const client = await pool.connect();
  try {
    console.log("Resetting database...");
    
    await client.query('DROP TABLE IF EXISTS page_views CASCADE');
    await client.query('DROP TABLE IF EXISTS user_badges CASCADE');
    await client.query('DROP TABLE IF EXISTS links CASCADE');
    await client.query('DROP TABLE IF EXISTS social_links CASCADE');
    await client.query('DROP TABLE IF EXISTS profiles CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    await client.query('DROP TABLE IF EXISTS badges CASCADE');
    
    console.log("Tables dropped.");

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    await client.query(`
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

    await client.query(`
      CREATE TABLE social_links (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE links (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        clicks INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE badges (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        icon_prefix TEXT NOT NULL DEFAULT 'solid',
        icon_name TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT 'pink'
      );
    `);

    await client.query(`
      CREATE TABLE user_badges (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE TABLE page_views (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`CREATE INDEX page_views_user_id_idx ON page_views(user_id)`);
    await client.query(`CREATE UNIQUE INDEX social_links_user_platform_idx ON social_links(user_id, platform)`);

    console.log("Database successfully reset. New users will start at ID 1.");
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDb();
