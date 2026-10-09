import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { badges, userBadges } from "@/lib/schema";
import { getPremiumStatus } from "@/lib/premium";

export const PREMIUM_BADGE_NAME = "Premium";

/** Holding any of these grants access to the admin panel. */
export const STAFF_BADGE_NAMES = ["Owner", "Developer"] as const;

export interface StaffAccess {
  isOwner: boolean;
  isDeveloper: boolean;
  hasAccess: boolean;
}

/**
 * Badge-gated staff access. Existence of the badge row grants access —
 * the `hidden` flag only controls profile display, not permissions.
 * Revocation = deleting the badge row.
 */
export async function getStaffAccess(userId: number): Promise<StaffAccess> {
  try {
    const rows = await db
      .select({ name: badges.name })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(
        and(
          eq(userBadges.userId, userId),
          inArray(badges.name, [...STAFF_BADGE_NAMES])
        )
      );

    const names = new Set(rows.map((row) => row.name));
    const isOwner = names.has("Owner");
    const isDeveloper = names.has("Developer");

    return { isOwner, isDeveloper, hasAccess: isOwner || isDeveloper };
  } catch (error) {
    console.error("getStaffAccess error:", error);
    return { isOwner: false, isDeveloper: false, hasAccess: false };
  }
}

/**
 * Admin panel gate: the `is_admin` flag always works (recovery path),
 * otherwise an Owner or Developer badge grants access.
 */
export async function canAccessAdminPanel(session: {
  id: number;
  isAdmin?: boolean;
} | null): Promise<boolean> {
  if (!session) return false;
  if (session.isAdmin) return true;
  return (await getStaffAccess(session.id)).hasAccess;
}

/**
 * Badges seeded into the `badges` table on first use. Icon names must exist
 * in `components/badge-icon.tsx` (`fa-` prefix + `solid`/`brand` set).
 * My additions on top of the requested ones: Staff, Verified,
 * Early Supporter, Contributor.
 */
export const DEFAULT_BADGES = [
  { name: "Premium", iconName: "fa-gem", color: "#fbbf24" },
  { name: "Owner", iconName: "fa-crown", color: "#ef4444" },
  { name: "Developer", iconName: "fa-code", color: "#a855f7" },
  { name: "Staff", iconName: "fa-shield", color: "#3b82f6" },
  { name: "Verified", iconName: "fa-circle-check", color: "#22d3ee" },
  { name: "Early Supporter", iconName: "fa-star", color: "#f97316" },
  { name: "Contributor", iconName: "fa-heart", color: "#ec4899" },
  { name: "Special", iconName: "fa-wand-magic-sparkles", color: "#a3e635" },
] as const;

/** Inserts any missing default badges. Safe to call on every page load. */
export async function ensureDefaultBadges() {
  try {
    await db.execute(
      sql`ALTER TABLE IF EXISTS badges ADD COLUMN IF NOT EXISTS icon_url TEXT`
    );

    const existing = await db.select({ name: badges.name }).from(badges);
    const have = new Set(existing.map((row) => row.name));

    for (const badge of DEFAULT_BADGES) {
      if (have.has(badge.name)) continue;
      await db.insert(badges).values({
        name: badge.name,
        iconPrefix: "solid",
        iconName: badge.iconName,
        color: badge.color,
      });
      have.add(badge.name);
    }
  } catch (error) {
    console.error("ensureDefaultBadges error:", error);
  }
}

async function premiumBadgeId(): Promise<string | null> {
  const [badge] = await db
    .select({ id: badges.id })
    .from(badges)
    .where(eq(badges.name, PREMIUM_BADGE_NAME))
    .limit(1);
  return badge ? String(badge.id) : null;
}

/**
 * Grants the Premium badge to premium users (`users.premium = 1` or an
 * active subscription). No-op for everyone else and when already granted.
 */
export async function ensurePremiumBadge(userId: number) {
  try {
    const status = await getPremiumStatus(userId);
    if (!status.isPremium) return false;

    await ensureDefaultBadges();

    const badgeId = await premiumBadgeId();
    if (!badgeId) return false;

    const [existing] = await db
      .select({ id: userBadges.id })
      .from(userBadges)
      .where(
        and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId))
      )
      .limit(1);

    if (!existing) {
      await db.insert(userBadges).values({
        userId,
        badgeId,
        hidden: 0,
      });
    }

    return true;
  } catch (error) {
    console.error("ensurePremiumBadge error:", error);
    return false;
  }
}

/** Removes the Premium badge grant (used when premium lapses). */
export async function revokePremiumBadge(userId: number) {
  try {
    const badgeId = await premiumBadgeId();
    if (!badgeId) return;

    await db
      .delete(userBadges)
      .where(
        and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId))
      );
  } catch (error) {
    console.error("revokePremiumBadge error:", error);
  }
}
