import {
  pgTable,
  text,
  timestamp,
  integer,
  index,
  unique,
  serial,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const profiles = pgTable("profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  avatarUrl: text("avatar_url"),
  backgroundUrl: text("background_url"),
  cursorUrl: text("cursor_url"),

  layout: text("layout").notNull().default("centered"),
  blur: integer("blur").notNull().default(0),
  overlayEnabled: integer("overlay_enabled").notNull().default(0),
  overlayText: text("overlay_text").notNull().default("Click to show"),
  tiltEnabled: integer("tilt_enabled").notNull().default(0),
  tiltMode: text("tilt_mode").notNull().default("tilt"),
  borderRadius: integer("border_radius").notNull().default(24),

  description: text("description"),
  displayName: text("display_name"),

  cardOpacity: integer("card_opacity").notNull().default(100),
  borderOpacity: integer("border_opacity").notNull().default(100),
  cardWidth: integer("card_width").notNull().default(420),

  accentColor: text("accent_color").notNull().default("white"),
  badgeColor: text("badge_color").notNull().default("white"),
  socialColor: text("social_color").notNull().default("white"),
  linkHoverColor: text("link_hover_color").notNull().default("white"),
});

export const socialLinks = pgTable(
  "social_links",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    platform: text("platform").notNull(),
    url: text("url").notNull(),
    order: integer("order").notNull().default(0),
  },
  (t) => [
    unique("social_links_user_platform_idx").on(t.userId, t.platform),
  ]
);

export const links = pgTable("links", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  url: text("url").notNull(),
  clicks: integer("clicks").notNull().default(0),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),

  name: text("name").notNull().unique(),
  iconPrefix: text("icon_prefix").notNull().default("solid"),
  iconName: text("icon_name").notNull(),
  color: text("color").notNull().default("pink"),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  badgeId: integer("badge_id")
    .notNull()
    .references(() => badges.id, { onDelete: "cascade" }),
});

export const pageViews = pgTable(
  "page_views",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("page_views_user_id_idx").on(t.userId)]
);