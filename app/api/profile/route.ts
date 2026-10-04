import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { profiles, socialLinks } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.id));

  const links = await db
    .select() 
    .from(socialLinks)
    .where(eq(socialLinks.userId, session.id));

  return NextResponse.json({ profile: profile ?? null, socialLinks: links });
}

async function upsertProfile(userId: number, data: Record<string, string | number | null>) {
  const [existing] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.userId, userId));

  if (existing) {
    await db.update(profiles).set(data).where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ userId, ...data });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const profileData: Record<string, string | number | null> = {};
  if (body.displayName !== undefined) profileData.displayName = body.displayName || null;
  if (body.layout !== undefined) profileData.layout = body.layout;
  if (body.avatarUrl !== undefined) profileData.avatarUrl = body.avatarUrl || null;
  if (body.backgroundUrl !== undefined) profileData.backgroundUrl = body.backgroundUrl || null;
  if (body.cursorUrl !== undefined) profileData.cursorUrl = body.cursorUrl || null;
  if (body.blur !== undefined) profileData.blur = body.blur;
  if (body.overlayEnabled !== undefined) profileData.overlayEnabled = body.overlayEnabled ? 1 : 0;
  if (body.overlayText !== undefined) profileData.overlayText = body.overlayText;
  if (body.tiltEnabled !== undefined) profileData.tiltEnabled = body.tiltEnabled ? 1 : 0;
  if (body.tiltMode !== undefined) profileData.tiltMode = body.tiltMode;
  if (body.borderRadius !== undefined) profileData.borderRadius = body.borderRadius;
  if (body.cardWidth !== undefined) profileData.cardWidth = body.cardWidth;
  if (body.accentColor !== undefined) profileData.accentColor = body.accentColor;
  if (body.badgeColor !== undefined) profileData.badgeColor = body.badgeColor;
  if (body.socialColor !== undefined) profileData.socialColor = body.socialColor;
  if (body.linkHoverColor !== undefined) profileData.linkHoverColor = body.linkHoverColor;
  if (body.cardOpacity !== undefined) profileData.cardOpacity = body.cardOpacity;
  if (body.borderOpacity !== undefined) profileData.borderOpacity = body.borderOpacity;
  if (body.description !== undefined) profileData.description = body.description || null;

  if (Object.keys(profileData).length) {
    await upsertProfile(session.id, profileData);
  }

  if (body.socialLinks) {
    await db.delete(socialLinks).where(eq(socialLinks.userId, session.id));
    if (body.socialLinks.length) {
      await db.insert(socialLinks).values(
        body.socialLinks.map((l: { platform: string; url: string; order: number }) => ({
          userId: session.id,
          platform: l.platform,
          url: l.url,
          order: l.order ?? 0,
        }))
      );
    }
  }

  return NextResponse.json({ ok: true });
}
