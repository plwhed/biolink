"use client";

/**
 * Halo — the single profile template.
 *
 * Ported from `templates/profile_1`: a wide glass card with the avatar and
 * name/badges side by side on the top row, a centered social row below,
 * and like/dislike buttons pinned to the bottom-right corner.
 *
 * Everything is driven by the user's real data (profile colors, avatar,
 * badges, socials, links, views). To add another template, copy this file's
 * shape (`*Meta` + full-card component + `*Preview`) and register it in
 * `./index.ts`.
 */

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBitcoin,
  faDiscord,
  faEthereum,
  faGithub,
  faInstagram,
  faLastfm,
  faPaypal,
  faReddit,
  faSnapchat,
  faSoundcloud,
  faSpotify,
  faSteam,
  faTelegram,
  faTiktok,
  faTwitch,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import BadgeIcon from "@/components/badge-icon";
import Tooltip from "@/components/ui/tooltip";
import { resolveColor, withAlpha } from "@/lib/color";
import { avatarStyle } from "@/lib/profile-layout";
import type {
  ProfileCardBadge,
  ProfileCardLink,
  ProfileCardProfile,
  ProfileCardSocial,
} from "../profile-card";
import type { FeedbackKind, FeedbackState } from "@/lib/feedback";

export const haloMeta = {
  id: "halo",
  label: "Halo",
  description: "Wide glass card — avatar, name, badges and socials.",
  file: "halo.tsx",
  align: "left",
} as const;

export interface HaloCardProps {
  user: { id: number; username: string };
  profile: ProfileCardProfile | null;
  badges?: ProfileCardBadge[];
  socials?: ProfileCardSocial[];
  links?: ProfileCardLink[];
  viewCount?: number;
  /** When true, links/socials render inert (dashboard previews). */
  preview?: boolean;
  /** Server-rendered like/dislike state (null while unknown). */
  feedback?: FeedbackState | null;
}

/* ------------------------------------------------------------------ */
/* Social icons: FontAwesome brands (exact proportions) + a few       */
/* hand paths for platforms FA doesn't ship (roblox, kick, …)        */
/* ------------------------------------------------------------------ */

const brandIcons: Record<string, typeof faDiscord> = {
  instagram: faInstagram,
  youtube: faYoutube,
  tiktok: faTiktok,
  discord: faDiscord,
  twitter: faXTwitter,
  x: faXTwitter,
  github: faGithub,
  telegram: faTelegram,
  snapchat: faSnapchat,
  reddit: faReddit,
  twitch: faTwitch,
  lastfm: faLastfm,
  spotify: faSpotify,
  bitcoin: faBitcoin,
  ethereum: faEthereum,
  paypal: faPaypal,
  steam: faSteam,
  soundcloud: faSoundcloud,
};

const socialPaths: Record<string, string> = {
  roblox:
    "M8.3 2.5l13.2 4.2-2.4 8.7L5.9 11.2 8.3 2.5zm4.8 7.6l1.5-5.4 5.4 1.5-1.5 5.4-5.4-1.5zm-6.6 6.7l6.9 2.1-1.6 5.9-6.9-2.1 1.6-5.9z",
  kick:
    "M8.2 3.5h3.1v5.6H8.2V3.5zm4.1 0h3.1v8.5h-3.1V3.5zm-4.1 7.8h10.4v3.1H8.2v-3.1zM3.5 13.5h3.1v4.2h-3.1v-4.2zm13.1 0h3.1v4.2h-3.1v-4.2z",
  solana:
    "M4.6 7.2C5.1 6.7 5.9 6.5 6.6 6.5h11.8c.8 0 1.3.9.8 1.5L18.5 10c-.5.5-1.3.9-2 .7H4.6c-.8 0-1.3-.9-.8-1.5l1.8-2.3zm0 9.6c.5-.5 1.3-.7 2-.7h11.8c.8 0 1.3.9.8 1.5L18.5 20c-.5.5-1.3.7-2 .7H4.6c-.8 0-1.3-.9-.8-1.5l1.8-2.3zm13.9-7.2h2.8c.5 0 .8.4.8.8s-.4.8-.8.8h-2.8c-.4 0-.8-.4-.8-.8s.4-.8.8-.8zm-4.1 0h2.8c.5 0 .8.4.8.8s-.4.8-.8.8h-2.8c-.4 0-.8-.4-.8-.8s.4-.8.8-.8z",
  onlyfans:
    "M12 2.5c-4.1 0-7.5 3.4-7.5 7.5s3.4 7.5 7.5 7.5 7.5-3.4 7.5-7.5-3.4-7.5-7.5-7.5zm-1.1 3.6h2.2v4.3h3.5v2.2h-3.5v4.3h-2.2v-4.3H7.4v-2.2h3.5V6.1z",
};

const platformNames: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  discord: "Discord",
  twitter: "X",
  x: "X",
  github: "GitHub",
  telegram: "Telegram",
  snapchat: "Snapchat",
  reddit: "Reddit",
  twitch: "Twitch",
  lastfm: "Last.fm",
  spotify: "Spotify",
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  solana: "Solana",
  paypal: "PayPal",
  steam: "Steam",
  roblox: "Roblox",
  soundcloud: "SoundCloud",
  kick: "Kick",
  onlyfans: "OnlyFans",
  custom: "Custom",
};

function getPlatformName(platform: string) {
  return platformNames[platform.toLowerCase()] ?? platform;
}

const LIKE_PATH =
  "M5 9v12H1V9zm4 12a2 2 0 0 1-2-2V9c0-.55.22-1.05.59-1.41L14.17 1l1.06 1.06c.27.27.44.64.44 1.05l-.03.32L14.69 8H21a2 2 0 0 1 2 2v2c0 .26-.05.5-.14.73l-3.02 7.05C19.54 20.5 18.83 21 18 21zm0-2h9.03L21 12v-2h-8.79l1.13-5.32L9 9.03z";
const DISLIKE_PATH =
  "M19 15V3h4v12zM15 3a2 2 0 0 1 2 2v10c0 .55-.22 1.05-.59 1.41L9.83 23l-1.06-1.06c-.27-.27-.44-.64-.44-1.06l.03-.31l.95-4.57H3a2 2 0 0 1-2-2v-2c0-.26.05-.5.14-.73l3.02-7.05C4.46 3.5 5.17 3 6 3zm0 2H5.97L3 12v2h8.78l-1.13 5.32L15 14.97z";

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function HaloCard({
  user,
  profile,
  badges = [],
  socials = [],
  links = [],
  viewCount = 0,
  preview = false,
  feedback = null,
}: HaloCardProps) {
  const [fb, setFb] = useState<FeedbackState>(
    () => feedback ?? { likes: 0, dislikes: 0, mine: null }
  );
  const [voting, setVoting] = useState(false);

  const ownerId = typeof user?.id === "number" ? user.id : 0;

  // Keep server-provided state in sync when it arrives/changes.
  useEffect(() => {
    if (feedback) setFb(feedback);
  }, [feedback]);

  // Live profiles without SSR state load their own counts (read-only).
  useEffect(() => {
    if (preview || feedback || ownerId < 1) return;
    let cancelled = false;
    fetch(`/api/feedback?userId=${ownerId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setFb({
            likes: data.likes ?? 0,
            dislikes: data.dislikes ?? 0,
            mine: data.mine ?? null,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [preview, feedback, ownerId]);

  const vote = async (kind: FeedbackKind) => {
    if (preview || voting || ownerId < 1) return;

    const prev = fb;
    const next: FeedbackState =
      prev.mine === kind
        ? {
            likes: Math.max(0, prev.likes - (kind === "like" ? 1 : 0)),
            dislikes: Math.max(
              0,
              prev.dislikes - (kind === "dislike" ? 1 : 0)
            ),
            mine: null,
          }
        : prev.mine
          ? kind === "like"
            ? {
                likes: prev.likes + 1,
                dislikes: Math.max(0, prev.dislikes - 1),
                mine: kind,
              }
            : {
                likes: Math.max(0, prev.likes - 1),
                dislikes: prev.dislikes + 1,
                mine: kind,
              }
          : kind === "like"
            ? { ...prev, likes: prev.likes + 1, mine: kind }
            : { ...prev, dislikes: prev.dislikes + 1, mine: kind };

    setFb(next);
    setVoting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: ownerId, kind }),
      });
      if (!res.ok) throw new Error("vote failed");
      const data = await res.json();
      setFb({
        likes: data.likes ?? 0,
        dislikes: data.dislikes ?? 0,
        mine: data.mine ?? null,
      });
    } catch {
      setFb(prev);
    } finally {
      setVoting(false);
    }
  };

  const blockPreviewClick = (event: { preventDefault: () => void }) => {
    if (preview) event.preventDefault();
  };

  const textColor = resolveColor(profile?.textColor, "#ffffff");
  const badgeAccent = resolveColor(profile?.badgeColor, "#ffffff");
  const socialAccent = resolveColor(profile?.socialColor, "#ffffff");
  const borderColor = resolveColor(profile?.borderColor, "#ffffff");
  const cardOpacity = profile?.cardOpacity ?? 100;
  const borderOpacity = profile?.borderOpacity ?? 100;
  const borderWidth = profile?.borderWidth ?? 1;
  const cardBlurEnabled = profile?.cardBlurEnabled ?? 1;
  const cardBlur = profile?.cardBlur ?? 2;
  const glassFill = withAlpha(
    resolveColor(profile?.backgroundColor, "#000000"),
    0.45 * (Math.min(Math.max(cardOpacity, 0), 100) / 100)
  );
  const frostPx = cardBlurEnabled
    ? Math.min(Math.max(cardBlur, 0), 60)
    : 0;

  const borderRadius = profile?.borderRadius ?? 25;
  const cardWidth = profile?.cardWidth ?? 420;
  const avatarShape = profile?.avatarShape ?? "circle";
  const displayName = profile?.displayName || user.username;
  const bio = profile?.bio ?? "";
  const description = profile?.description ?? "";
  const occupation = profile?.occupation ?? "";
  const location = profile?.location ?? "";
  const showViews =
    profile?.showViews == null ? true : Number(profile.showViews) !== 0;
  const badgesPlacement = profile?.badgesPosition ?? "auto";
  const badgesBelow = badgesPlacement === "below";

  const badgesRow =
    badges.length > 0 ? (
      <span className="inline-flex shrink-0 flex-nowrap items-center">
        <span className="relative inline-flex flex-wrap items-center justify-start gap-1.5 px-2 py-1">
          {badges.map((badge) => (
            <Tooltip key={badge.id} label={badge.name} placement="top">
              <span
                className="inline-flex h-6 w-6 shrink-0 cursor-default items-center justify-center transition-transform hover:scale-110"
                style={{
                  color: badgeAccent,
                  filter: `drop-shadow(0 0 3px ${withAlpha(
                    badgeAccent,
                    0.58
                  )}) drop-shadow(0 0 5.5px ${withAlpha(badgeAccent, 0.22)})`,
                }}
              >
                <BadgeIcon
                  prefix={badge.iconPrefix}
                  name={badge.iconName}
                  url={badge.iconUrl ?? undefined}
                  style={{
                    color: badgeAccent,
                    width: "20px",
                    height: "20px",
                  }}
                />
              </span>
            </Tooltip>
          ))}
        </span>
      </span>
    ) : null;

  return (
    <div
      data-card-root
      className="w-full"
      style={{ width: `${cardWidth}px`, maxWidth: "100%" }}
    >
      <div className="relative" style={{ borderRadius: `${borderRadius}px` }}>
        {/* glass panel */}
        <div
          className="relative"
          style={{
            border: "none",
            borderRadius: `${borderRadius}px`,
            outline:
              borderWidth > 0
                ? `${borderWidth}px solid ${withAlpha(
                    borderColor,
                    Math.min(Math.max(borderOpacity, 0), 100) / 100
                  )}`
                : undefined,
            boxShadow:
              "0 18px 42px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 0 60px rgba(255, 255, 255, 0.04)",
            overflow: "visible",
            position: "relative",
            backgroundColor: "transparent",
            backdropFilter: `blur(${frostPx}px) saturate(185%) brightness(1.06)`,
            WebkitBackdropFilter: `blur(${frostPx}px) saturate(185%) brightness(1.06)`,
            minHeight: "190px",
            paddingBottom: "48px",
          }}
        >
          {/* frosted background copy — plain filter blur (always works),
              clipped to the card so edges stay clean */}
          {profile?.backgroundUrl && frostPx > 0 && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
              style={{ borderRadius: `${borderRadius}px` }}
            >
              <div
                className="absolute bg-cover bg-center"
                style={{
                  inset: `${-(frostPx * 1.5 + 12)}px`,
                  backgroundImage: `url(${profile.backgroundUrl})`,
                  filter: `blur(${frostPx}px) saturate(185%) brightness(1.06)`,
                }}
              />
            </div>
          )}

          {/* glass tint above the frost, below the content */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              borderRadius: `${borderRadius}px`,
              backgroundColor: glassFill,
            }}
          />

          {/* views pill — bottom left */}
          {showViews && (
            <div
              className="pointer-events-none absolute z-[31]"
              style={{ bottom: "12px", left: "12px" }}
            >
              <Tooltip label={viewCount.toLocaleString()} placement="top">
                <span
                  className="inline-flex cursor-default items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
                  style={{
                    borderRadius: "8px",
                    color: withAlpha(textColor, 0.7),
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <svg
                    className="h-3.5 w-3.5 opacity-70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {viewCount.toLocaleString()}
                  <span className="opacity-60">views</span>
                </span>
              </Tooltip>
            </div>
          )}

          {/* like / dislike — bottom right */}
          <div
            className="pointer-events-none absolute z-[31] flex items-center gap-0.5"
            style={{ bottom: "12px", right: "12px" }}
          >
            <Tooltip count={fb.likes} placement="top">
              <button
                type="button"
                aria-label="Like profile"
                aria-pressed={fb.mine === "like"}
                disabled={preview}
                onClick={() => vote("like")}
                className={`pointer-events-auto flex items-center justify-center rounded-lg p-1.5 transition-all hover:scale-110 disabled:cursor-default disabled:hover:scale-100 ${
                  fb.mine === "like"
                    ? "text-white/90"
                    : "text-white/55 hover:text-white/90"
                }`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d={LIKE_PATH} />
                </svg>
              </button>
            </Tooltip>

            <Tooltip count={fb.dislikes} placement="top">
              <button
                type="button"
                aria-label="Dislike profile"
                aria-pressed={fb.mine === "dislike"}
                disabled={preview}
                onClick={() => vote("dislike")}
                className={`pointer-events-auto flex items-center justify-center rounded-lg p-1.5 transition-all hover:scale-110 disabled:cursor-default disabled:hover:scale-100 ${
                  fb.mine === "dislike"
                    ? "text-white/90"
                    : "text-white/55 hover:text-white/90"
                }`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                >
                  <path d={DISLIKE_PATH} />
                </svg>
              </button>
            </Tooltip>
          </div>

          {/* content */}
          <div
            className="relative z-10 flex flex-col p-6 text-left"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            <div className="mb-4 flex items-center gap-4">
              {/* avatar */}
              <div className="shrink-0">
                <Tooltip label={`@${user.username}`} placement="top">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={user.username}
                      className="object-cover"
                      style={{
                        ...avatarStyle(avatarShape),
                        width: "104px",
                        height: "104px",
                      }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center bg-white/10 text-3xl font-bold"
                      style={{
                        ...avatarStyle(avatarShape),
                        color: textColor,
                        width: "104px",
                        height: "104px",
                      }}
                    >
                      {displayName[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </Tooltip>
              </div>

              {/* name + badges + bio */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-start gap-3">
                  <Tooltip label={String(user.id)} placement="top">
                    <span
                      className="inline-flex shrink-0 cursor-default items-center text-[1.875rem] font-semibold leading-none tracking-tight"
                      style={{ color: textColor }}
                    >
                      {displayName}
                    </span>
                  </Tooltip>

                  {!badgesBelow && badgesRow}
                </div>

                {badgesBelow && badgesRow && (
                  <div className="mt-1.5 flex justify-start">{badgesRow}</div>
                )}

                {bio && (
                  <p
                    className="mt-2 w-fit max-w-full whitespace-pre-wrap break-words text-lg leading-relaxed"
                    style={{ color: withAlpha(textColor, 0.84) }}
                  >
                    {bio}
                  </p>
                )}

                {description && (
                  <p
                    className="mt-1 max-w-full text-base"
                    style={{ color: withAlpha(textColor, 0.6) }}
                  >
                    {description}
                  </p>
                )}

                {(occupation || location) && (
                  <div
                    className="mt-1.5 flex flex-col gap-1 text-sm"
                    style={{ color: withAlpha(textColor, 0.4) }}
                  >
                    {occupation && (
                      <span
                        className="font-medium"
                        style={{ color: withAlpha(textColor, 0.6) }}
                      >
                        {occupation}
                      </span>
                    )}
                    {location && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {location}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* socials */}
            {socials.length > 0 && (
              <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-3">
                {socials.map((social) => {
                  const platform = String(social.platform).trim().toLowerCase();
                  const faIcon = brandIcons[platform];
                  const path = !faIcon ? socialPaths[platform] : undefined;

                  if (
                    !faIcon &&
                    !path &&
                    !(platform === "custom" && social.iconUrl)
                  )
                    return null;

                  const glow = `drop-shadow(0 0 3.33px ${withAlpha(
                    socialAccent,
                    0.34
                  )}) drop-shadow(0 0 6.6px ${withAlpha(socialAccent, 0.11)})`;

                  return (
                    <Tooltip
                      key={social.id}
                      label={getPlatformName(platform)}
                      placement="top"
                    >
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={platform}
                        onClick={blockPreviewClick}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all hover:scale-110"
                        style={{ color: socialAccent }}
                      >
                        {platform === "custom" && social.iconUrl ? (
                          <img
                            src={social.iconUrl}
                            alt={platform}
                            className="h-full w-full object-cover"
                          />
                        ) : faIcon ? (
                          <FontAwesomeIcon
                            icon={faIcon}
                            aria-hidden="true"
                            style={{
                              width: "32px",
                              height: "32px",
                              filter: glow,
                            }}
                          />
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                            className="block h-[32px] w-[32px] shrink-0"
                            style={{ filter: glow }}
                          >
                            <path d={path} />
                          </svg>
                        )}
                      </a>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {/* content links */}
            {links.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                {links.map((link) => (
                  <Tooltip
                    key={link.id}
                    label={link.url || link.title}
                    placement="top"
                  >
                    <a
                      href={preview ? "#" : `/api/click?id=${link.id}`}
                      target={preview ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      onClick={blockPreviewClick}
                      className="flex items-center justify-center gap-4 border border-white/10 bg-white/[0.06] px-5 py-3.5 font-medium transition hover:bg-white/10"
                      style={{
                        color: textColor,
                        borderRadius: "12px",
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
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Picker preview                                                      */
/* ------------------------------------------------------------------ */

export function HaloPreview() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-3/4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 shrink-0 rounded-full bg-pink-400/40" />
          <div className="h-2.5 w-16 rounded-full bg-white/20" />
        </div>
        <div className="h-3.5 rounded bg-white/10" />
        <div className="flex justify-center gap-1.5 pt-1">
          <div className="h-4 w-4 rounded bg-white/15" />
          <div className="h-4 w-4 rounded bg-white/15" />
        </div>
      </div>
    </div>
  );
}
