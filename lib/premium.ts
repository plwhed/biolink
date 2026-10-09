import { and, desc, eq } from "drizzle-orm";
import { db, ensurePremiumSchema } from "@/lib/db";
import { premiumSubscriptions, users } from "@/lib/schema";

export {
  PREMIUM_PLANS,
  isPremiumPlanId,
  type PremiumPlanId,
} from "./premium-plans";

export interface PremiumStatus {
  isPremium: boolean;
  plan: string | null;
  status: string | null;
  expiresAt: Date | null;
}

/**
 * Returns the user's current premium state. A subscription row counts as
 * active when status = 'active' and (expires_at is null or in the future).
 * The `users.premium` flag also grants premium (manual/lifetime grants).
 * Always safe to call — ensures the table exists first.
 */
export async function getPremiumStatus(
  userId: number
): Promise<PremiumStatus> {
  await ensurePremiumSchema();

  const [user] = await db
    .select({ premium: users.premium })
    .from(users)
    .where(eq(users.id, userId));

  const flagged = (user?.premium ?? 0) === 1;

  const rows = await db
    .select()
    .from(premiumSubscriptions)
    .where(eq(premiumSubscriptions.userId, userId))
    .orderBy(desc(premiumSubscriptions.createdAt))
    .limit(5);

  const now = new Date();
  const active = rows.find(
    (row) =>
      row.status === "active" &&
      (!row.expiresAt || new Date(row.expiresAt) > now)
  );

  if (active) {
    return {
      isPremium: true,
      plan: active.plan,
      status: active.status,
      expiresAt: active.expiresAt,
    };
  }

  if (flagged) {
    if (rows.length > 0) {
      // Flag left over from an expired/cancelled subscription — heal it.
      await db
        .update(users)
        .set({ premium: 0 })
        .where(eq(users.id, userId));
      return { isPremium: false, plan: null, status: null, expiresAt: null };
    }
    // Manual (lifetime) grant with no subscription history.
    return { isPremium: true, plan: "premium", status: "active", expiresAt: null };
  }

  return { isPremium: false, plan: null, status: null, expiresAt: null };
}

export async function isPremiumUser(userId: number): Promise<boolean> {
  const status = await getPremiumStatus(userId);
  return status.isPremium;
}

/** Deactivates any currently active subscription rows for the user. */
export async function cancelPremium(userId: number) {
  await ensurePremiumSchema();
  await db
    .update(premiumSubscriptions)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(premiumSubscriptions.userId, userId),
        eq(premiumSubscriptions.status, "active")
      )
    );
}
