import { notFound } from "next/navigation";
import {
  db,
  ensureProfileSchema,
  ensureSocialLinksSchema,
  ensureUserBadgeSchema,
} from "@/lib/db";
import {
  users,
  links,
  pageViews,
  profiles,
  socialLinks,
  userBadges,
  badges,
} from "@/lib/schema";
import { and, eq, sql } from "drizzle-orm";
import { resolveColor, withAlpha } from "@/lib/color";
import ProfileOverlay from "@/components/profile-overlay";
import TiltCard from "@/components/tilt-card";
import ParallaxCard from "@/components/parallax-card";
import ProfileCard from "@/components/profile/profile-card";
import { ProfileWidgets } from "@/components/profile/widgets";
import { cardGlass } from "@/components/profile/widgets/glass";
import { getPremiumStatus } from "@/lib/premium";
import { ensureDefaultBadges, ensurePremiumBadge } from "@/lib/badges";
import { getEnabledWidgets } from "@/lib/widgets";
import { getFeedback, getVoterIp } from "@/lib/feedback";

export async function generateMetadata(
  props: { params: Promise<{ username: string }> }
) {
  const { username } = await props.params;

  return {
    title: `${username} — egirls.lol`,
  };
}

export default async function UserProfilePage(
  props: { params: Promise<{ username: string }> }
) {
  const { username } = await props.params;

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username));

  if (!user) notFound();

  await ensureUserBadgeSchema();
  await ensureSocialLinksSchema();
  await ensureProfileSchema();
  await ensureDefaultBadges();
  await ensurePremiumBadge(user.id);
  await db.insert(pageViews).values({ userId: user.id }).execute();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id));

  const userLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, user.id))
    .orderBy(sql`${links.createdAt} desc`);

  const userSocials = await db
    .select({
      id: socialLinks.id,
      platform: socialLinks.platform,
      url: socialLinks.url,
      iconUrl: socialLinks.iconUrl,
      order: socialLinks.order,
    })
    .from(socialLinks)
    .where(eq(socialLinks.userId, user.id))
    .orderBy(socialLinks.order);

  const userBadgesList = await db
    .select({
      id: badges.id,
      name: badges.name,
      iconPrefix: badges.iconPrefix,
      iconName: badges.iconName,
      iconUrl: badges.iconUrl,
      color: badges.color,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(and(eq(userBadges.userId, user.id), eq(userBadges.hidden, 0)));

  const showViews =
    profile?.showViews == null ? true : Number(profile.showViews) !== 0;

  let viewCount = 0;

  if (showViews) {
    const [count] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pageViews)
      .where(eq(pageViews.userId, user.id));

    viewCount = count?.count ?? 0;
  }

  /* ---------------- page chrome (background, tilt, overlay) ---------------- */

  const backgroundBlur = profile?.blur ?? 0;
  const overlayEnabled = !!profile?.overlayEnabled;
  const overlayText = profile?.overlayText ?? "Click to show";
  const tiltEnabled = !!profile?.tiltEnabled;
  const tiltMode = profile?.tiltMode ?? "tilt";

  const primaryColor = resolveColor(
    profile?.primaryColor ?? profile?.accentColor,
    "#ffffff"
  );

  const backgroundColor = resolveColor(profile?.backgroundColor, "#111111");

  const linkHoverAccent = resolveColor(
    profile?.linkHoverColor,
    primaryColor
  );

  // Custom (free-move) layout is Premium-only — visitors never see it
  // for users without an active subscription, even if it is stored.
  const premium = await getPremiumStatus(user.id);
  const effectiveProfile = !premium.isPremium && profile?.customLayout
    ? { ...profile, customLayout: null }
    : profile;

  const feedback = await getFeedback(user.id, await getVoterIp());
  const widgets = await getEnabledWidgets(user.id);

  const card = (
    <ProfileCard
      user={user}
      profile={effectiveProfile ?? null}
      badges={userBadgesList}
      socials={userSocials}
      links={userLinks}
      viewCount={viewCount}
      feedback={feedback}
    />
  );

  const profileContent = (
    <div
      className="relative min-h-screen overflow-hidden font-sans"
      style={{ backgroundColor }}
    >
      {profile?.backgroundUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all"
          style={{
            backgroundImage: `url(${profile.backgroundUrl})`,
            filter:
              backgroundBlur > 0
                ? `blur(${backgroundBlur}px)`
                : undefined,
            transform:
              backgroundBlur > 0 ? "scale(1.03)" : undefined,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor,
            backgroundImage: `radial-gradient(circle at 20% 20%, ${withAlpha(
              primaryColor,
              0.16
            )}, transparent 50%), radial-gradient(circle at 80% 80%, ${withAlpha(
              linkHoverAccent,
              0.1
            )}, transparent 50%)`,
          }}
        />
      )}

      <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-12">
        {tiltMode === "parallax" ? (
          <ParallaxCard
            enabled={tiltEnabled}
            maxTilt={10}
            perspective={1000}
          >
            {card}
          </ParallaxCard>
        ) : tiltMode === "tilt" ? (
          <TiltCard
            enabled={tiltEnabled}
            maxTilt={12}
            perspective={1000}
            scale={1.015}
          >
            {card}
          </TiltCard>
        ) : (
          card
        )}
        <ProfileWidgets
          widgets={widgets}
          width={profile?.cardWidth ?? 420}
          glass={cardGlass(effectiveProfile ?? null)}
        />
      </div>
    </div>
  );

  if (overlayEnabled) {
    return (
      <ProfileOverlay overlayText={overlayText}>
        {profileContent}
      </ProfileOverlay>
    );
  }

  return profileContent;
}
