import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccessAdminPanel } from "@/lib/badges";
import { db, ensurePremiumSchema } from "@/lib/db";
import { users, profiles } from "@/lib/schema";
import { ensurePremiumBadge, revokePremiumBadge } from "@/lib/badges";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!(await canAccessAdminPanel(session))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const userId = Number(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    await ensurePremiumSchema();

    // User table updates
    const userUpdates: Partial<typeof users.$inferInsert> = {};
    if (body.username !== undefined) userUpdates.username = body.username;
    if (body.isAdmin !== undefined) userUpdates.isAdmin = body.isAdmin ? 1 : 0;
    if (body.premium !== undefined) userUpdates.premium = body.premium ? 1 : 0;
    if (body.password !== undefined && body.password) userUpdates.passwordHash = body.password; // In real app, hash this

    if (Object.keys(userUpdates).length > 0) {
      await db
        .update(users)
        .set(userUpdates)
        .where(eq(users.id, userId));
    }

    // Sync the Premium badge with the flag.
    if (body.premium !== undefined) {
      if (body.premium) await ensurePremiumBadge(userId);
      else await revokePremiumBadge(userId);
    }

    // Profile table updates
    const profileUpdates: Partial<typeof profiles.$inferInsert> = {};
    if (body.avatarUrl !== undefined) profileUpdates.avatarUrl = body.avatarUrl || null;
    if (body.backgroundUrl !== undefined) profileUpdates.backgroundUrl = body.backgroundUrl || null;
    if (body.description !== undefined) profileUpdates.description = body.description || null;
    if (body.displayName !== undefined) profileUpdates.displayName = body.displayName || null;

    if (Object.keys(profileUpdates).length > 0) {
      // Upsert profile if it doesn't exist
      const [existing] = await db
        .select({ userId: profiles.userId })
        .from(profiles)
        .where(eq(profiles.userId, userId));

      if (existing) {
        await db
          .update(profiles)
          .set(profileUpdates)
          .where(eq(profiles.userId, userId));
      } else {
        await db.insert(profiles).values({
          userId,
          ...profileUpdates,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
