import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, ensureUserBadgeSchema } from "@/lib/db";
import { badges, userBadges } from "@/lib/schema";
import { and, eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();

  await ensureUserBadgeSchema();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: badges.id,
      name: badges.name,
      iconUrl: badges.iconUrl,
      color: badges.color,
      hidden: userBadges.hidden,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, session.id));

  return NextResponse.json({
    badges: rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      iconUrl: row.iconUrl,
      color: row.color,
      hidden: !!row.hidden,
    })),
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();

  await ensureUserBadgeSchema();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    updates?: Array<Record<string, unknown>>;
    badgeId?: unknown;
    hidden?: unknown;
  };

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates = Array.isArray(payload?.updates)
    ? payload.updates
    : payload?.badgeId !== undefined
      ? [{ badgeId: payload.badgeId, hidden: !!payload.hidden }]
      : [];

  if (updates.length === 0) {
    return NextResponse.json({ error: "No badge updates provided" }, { status: 400 });
  }

  const normalized = updates
    .map((entry) => {
      const badgeId =
        typeof entry?.badgeId === "string"
          ? entry.badgeId
          : String(entry?.badgeId ?? "");
      const hidden =
        entry?.hidden === true ||
        entry?.hidden === 1 ||
        entry?.hidden === "true" ||
        entry?.hidden === "1";

      return badgeId ? { badgeId, hidden } : null;
    })
    .filter(Boolean) as Array<{ badgeId: string; hidden: boolean }>;

  if (normalized.length === 0) {
    return NextResponse.json({ error: "No valid badge updates provided" }, { status: 400 });
  }

  for (const update of normalized) {
    await db
      .update(userBadges)
      .set({ hidden: update.hidden ? 1 : 0 })
      .where(and(eq(userBadges.userId, session.id), eq(userBadges.badgeId, update.badgeId)));
  }

  return NextResponse.json({ ok: true, updated: normalized.length });
}
