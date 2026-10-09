import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { canAccessAdminPanel } from "@/lib/badges";
import { db, ensureUserBadgeSchema } from "@/lib/db";
import { userBadges } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  await ensureUserBadgeSchema();

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

    const results = await db
      .select({
        badgeId: userBadges.badgeId,
        hidden: userBadges.hidden,
      })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    return NextResponse.json({
      badges: results.map((r) => ({
        badgeId: String(r.badgeId),
        hidden: !!r.hidden,
      })),
    });
  } catch (error) {
    console.error("Admin fetch badges error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  await ensureUserBadgeSchema();

  if (!(await canAccessAdminPanel(session))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const userId = Number(id);
    const rawBody = await req.text();
    let payload: Record<string, unknown> = {};

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON body" },
          { status: 400 }
        );
      }
    }

    const badgeId = typeof payload.badgeId === "string" ? payload.badgeId : typeof payload.id === "string" ? payload.id : String(payload.badgeId ?? payload.id ?? "");

    if (!Number.isInteger(userId) || userId < 1 || !badgeId || !badgeId.trim()) {
      return NextResponse.json(
        { error: "Missing userId or badgeId" },
        { status: 400 }
      );
    }

    const existing = await db
      .select({ id: userBadges.id })
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badgeId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ ok: true, alreadyExists: true });
    }

    await db.insert(userBadges).values({
      userId,
      badgeId,
      hidden: 0,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      String(error.code) === "23505"
    ) {
      // Unique violation
      return NextResponse.json({ ok: true, alreadyExists: true });
    }
    console.error("Admin assign badge error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  await ensureUserBadgeSchema();

  if (!(await canAccessAdminPanel(session))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const userId = Number(id);
    const rawBody = await req.text();
    let payload: Record<string, unknown> = {};

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON body" },
          { status: 400 }
        );
      }
    }

    const badgeId = typeof payload.badgeId === "string" ? payload.badgeId : typeof payload.id === "string" ? payload.id : String(payload.badgeId ?? payload.id ?? "");
    const hidden = payload.hidden === true || payload.hidden === 1 || payload.hidden === "true" || payload.hidden === "1";

    if (!Number.isInteger(userId) || userId < 1 || !badgeId || !badgeId.trim()) {
      return NextResponse.json(
        { error: "Missing userId or badgeId" },
        { status: 400 }
      );
    }

    await db
      .update(userBadges)
      .set({ hidden: hidden ? 1 : 0 })
      .where(
        and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badgeId)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin update badge visibility error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  await ensureUserBadgeSchema();

  if (!(await canAccessAdminPanel(session))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const userId = Number(id);
    const { searchParams } = new URL(req.url);
    const badgeId = searchParams.get("badgeId") ?? "";

    if (!Number.isInteger(userId) || userId < 1 || !badgeId || !badgeId.trim()) {
      return NextResponse.json(
        { error: "Missing userId or badgeId" },
        { status: 400 }
      );
    }

    await db
      .delete(userBadges)
      .where(
        and(
          eq(userBadges.userId, userId),
          eq(userBadges.badgeId, badgeId)
        )
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin remove badge error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
