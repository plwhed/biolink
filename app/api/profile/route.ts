import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, ensureProfileSchema, ensureSocialLinksSchema } from "@/lib/db";
import { profiles, socialLinks } from "@/lib/schema";
import { eq } from "drizzle-orm";

type SocialLinkInput = {
  platform: string;
  url: string;
  iconUrl?: string | null;
  order?: number;
};

type ProfileRequestBody = {
  displayName?: string | null;
  description?: string | null;
  bio?: string | null;
  layout?: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  cursorUrl?: string | null;
  blur?: number;
  overlayEnabled?: boolean | number;
  overlayText?: string;
  tiltEnabled?: boolean | number;
  tiltMode?: string;
  borderRadius?: number;
  borderWidth?: number;
  cardWidth?: number;
  cardOpacity?: number;
  borderOpacity?: number;
  cardBlurEnabled?: boolean | number;
  cardBlur?: number;
  avatarShape?: string;
  location?: string | null;
  occupation?: string | null;
  showViews?: boolean | number;
  viewsPosition?: string;
  badgesPosition?: string;
  customLayout?: string | object | null;
  introScreenEnabled?: boolean | number;
  introScreenText?: string;
  accentColor?: string;
  primaryColor?: string;
  textColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  badgeColor?: string;
  socialColor?: string;
  linkHoverColor?: string;
  socialLinks?: SocialLinkInput[];
};

const VIEWS_POSITIONS = ["top-left", "top-right", "bottom-left", "bottom-right"];
const BADGES_POSITIONS = ["auto", "next", "below"];

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await ensureSocialLinksSchema();
  await ensureProfileSchema();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.id));

  const links = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.userId, session.id));

  return NextResponse.json({
    profile: profile ?? null,
    socialLinks: links,
  });
}

async function upsertProfile(
  userId: number,
  data: Record<string, string | number | null>
) {
  const [existing] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.userId, userId));

  if (existing) {
    await db
      .update(profiles)
      .set(data)
      .where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({
      userId,
      ...data,
    });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: ProfileRequestBody;

  try {
    body = (await req.json()) as ProfileRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const profileData: Record<string, string | number | null> = {};

  if (body.displayName !== undefined) {
    profileData.displayName = body.displayName || null;
  }

  if (body.description !== undefined) {
    profileData.description = body.description || null;
  }

  if (body.bio !== undefined) {
    profileData.bio = (body.bio ?? "").slice(0, 400) || null;
  }

  if (body.layout !== undefined) {
    profileData.layout = body.layout;
  }

  if (body.avatarUrl !== undefined) {
    profileData.avatarUrl = body.avatarUrl || null;
  }

  if (body.backgroundUrl !== undefined) {
    profileData.backgroundUrl = body.backgroundUrl || null;
  }

  if (body.cursorUrl !== undefined) {
    profileData.cursorUrl = body.cursorUrl || null;
  }

  if (body.blur !== undefined) {
    profileData.blur = Number(body.blur);
  }

  if (body.overlayEnabled !== undefined) {
    profileData.overlayEnabled = body.overlayEnabled ? 1 : 0;
  }

  if (body.overlayText !== undefined) {
    profileData.overlayText = body.overlayText;
  }

  if (body.tiltEnabled !== undefined) {
    profileData.tiltEnabled = body.tiltEnabled ? 1 : 0;
  }

  if (body.tiltMode !== undefined) {
    profileData.tiltMode = body.tiltMode;
  }

  if (body.borderRadius !== undefined) {
    profileData.borderRadius = Number(body.borderRadius);
  }

  if (body.borderWidth !== undefined) {
    profileData.borderWidth = Number(body.borderWidth);
  }

  if (body.cardWidth !== undefined) {
    profileData.cardWidth = Number(body.cardWidth);
  }

  if (body.cardOpacity !== undefined) {
    profileData.cardOpacity = Number(body.cardOpacity);
  }

  if (body.borderOpacity !== undefined) {
    profileData.borderOpacity = Number(body.borderOpacity);
  }

  if (body.cardBlurEnabled !== undefined) {
    profileData.cardBlurEnabled = body.cardBlurEnabled ? 1 : 0;
  }

  if (body.cardBlur !== undefined) {
    const blur = Number(body.cardBlur);
    if (!Number.isFinite(blur)) {
      return NextResponse.json(
        { error: "Invalid card blur" },
        { status: 400 }
      );
    }
    profileData.cardBlur = Math.min(Math.max(Math.round(blur), 0), 100);
  }

  if (body.avatarShape !== undefined) {
    profileData.avatarShape = body.avatarShape;
  }

  if (body.location !== undefined) {
    profileData.location = body.location || null;
  }

  if (body.occupation !== undefined) {
    profileData.occupation = body.occupation || null;
  }

  if (body.showViews !== undefined) {
    profileData.showViews = body.showViews ? 1 : 0;
  }

  if (body.viewsPosition !== undefined) {
    if (!VIEWS_POSITIONS.includes(body.viewsPosition)) {
      return NextResponse.json(
        { error: "Invalid views position" },
        { status: 400 }
      );
    }
    profileData.viewsPosition = body.viewsPosition;
  }

  if (body.badgesPosition !== undefined) {
    if (!BADGES_POSITIONS.includes(body.badgesPosition)) {
      return NextResponse.json(
        { error: "Invalid badges position" },
        { status: 400 }
      );
    }
    profileData.badgesPosition = body.badgesPosition;
  }

  if (body.customLayout !== undefined) {
    if (body.customLayout === null || body.customLayout === "") {
      profileData.customLayout = null;
    } else {
      try {
        const parsed =
          typeof body.customLayout === "string"
            ? JSON.parse(body.customLayout)
            : body.customLayout;

        // Enabling the free-move Custom layout requires Premium.
        // Turning it off (enabled: false) is always allowed.
        if (
          parsed &&
          typeof parsed === "object" &&
          (parsed as { enabled?: unknown }).enabled
        ) {
          const { isPremiumUser } = await import("@/lib/premium");
          const isPremium = await isPremiumUser(session.id);
          if (!isPremium) {
            return NextResponse.json(
              { error: "Custom layout requires Premium" },
              { status: 403 }
            );
          }
        }

        const serialized = JSON.stringify(parsed);

        if (serialized.length > 250_000) {
          return NextResponse.json(
            { error: "Custom layout is too large" },
            { status: 400 }
          );
        }

        profileData.customLayout = serialized;
      } catch {
        return NextResponse.json(
          { error: "Invalid custom layout JSON" },
          { status: 400 }
        );
      }
    }
  }

  if (body.introScreenEnabled !== undefined) {
    profileData.introScreenEnabled = body.introScreenEnabled ? 1 : 0;
  }

  if (body.introScreenText !== undefined) {
    profileData.introScreenText = body.introScreenText;
  }

  if (body.accentColor !== undefined) {
    profileData.accentColor = body.accentColor;
  }

  if (body.primaryColor !== undefined) {
    profileData.primaryColor = body.primaryColor;
  }

  if (body.textColor !== undefined) {
    profileData.textColor = body.textColor;
  }

  if (body.borderColor !== undefined) {
    profileData.borderColor = body.borderColor;
  }

  if (body.backgroundColor !== undefined) {
    profileData.backgroundColor = body.backgroundColor;
  }

  if (body.badgeColor !== undefined) {
    profileData.badgeColor = body.badgeColor;
  }

  if (body.socialColor !== undefined) {
    profileData.socialColor = body.socialColor;
  }

  if (body.linkHoverColor !== undefined) {
    profileData.linkHoverColor = body.linkHoverColor;
  }

  if (Object.keys(profileData).length > 0) {
    await ensureProfileSchema();
    await upsertProfile(session.id, profileData);
  }

  if (Array.isArray(body.socialLinks)) {
    await ensureSocialLinksSchema();

    await db
      .delete(socialLinks)
      .where(eq(socialLinks.userId, session.id));

    if (body.socialLinks.length > 0) {
      await db.insert(socialLinks).values(
        body.socialLinks.map(
          (link: {
            platform: string;
            url: string;
            iconUrl?: string | null;
            order?: number;
          }) => ({
            userId: session.id,
            platform: link.platform,
            url: link.url,
            iconUrl: link.iconUrl ?? null,
            order: link.order ?? 0,
          })
        )
      );
    }
  }

  return NextResponse.json({ ok: true });
}