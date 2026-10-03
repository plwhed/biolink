import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { users, links, pageViews, profiles, socialLinks, userBadges, badges } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import ProfileOverlay from "@/components/profile-overlay";
import BadgeIcon from "@/components/badge-icon";
import TiltCard from "@/components/tilt-card";
import ParallaxCard, { ParallaxLayer } from "@/components/parallax-card";

export async function generateMetadata(
  props: { params: Promise<{ username: string }> }
) {
  const { username } = await props.params;
  return { title: `${username} — egirls.lol` };
}

const socialIcons: Record<string, string> = {
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  youtube:
    "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  tiktok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  discord:
    "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
  twitter:
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
};

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

  db.insert(pageViews).values({ userId: user.id }).execute();

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
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.userId, user.id))
    .orderBy(socialLinks.order);

  const userBadgesList = await db
    .select({
      id: badges.id,
      name: badges.name,
      iconPrefix: badges.iconPrefix,
      iconName: badges.iconName,
      color: badges.color,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, user.id));

  const layout = profile?.layout ?? "centered";
  const isCentered = layout === "centered";
  const blur = profile?.blur ?? 0;
  const overlayEnabled = !!profile?.overlayEnabled;
  const overlayText = profile?.overlayText ?? "Click to show";
  const tiltEnabled = !!profile?.tiltEnabled;
  const tiltMode = profile?.tiltMode ?? "tilt";
  const borderRadius = profile?.borderRadius ?? 24;
  const description = profile?.description ?? "";
  const displayName = profile?.displayName ?? user.username;
  const cardOpacity = profile?.cardOpacity ?? 100;
  const borderOpacity = profile?.borderOpacity ?? 100;
  const cardWidth = profile?.cardWidth ?? 420;
  const accentColor = profile?.accentColor ?? "white";
  const badgeColor = profile?.badgeColor ?? "white";
  const socialColor = profile?.socialColor ?? "white";
  const linkHoverColor = profile?.linkHoverColor ?? "white";

  const profileContent = (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-white">
      {profile?.backgroundUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all"
          style={{
            backgroundImage: `url(${profile.backgroundUrl})`,
            filter: blur ? `blur(${blur}px)` : undefined,
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/40 via-zinc-950 to-zinc-950" />
      )}

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        {(() => {
          const accentColors: Record<string, string> = {
            emerald: "#10b981",
            blue: "#3b82f6",
            purple: "#a855f7",
            pink: "#ec4899",
            orange: "#f97316",
            red: "#ef4444",
            yellow: "#eab308",
            cyan: "#06b6d4",
          };
          const accent = accentColors[accentColor] ?? "#F472B6";
          const badgeColors: Record<string, string> = {
            emerald: "#10b981",
            blue: "#3b82f6",
            purple: "#a855f7",
            pink: "#ec4899",
            orange: "#f97316",
            red: "#ef4444",
            yellow: "#eab308",
            cyan: "#06b6d4",
          };
          const badgeAccent = badgeColors[badgeColor] ?? "#F472B6";
          const socialColors: Record<string, string> = {
            white: "#ffffff",
            emerald: "#10b981",
            blue: "#3b82f6",
            purple: "#a855f7",
            pink: "#ec4899",
            orange: "#f97316",
          };
          const socialAccent = socialColors[socialColor] ?? "#ffffff";
          const linkHoverColors: Record<string, string> = {
            emerald: "#10b981",
            blue: "#3b82f6",
            purple: "#a855f7",
            pink: "#ec4899",
            orange: "#f97316",
            red: "#ef4444",
            yellow: "#eab308",
            cyan: "#06b6d4",
          };
          const linkHoverAccent = linkHoverColors[linkHoverColor] ?? "#F472B6";

          const cardBg = `rgba(17, 17, 17, ${cardOpacity / 100})`;
          const cardBorder = `rgba(255, 255, 255, ${borderOpacity / 100 * 0.1})`;

const card = (
            <ParallaxLayer depth={0} z={0}>
              <div
                className={`w-full px-8 py-10 shadow-2xl shadow-black/50 backdrop-blur-2xl ${isCentered ? "text-center" : ""}`}
                style={{
                  borderRadius: `${borderRadius}px`,
                  backgroundColor: cardBg,
                  border: `1px solid ${cardBorder}`,
                  width: `${cardWidth}px`,
                  maxWidth: "100%",
                }}
              >
                <ParallaxLayer depth={10} z={40}>
                  <div className={isCentered ? "flex flex-col items-center" : ""}>
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={user.username}
                        className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-500/20 text-3xl font-bold text-pink-400">
                        {displayName[0].toUpperCase()}
                      </div>
                    )}

                    <h1 className="mt-4 text-2xl font-bold tracking-tight relative flex items-center gap-2" style={{ display: isCentered ? "flex" : "inline-flex" }}>
                      {displayName}
                      {userBadgesList.length > 0 && !isCentered && (
                        <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                          {userBadgesList.map((b) => (
                            <span key={b.id} className="group/badge relative inline-flex cursor-default items-center justify-center rounded-full p-0.5 transition hover:bg-white/10">
                              <BadgeIcon prefix={b.iconPrefix} name={b.iconName} style={{ color: badgeAccent }} />
                              <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-zinc-800 px-2 py-0.5 text-[9px] font-medium text-white/70 opacity-0 shadow-lg transition group-hover/badge:opacity-100">
                                {b.name}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="group/uid inline-block relative">
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-zinc-800 px-2.5 py-1 text-[10px] font-medium text-white/50 opacity-0 transition group-hover/uid:opacity-100">
                          {user.id}
                        </span>
                      </span>
                    </h1>

                    {userBadgesList.length > 0 && isCentered && (
                      <div className="mt-2 inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 mx-auto">
                        {userBadgesList.map((b) => (
                          <span key={b.id} className="group/badge relative inline-flex cursor-default items-center justify-center rounded-full p-0.5 transition hover:bg-white/10">
                            <BadgeIcon prefix={b.iconPrefix} name={b.iconName} style={{ color: badgeAccent }} />
                            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-zinc-800 px-2 py-0.5 text-[9px] font-medium text-white/70 opacity-0 shadow-lg transition group-hover/badge:opacity-100">
                              {b.name}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                    {description && (
                      <p className="mt-4 text-base text-white/60 max-w-lg">{description}</p>
                    )}

                    {userSocials.length > 0 && (
                      <div className={`mt-5 flex gap-4 ${isCentered ? "justify-center" : ""}`}>
                        {userSocials.map((s) => (
                          <a
                            key={s.id}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition hover:opacity-75"
                            style={{ color: socialAccent }}
                          >
                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                              <path d={socialIcons[s.platform] ?? ""} />
                            </svg>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </ParallaxLayer>

                <ParallaxLayer depth={5} z={20}>
                  <div className="mt-8 space-y-3">
                    {userLinks.map((link) => (
                      <a
                        key={link.id}
                        href={`/api/click?id=${link.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-base font-medium text-white backdrop-blur-sm transition ${isCentered ? "justify-center" : ""}`}
                        style={{
                          borderColor: `rgba(255,255,255,${borderOpacity / 100 * 0.2})`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${linkHoverAccent}26`;
                          e.currentTarget.style.borderColor = `${linkHoverAccent}4D`;
                          e.currentTarget.style.color = linkHoverAccent;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                          e.currentTarget.style.borderColor = "";
                          e.currentTarget.style.color = "";
                        }}
                      >
                        <span>{link.title}</span>
                        <svg
                          className="h-5 w-5 shrink-0 opacity-40"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </ParallaxLayer>
              </div>
            </ParallaxLayer>
          );

          if (tiltMode === "parallax") {
            return <ParallaxCard enabled={tiltEnabled} maxTilt={10} perspective={1000}>{card}</ParallaxCard>;
          }
          if (tiltMode === "tilt") {
            return <TiltCard enabled={tiltEnabled} maxTilt={12} perspective={1000} scale={1.015}>{card}</TiltCard>;
          }
          return card;
        })()}
      </div>
    </div>
  );

  if (overlayEnabled) {
    return <ProfileOverlay overlayText={overlayText}>{profileContent}</ProfileOverlay>;
  }

  return profileContent;
}
