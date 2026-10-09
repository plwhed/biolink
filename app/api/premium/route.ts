import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, ensurePremiumSchema } from "@/lib/db";
import { premiumSubscriptions, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import {
  cancelPremium,
  getPremiumStatus,
  isPremiumPlanId,
} from "@/lib/premium";
import { ensurePremiumBadge, revokePremiumBadge } from "@/lib/badges";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getPremiumStatus(session.id);
  return NextResponse.json(status);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { plan?: unknown };
  try {
    body = (await req.json()) as { plan?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isPremiumPlanId(body.plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  await ensurePremiumSchema();

  // Replace any existing active subscription with the new plan.
  // (Demo checkout — no real payment provider is wired up yet.)
  await cancelPremium(session.id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const [row] = await db
    .insert(premiumSubscriptions)
    .values({
      userId: session.id,
      plan: body.plan,
      status: "active",
      expiresAt,
    })
    .returning({
      plan: premiumSubscriptions.plan,
      expiresAt: premiumSubscriptions.expiresAt,
    });

  // Flag the user as premium (auto-grants the Premium badge).
  await db
    .update(users)
    .set({ premium: 1 })
    .where(eq(users.id, session.id));
  await ensurePremiumBadge(session.id);

  return NextResponse.json({
    ok: true,
    plan: row?.plan ?? body.plan,
    expiresAt: row?.expiresAt ?? expiresAt,
  });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await cancelPremium(session.id);
  await db
    .update(users)
    .set({ premium: 0 })
    .where(eq(users.id, session.id));
  await revokePremiumBadge(session.id);
  return NextResponse.json({ ok: true });
}
