import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { canAccessAdminPanel } from "@/lib/badges";
import { db } from "@/lib/db";
import { badges } from "@/lib/schema";

export async function POST(req: Request) {
  const session = await getSession();

  if (!(await canAccessAdminPanel(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      name?: string;
      color?: string;
      iconUrl?: string | null;
      iconName?: string;
      iconPrefix?: string;
    };

    const name = String(body.name ?? "").trim();
    const color = String(body.color ?? "#f472b6").trim() || "#f472b6";
    const iconUrl = typeof body.iconUrl === "string" ? body.iconUrl.trim() || null : null;
    const iconName = String(body.iconName ?? "star").trim() || "star";
    const iconPrefix = String(body.iconPrefix ?? "solid").trim() || "solid";

    if (!name) {
      return NextResponse.json({ error: "Badge name is required" }, { status: 400 });
    }

    const existing = await db
      .select({ id: badges.id })
      .from(badges)
      .where(eq(badges.name, name))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "A badge with that name already exists" }, { status: 409 });
    }

    const [created] = await db
      .insert(badges)
      .values({
        name,
        color,
        iconUrl,
        iconName,
        iconPrefix,
      })
      .returning();

    return NextResponse.json({
      ok: true,
      badge: {
        id: String(created.id),
        name: created.name,
        color: created.color,
        iconUrl: created.iconUrl ?? null,
        iconName: created.iconName,
        iconPrefix: created.iconPrefix,
      },
    });
  } catch (error) {
    console.error("Create badge error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
