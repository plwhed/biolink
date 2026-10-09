import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db, ensureFeedbackSchema } from "@/lib/db";
import { profileFeedback, users } from "@/lib/schema";

export type FeedbackKind = "like" | "dislike";

export interface FeedbackState {
  likes: number;
  dislikes: number;
  mine: FeedbackKind | null;
}

export const EMPTY_FEEDBACK: FeedbackState = {
  likes: 0,
  dislikes: 0,
  mine: null,
};

export function isFeedbackKind(value: unknown): value is FeedbackKind {
  return value === "like" || value === "dislike";
}

/** Best-effort visitor IP (one vote per IP per profile). */
export async function getVoterIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

export async function getFeedback(
  profileUserId: number,
  voterIp?: string | null
): Promise<FeedbackState> {
  await ensureFeedbackSchema();

  const rows = await db
    .select({
      kind: profileFeedback.kind,
      count: sql<number>`count(*)::int`,
    })
    .from(profileFeedback)
    .where(eq(profileFeedback.profileUserId, profileUserId))
    .groupBy(profileFeedback.kind);

  let likes = 0;
  let dislikes = 0;

  for (const row of rows) {
    if (row.kind === "like") likes = row.count;
    else if (row.kind === "dislike") dislikes = row.count;
  }

  let mine: FeedbackKind | null = null;

  if (voterIp) {
    const [vote] = await db
      .select({ kind: profileFeedback.kind })
      .from(profileFeedback)
      .where(
        and(
          eq(profileFeedback.profileUserId, profileUserId),
          eq(profileFeedback.voterIp, voterIp)
        )
      )
      .limit(1);

    if (vote && isFeedbackKind(vote.kind)) mine = vote.kind;
  }

  return { likes, dislikes, mine };
}

/**
 * Toggles a vote: same kind again removes it, the other kind switches it.
 * Returns the fresh counts. One vote per IP per profile.
 */
export async function castVote(
  profileUserId: number,
  voterIp: string,
  kind: FeedbackKind
): Promise<FeedbackState> {
  await ensureFeedbackSchema();

  const [owner] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, profileUserId))
    .limit(1);

  if (!owner) throw new Error("Profile not found");

  const whereOwnerIp = and(
    eq(profileFeedback.profileUserId, profileUserId),
    eq(profileFeedback.voterIp, voterIp)
  );

  const [existing] = await db
    .select({ kind: profileFeedback.kind })
    .from(profileFeedback)
    .where(whereOwnerIp)
    .limit(1);

  if (existing && existing.kind === kind) {
    await db.delete(profileFeedback).where(whereOwnerIp);
  } else if (existing) {
    await db
      .update(profileFeedback)
      .set({ kind })
      .where(whereOwnerIp);
  } else {
    await db.insert(profileFeedback).values({
      profileUserId,
      voterIp,
      kind,
    });
  }

  return getFeedback(profileUserId, voterIp);
}
