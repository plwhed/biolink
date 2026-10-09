import {
  pgTable,
  text,
  timestamp,
  integer,
  index,
  unique,
  serial,
} from "drizzle-orm/pg-core";

const uuidId = (name: string) =>
  text(name)
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const userIdFk = (name: string) =>
  integer(name)
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: integer("is_admin").notNull().default(0),
  premium: integer("premium").notNull().default(0),
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
  cardBlur: integer("card_blur").notNull().default(20),
  overlayEnabled: integer("overlay_enabled").notNull().default(0),
  overlayText: text("overlay_text").notNull().default("Click to show"),
  tiltEnabled: integer("tilt_enabled").notNull().default(0),
  tiltMode: text("tilt_mode").notNull().default("tilt"),
  borderRadius: integer("border_radius").notNull().default(24),
  borderWidth: integer("border_width").notNull().default(1),
  description: text("description"),
  displayName: text("display_name"),
  cardOpacity: integer("card_opacity").notNull().default(100),
  borderOpacity: integer("border_opacity").notNull().default(100),
  cardWidth: integer("card_width").notNull().default(420),
  cardBlurEnabled: integer("card_blur_enabled").notNull().default(1),
  avatarShape: text("avatar_shape").notNull().default("circle"),
  location: text("location"),
  occupation: text("occupation"),
  bio: text("bio"),
  showViews: integer("show_views").notNull().default(1),
  viewsPosition: text("views_position").notNull().default("top-right"),
  badgesPosition: text("badges_position").notNull().default("auto"),
  customLayout: text("custom_layout"),
  accentColor: text("accent_color").notNull().default("white"),
  primaryColor: text("primary_color").notNull().default("white"),
  textColor: text("text_color").notNull().default("white"),
  borderColor: text("border_color").notNull().default("white"),
  backgroundColor: text("background_color").notNull().default("#111111"),
  badgeColor: text("badge_color").notNull().default("white"),
  socialColor: text("social_color").notNull().default("white"),
  linkHoverColor: text("link_hover_color").notNull().default("white"),
});

export const socialLinks = pgTable(
  "social_links",
  {
    id: uuidId("id"),
    userId: userIdFk("user_id"),
    platform: text("platform").notNull(),
    url: text("url").notNull(),
    iconUrl: text("icon_url"),
    order: integer("order").notNull().default(0),
  },
  (t) => [
    unique("social_links_user_platform_idx").on(t.userId, t.platform),
  ]
);

export const links = pgTable("links", {
  id: uuidId("id"),
  userId: userIdFk("user_id"),
  title: text("title").notNull(),
  url: text("url").notNull(),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const badges = pgTable("badges", {
  id: uuidId("id"),
  name: text("name").notNull().unique(),
  iconPrefix: text("icon_prefix").notNull().default("solid"),
  iconName: text("icon_name").notNull(),
  iconUrl: text("icon_url"),
  color: text("color").notNull().default("pink"),
});

export const userBadges = pgTable(
  "user_badges",
  {
    id: uuidId("id"),
    userId: userIdFk("user_id"),
    badgeId: text("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    hidden: integer("hidden").notNull().default(0),
  },
  (t) => [unique("user_badges_user_badge_idx").on(t.userId, t.badgeId)]
);

export const pageViews = pgTable(
  "page_views",
  {
    id: uuidId("id"),
    userId: userIdFk("user_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("page_views_user_id_idx").on(t.userId)]
);

export const premiumSubscriptions = pgTable(
  "premium_subscriptions",
  {
    id: uuidId("id"),
    userId: userIdFk("user_id"),
    plan: text("plan").notNull().default("plus"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => [index("premium_subscriptions_user_id_idx").on(t.userId)]
);

export const profileWidgets = pgTable(
  "profile_widgets",
  {
    id: uuidId("id"),
    userId: userIdFk("user_id"),
    type: text("type").notNull(),
    enabled: integer("enabled").notNull().default(0),
    position: integer("position").notNull().default(0),
    config: text("config"),
  },
  (t) => [
    unique("profile_widgets_user_type_idx").on(t.userId, t.type),
    index("profile_widgets_user_id_idx").on(t.userId),
  ]
);

export const profileFeedback = pgTable(
  "profile_feedback",
  {
    id: uuidId("id"),
    profileUserId: userIdFk("profile_user_id"),
    voterIp: text("voter_ip").notNull(),
    kind: text("kind").notNull().default("like"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("profile_feedback_profile_voter_idx").on(
      t.profileUserId,
      t.voterIp
    ),
    index("profile_feedback_profile_kind_idx").on(t.profileUserId, t.kind),
  ]
);
