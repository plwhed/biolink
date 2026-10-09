import type { CSSProperties, ReactNode } from "react";
import BadgeIcon from "@/components/badge-icon";
import { ParallaxLayer } from "@/components/parallax-card";
import Tooltip from "@/components/ui/tooltip";
import { resolveColor, withAlpha } from "@/lib/color";
import { getLayoutTemplate } from "@/components/profile/layouts";
import type { FeedbackState } from "@/lib/feedback";
import {
  ELEMENT_META,
  anchorStyle,
  avatarStyle,
  elementBoxStyle,
  parseCustomLayout,
  tooltipThemeFor,
  viewsCornerStyle,
  type CustomLayout,
  type ElementKey,
  type ElementLayout,
} from "@/lib/profile-layout";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ProfileCardProfile {
  layout?: string | null;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  cursorUrl?: string | null;
  blur?: number | null;
  cardBlur?: number | null;
  cardBlurEnabled?: number | boolean | null;
  overlayEnabled?: number | boolean | null;
  overlayText?: string | null;
  tiltEnabled?: number | boolean | null;
  tiltMode?: string | null;
  borderRadius?: number | null;
  borderWidth?: number | null;
  description?: string | null;
  bio?: string | null;
  displayName?: string | null;
  cardOpacity?: number | null;
  borderOpacity?: number | null;
  cardWidth?: number | null;
  avatarShape?: string | null;
  location?: string | null;
  occupation?: string | null;
  accentColor?: string | null;
  primaryColor?: string | null;
  textColor?: string | null;
  borderColor?: string | null;
  backgroundColor?: string | null;
  badgeColor?: string | null;
  socialColor?: string | null;
  linkHoverColor?: string | null;
  showViews?: number | boolean | null;
  viewsPosition?: string | null;
  badgesPosition?: string | null;
  customLayout?: string | null;
}

export interface ProfileCardBadge {
  id: string | number;
  name: string;
  iconPrefix: string;
  iconName: string;
  iconUrl?: string | null;
  color?: string | null;
}

export interface ProfileCardSocial {
  id: string;
  platform: string;
  url: string;
  iconUrl?: string | null;
}

export interface ProfileCardLink {
  id: string;
  title: string;
  url?: string | null;
}

/* ------------------------------------------------------------------ */
/* Static data                                                         */
/* ------------------------------------------------------------------ */

const socialIcons: Record<string, string> = {
  instagram:
    "M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z",
  youtube:
    "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.9 12l-6.3 3.6Z",
  tiktok:
    "M16.5 2h3a5.8 5.8 0 0 0 1.5 3.5A5.8 5.8 0 0 0 24 7v3.1a9 9 0 0 1-4.5-1.2v6.9a6.2 6.2 0 1 1-6.2-6.2c.4 0 .9 0 1.3.1v3.2a3.1 3.1 0 1 0 1.9 2.9V2Z",
  discord:
    "M20.3 4.4a19.8 19.8 0 0 0-4.9-1.5.7.7 0 0 0-.8.4c-.2.4-.5.9-.7 1.3a18.3 18.3 0 0 0-4 0c-.2-.4-.4-.9-.7-1.3a.7.7 0 0 0-.8-.4 19.7 19.7 0 0 0-4.9 1.5.7.7 0 0 0-.3.3C.5 9.1-.3 13.6.1 18.1c0 .1.1.2.2.3a19.9 19.9 0 0 0 6 3 .8.8 0 0 0 .8-.3c.5-.6.9-1.3 1.2-2a.8.8 0 0 0-.4-1.1 13.1 13.1 0 0 1-1.9-.9l.4-.3a.7.7 0 0 1 .8 0c3.9 1.8 8.2 1.8 12.1 0a.7.7 0 0 1 .8 0l.4.3c-.6.4-1.2.7-1.9.9a.8.8 0 0 0-.4 1.1c.4.7.8 1.4 1.2 2a.8.8 0 0 0 .8.3 19.8 19.8 0 0 0 6-3c.1 0 .2-.2.2-.3.5-5.2-.8-9.7-3.5-13.7a.7.7 0 0 0-.3-.3ZM8 15.4c-1.2 0-2.2-1.1-2.2-2.4 0-1.4 1-2.4 2.2-2.4s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm8 0c-1.2 0-2.2-1.1-2.2-2.4 0-1.4 1-2.4 2.2-2.4s2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z",
  twitter:
    "M18.2 2.3h3.3l-7.2 8.3 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.6l7.7-8.8L1.3 2.3h6.8l4.7 6.2 5.4-6.2Zm-1.2 17.5h1.8L7.1 4.1H5.1L17 19.8Z",
  github:
    "M12 .3A12 12 0 0 0 8.2 23.7c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.2-1.2-1.5-1.2-1.5-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z",
  telegram:
    "M11.944 0C5.328 0 0 5.247 0 11.808c0 2.969 1.157 5.37 3.13 7.215v4.182l3.774-2.071a11.957 11.957 0 0 0 5.041 1.247h.005c6.616 0 11.944-5.247 11.944-11.808S18.56 0 11.944 0zm5.839 7.422l-1.952 9.195c-.146.69-.563 1.054-1.176.683l-3.17-2.338-1.525 1.475c-.169.17-.313.313-.649.313l.232-3.289 5.976-5.389c.26-.23-.056-.359-.433-.128l-7.394 4.664-3.183-.998c-.687-.218-.7-.687.145-.998l12.34-4.777c.572-.208 1.071.128.886.947z",
  snapchat:
    "M12 2.5c5.108 0 8.5 3.123 8.5 7.436 0 2.717-1.173 4.94-3.188 6.142-.37.22-.854.592-.93 1.02-.155.866.501 1.46 1.205 1.9.444.278 1.045.465 1.374.82.469.507.347 1.303-.31 1.644-.874.452-1.867.688-2.842.688-1.213 0-2.17-.483-3.183-1.149-.573-.397-1.25-.634-1.93-.634-.68 0-1.357.237-1.93.634-.996.666-1.97 1.149-3.183 1.149-.975 0-1.968-.236-2.842-.688-.657-.341-.779-1.137-.31-1.644.329-.355.93-.542 1.374-.82.704-.44 1.205-1.034 1.205-1.9-.076-.413-.559-.78-.93-1.02C4.673 14.876 3.5 12.653 3.5 9.936c0-4.313 3.392-7.436 8.5-7.436z",
  reddit:
    "M17.8 12.3c.6-1.5 0-2.7-1.3-3.2-.6-.2-1.3-.2-1.9 0a11 11 0 0 1-2.7 1.6l1.1-3.8c.1-.5-.2-1-.7-1.2-.5-.1-1 .2-1.2.7l-1.1 3.9c-.8-.3-1.7-.5-2.7-.5-1.3 0-2.6.3-3.8.9-1.5.7-2.5 2.1-2.5 3.7 0 2 1.6 3.8 3.8 4.5.5.2 1 .3 1.5.3h8.2c1.5 0 2.8-1.2 2.8-2.8 0-1-.5-1.9-1.3-2.4zm-9.9.6c-.9 0-1.7-.7-1.7-1.7s.8-1.7 1.7-1.7 1.7.8 1.7 1.7-.8 1.7-1.7 1.7zm7.8 0c-.9 0-1.7-.7-1.7-1.7s.8-1.7 1.7-1.7 1.7.8 1.7 1.7-.8 1.7-1.7 1.7zm-7.3 2.8s.5.5 1.3.8h2.6c.8 0 1.6-.3 2.1-.8l.9.9c-.9.9-2.2 1.4-3.7 1.4h-2.6c-1.5 0-2.8-.5-3.7-1.4l.9-.9z",
  twitch:
    "M2.5 2.5h18.5v12.3l-5.1 5.1h-4.4l-2.5 2.5H6.8l-1.2-2.5H2.5V2.5zm16.2 1.8H5.3v10.5h3.2v2.8l2.8-2.8h4.1l3.3-3.3V4.3zm-3.5 2.8v5.3h-1.8V7.1h1.8zm-5.2 0v5.3H5.3V7.1h1.8z",
  lastfm:
    "M3.8 10.6c0-3.4 2.9-6 6.4-6 2 0 3.8.8 5.1 2.1l-1.6 1.5c-1-.9-2.1-1.4-3.7-1.4-2.4 0-4.1 1.8-4.1 4.2 0 2.4 1.7 4.2 4.1 4.2 1.6 0 2.7-.6 3.7-1.7l1.4 1.5c-1.3 1.6-3.2 2.6-5.5 2.6-3.5 0-6.3-2.4-6.3-6.1zm9.6 0c0-1.4 1-2.4 2.3-2.4 1.2 0 2.2 1 2.2 2.4 0 1.4-1 2.4-2.2 2.4-1.3 0-2.3-1-2.3-2.4zm-2.3 3.4h4.6v1.3h-4.6v-1.3z",
  spotify:
    "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.7 14.7c-.2.3-.6.4-.9.2-2.4-1.5-5.5-1.8-9.2-1-.3.1-.6-.1-.7-.4-.1-.3.1-.6.4-.7 4-.9 7.5-.5 10.3 1.2.3.2.4.6.1.7zm1.2-2.8c-.3.4-.8.6-1.2.3-2.7-1.7-6.9-2.2-10.1-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.8-1.1 8.5-.6 11.7 1.6.3.2.4.8.1 1.1zm.1-2.9c-3.2-1.9-8.5-2.1-11.6-1.1-.5.1-.9-.1-1-.6-.1-.5.2-1 .7-1.1 3.8-1.1 9.6-.9 13.3 1.4.4.2.5.8.3 1.2-.3.4-.9.5-1.3.2z",
  bitcoin:
    "M13.6 2.5h-1.2v1.3h-1.5V2.5H9.7v1.3H8.1c-.9 0-1.6.6-1.6 1.5v8.7c0 .9.7 1.5 1.6 1.5h1.6v1.3h1.2v-1.3h1.5v1.3h1.2v-1.3h.9c.9 0 1.6-.6 1.6-1.5V5.3c0-.9-.7-1.5-1.6-1.5h-.9V2.5zm-6.3 3.1h6.9v1.7H7.3V5.6zm0 3.1h7.4v1.7H7.3V8.7zm9.1 5.5c0 .3-.2.5-.5.5h-1.5v-1.5h1.5v1.5zm.2-5.5H8.3v1.7h8.3V8.7z",
  ethereum:
    "M12 2l6.6 10.1-6.6 4.6-6.6-4.6L12 2zm0 20.3l6.6-4.6L12 22l-6.6-4.3L12 22.3zm0-7.7l6.6-4.1L12 8l-6.6 2.5L12 14.6z",
  solana:
    "M4.6 7.2C5.1 6.7 5.9 6.5 6.6 6.5h11.8c.8 0 1.3.9.8 1.5L18.5 10c-.5.5-1.3.9-2 .7H4.6c-.8 0-1.3-.9-.8-1.5l1.8-2.3zm0 9.6c.5-.5 1.3-.7 2-.7h11.8c.8 0 1.3.9.8 1.5L18.5 20c-.5.5-1.3.7-2 .7H4.6c-.8 0-1.3-.9-.8-1.5l1.8-2.3zm13.9-7.2h2.8c.5 0 .8.4.8.8s-.4.8-.8.8h-2.8c-.4 0-.8-.4-.8-.8s.4-.8.8-.8zm-4.1 0h2.8c.5 0 .8.4.8.8s-.4.8-.8.8h-2.8c-.4 0-.8-.4-.8-.8s.4-.8.8-.8z",
  paypal:
    "M7.4 19.4H3.7l.8-5.1c.1-.7.6-1.2 1.3-1.2h2.6c.5 0 4.3-1.6 4.3-3.8 0-1.7-1.3-2.9-3.4-2.9H6.6c-.4 0-.8.2-1 .6L3.8 9.2c-.2.1-.3.3-.3.6l-.9 6.2zm10.4-7.1c-.3-1.9-1.2-3.6-3.5-3.6h-3.2l-.8 5.2h2.5c2.5 0 4.6-1.2 5-1.6z",
  steam:
    "M17.5 9.2c.2-1.7-.4-3.3-1.6-4.5-.8-.8-1.9-1.4-3.1-1.6-.4-.1-.8.1-1 .4l-.4.8c.7.2 1.4.6 1.9 1.2.4.4.6 1 .8 1.6l2.4.9c.2.1.3.3.3.6.1.2.1.5 0 .7l-1.5 2.4c-.1.2-.4.3-.6.3H11l-.7.7v1.1l1.1 1.1c.1.1.2.3.2.5v1.4c0 .4.3.7.7.7h1.4c.4 0 .7-.3.7-.7v-1l.9-.9h1.9c.5 0 .8-.3 1-.7l1.4-2.4c.1-.2.2-.5.1-.7l-.2-.4zM9.7 14.4c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4.6-1.4 1.4-1.4 1.4.6 1.4 1.4zm4.9-2.2c0 .5-.4.9-.9.9s-.9-.4-.9-.9.4-.9.9-.9.9.4.9.9z",
  roblox:
    "M8.3 2.5l13.2 4.2-2.4 8.7L5.9 11.2 8.3 2.5zm4.8 7.6l1.5-5.4 5.4 1.5-1.5 5.4-5.4-1.5zm-6.6 6.7l6.9 2.1-1.6 5.9-6.9-2.1 1.6-5.9z",
  soundcloud:
    "M12.6 5.4a1 1 0 0 0-1-.9H8.7c-.4 0-.8.2-1 .5a1.6 1.6 0 0 0-2.5 1.4c0 .2 0 .4.1.6A3.8 3.8 0 0 0 5 14.8h7.3c2.7 0 4.9-2.2 4.9-4.9A4.3 4.3 0 0 0 12.6 5.4zm-2.7 9.2H5.5a2.5 2.5 0 0 1-2.5-2.5 2.5 2.5 0 0 1 1.1-2.1A5.2 5.2 0 0 1 9.7 4.2c2.9 0 5.2 2.1 5.2 4.7 0 2.7-2.1 4.7-4.9 4.7zm.9-4.5h1.7v5.7h-1.7V10.1zm-2.5 2.5h1.7v3.2H8.3v-3.2zm5.2-1.8h1.7v5.1H13.5v-5.1zm-7.7 1.2v3.9H4.1v-3.9z",
  kick:
    "M8.2 3.5h3.1v5.6H8.2V3.5zm4.1 0h3.1v8.5h-3.1V3.5zm-4.1 7.8h10.4v3.1H8.2v-3.1zM3.5 13.5h3.1v4.2h-3.1v-4.2zm13.1 0h3.1v4.2h-3.1v-4.2z",
  onlyfans:
    "M12 2.5c-4.1 0-7.5 3.4-7.5 7.5s3.4 7.5 7.5 7.5 7.5-3.4 7.5-7.5-3.4-7.5-7.5-7.5zm-1.1 3.6h2.2v4.3h3.5v2.2h-3.5v4.3h-2.2v-4.3H7.4v-2.2h3.5V6.1z",
  custom:
    "M12 2.5a1.5 1.5 0 0 1 1.5 1.5v1.5h1.5a1.5 1.5 0 0 1 0 3H13.5V10a1.5 1.5 0 0 1-3 0V8.5H9a1.5 1.5 0 0 1 0-3h1.5V4A1.5 1.5 0 0 1 12 2.5zm-5.5 9A1.5 1.5 0 0 1 8 12.5h8a1.5 1.5 0 0 1 0 3H8a1.5 1.5 0 0 1-1.5-1.5zm1.5 6.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 0 3h-4a1.5 1.5 0 0 1-1.5-1.5z",
};

const platformNames: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  discord: "Discord",
  twitter: "Twitter",
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

/** Vertical rhythm for elements that stay in the normal document flow. */
const FLOW_MARGIN: Record<ElementKey, number> = {
  avatar: 0,
  username: 16,
  badges: 8,
  bio: 12,
  description: 16,
  meta: 8,
  socials: 20,
  links: 32,
  views: 16,
};

type Position = "flow" | "abs" | "corner";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function ProfileCard({
  user,
  profile,
  badges = [],
  socials = [],
  links = [],
  viewCount = 0,
  preview = false,
  editor = false,
  feedback = null,
}: {
  user: { id: number; username: string };
  profile: ProfileCardProfile | null;
  badges?: ProfileCardBadge[];
  socials?: ProfileCardSocial[];
  links?: ProfileCardLink[];
  viewCount?: number;
  /** When true, links/socials render inert (used by dashboard previews). */
  preview?: boolean;
  /**
   * When true, hidden elements still render (dimmed) so the layout
   * editor can select them and flip visibility back on.
   */
  editor?: boolean;
  /** Server-rendered like/dislike state for the Halo template. */
  feedback?: FeedbackState | null;
}) {
  /** Keeps preview links from navigating away. */
  const blockPreviewClick = (event: { preventDefault: () => void }) => {
    if (preview) event.preventDefault();
  };
  /* ---------------- settings ---------------- */
  const layout = profile?.layout ?? "centered";
  const template = getLayoutTemplate(layout);

  const custom: CustomLayout | null = parseCustomLayout(profile?.customLayout);
  const useCustom = !!custom?.enabled;

  // Custom mode ignores the template flow layout — the card becomes a
  // freely movable canvas and its inner content stays left-aligned.
  // Otherwise the active template (see ./layouts/) decides the alignment.
  const isCentered = !useCustom && template.align === "center";

  const cardBlurEnabled = !!(profile?.cardBlurEnabled ?? 1);
  const cardBlur = profile?.cardBlur ?? 20;
  const avatarShape = profile?.avatarShape ?? "circle";
  const location = profile?.location ?? "";
  const occupation = profile?.occupation ?? "";
  const borderRadius = profile?.borderRadius ?? 24;
  const borderWidth = profile?.borderWidth ?? 1;
  const description = profile?.description ?? "";
  const bio = profile?.bio ?? "";
  const displayName = profile?.displayName || user.username;
  const cardOpacity = profile?.cardOpacity ?? 100;
  const borderOpacity = profile?.borderOpacity ?? 100;
  const cardWidth = profile?.cardWidth ?? 420;

  const showViews =
    profile?.showViews == null ? true : Number(profile.showViews) !== 0;
  const viewsPosition = profile?.viewsPosition ?? "top-right";
  const badgesPlacement = profile?.badgesPosition ?? "auto";

  const primaryColor = resolveColor(
    profile?.primaryColor ?? profile?.accentColor,
    "#ffffff"
  );
  const textColor = resolveColor(profile?.textColor, "#ffffff");
  const borderColor = resolveColor(profile?.borderColor, "#ffffff");
  const backgroundColor = resolveColor(profile?.backgroundColor, "#111111");
  const badgeAccent = resolveColor(profile?.badgeColor, primaryColor);
  const socialAccent = resolveColor(profile?.socialColor, primaryColor);
  const linkHoverAccent = resolveColor(profile?.linkHoverColor, primaryColor);

  const cardBackground = withAlpha(backgroundColor, cardOpacity / 100);
  const cardBorder = withAlpha(borderColor, borderOpacity / 100);
  const linkBorder = withAlpha(borderColor, (borderOpacity / 100) * 0.2);

  const cfg = (key: ElementKey): ElementLayout | null =>
    useCustom && custom ? custom.elements[key] : null;

  const isHidden = (key: ElementKey) => {
    const element = cfg(key);
    if (!element || element.visible) return false;
    // In the editor hidden elements stay rendered (dimmed) so people can
    // still click them and turn visibility back on.
    return !editor;
  };

  const positionOf = (key: ElementKey): Position => {
    const element = cfg(key);
    if (!element) return key === "views" ? "corner" : "flow";
    if (element.anchor === "auto") return key === "views" ? "corner" : "flow";
    if (element.anchor === "flow") return "flow";
    return "abs";
  };

  /** Wrapper style: flow margin, custom anchor, width and opacity. */
  const wrapStyle = (
    key: ElementKey,
    marginTop?: number,
    extra?: CSSProperties
  ): CSSProperties => {
    const element = cfg(key);
    const position = positionOf(key);
    const style: CSSProperties = { ...elementBoxStyle(element) };

    if (position === "corner") {
      Object.assign(style, { position: "absolute", zIndex: 50 }, viewsCornerStyle(viewsPosition));
    } else if (position === "abs" && element) {
      Object.assign(
        style,
        { position: "absolute", zIndex: 50 },
        anchorStyle(element.anchor, element.x, element.y)
      );
    } else if (marginTop != null) {
      style.marginTop = marginTop;
    }

    if (element && ELEMENT_META[key].boxTarget === "wrapper") {
      const background =
        element.backgroundColor && element.backgroundColor !== "transparent"
          ? element.backgroundColor
          : null;
      const hasBorder = element.borderWidth != null && element.borderWidth > 0;

      if (background) style.backgroundColor = background;
      if (hasBorder) {
        // outline instead of border: it is drawn *outward*, so a thicker
        // border never shrinks the content
        style.outline = `${element.borderWidth}px solid ${
          element.borderColor || "rgba(255, 255, 255, 0.25)"
        }`;
      }
      if (hasBorder || background) style.padding = "6px 10px";
      if (element.borderRadius != null) {
        style.borderRadius = `${element.borderRadius}px`;
      }
    }

    // dimmed placeholder for elements the visitor will not see
    if (editor && element && !element.visible) style.opacity = 0.3;

    if (extra) Object.assign(style, extra);

    return style;
  };

  const wrap = (
    key: ElementKey,
    node: ReactNode,
    marginTop?: number,
    extra?: CSSProperties
  ) => (
    <div key={key} data-ekey={key} style={wrapStyle(key, marginTop, extra)}>
      {node}
    </div>
  );

  /* ---------------- element: avatar ---------------- */
  const avatarCfg = cfg("avatar");
  const avatarSize = avatarCfg?.size ?? 80;
  const avatarBorder =
    avatarCfg && avatarCfg.borderWidth != null && avatarCfg.borderWidth > 0
      ? `${avatarCfg.borderWidth}px solid ${
          avatarCfg.borderColor || "rgba(255, 255, 255, 0.4)"
        }`
      : undefined;

  const avatarNode = (
    <Tooltip
      label={`@${user.username}`}
      placement="top"
      background={tooltipThemeFor(custom, "avatar").background}
      border={tooltipThemeFor(custom, "avatar").border}
      color={tooltipThemeFor(custom, "avatar").text}
      className="cursor-default"
    >
      {profile?.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt={user.username}
          className="object-cover ring-2 ring-white/10"
          style={{
            ...avatarStyle(avatarShape),
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            outline: avatarBorder,
          }}
        />
      ) : (
        <div
          className="flex items-center justify-center bg-white/10 text-3xl font-bold"
          style={{
            ...avatarStyle(avatarShape),
            color: avatarCfg?.color ?? primaryColor,
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            outline: avatarBorder,
          }}
        >
          {displayName[0]?.toUpperCase() ?? "?"}
        </div>
      )}
    </Tooltip>
  );

  /* ---------------- element: username ---------------- */
  const usernameCfg = cfg("username");
  const usernameTheme = tooltipThemeFor(custom, "username");

  const usernameNode = (
    <h1
      className="text-2xl font-bold tracking-tight"
      style={{
        color: usernameCfg?.color ?? textColor,
        ...(usernameCfg?.fontSize ? { fontSize: `${usernameCfg.fontSize}px` } : {}),
      }}
    >
      <Tooltip
        label={String(user.id)}
        placement="top"
        background={usernameTheme.background}
        border={usernameTheme.border}
        color={usernameTheme.text}
        className="cursor-default"
      >
        {displayName}
      </Tooltip>
    </h1>
  );

  /* ---------------- element: badges ---------------- */
  const badgesCfg = cfg("badges");
  const badgeBoxSize = badgesCfg?.size ?? 28;
  const badgeIconSize = Math.max(10, badgeBoxSize - 6);
  const badgeIconColor = badgesCfg?.color ?? badgeAccent;
  const badgeTheme = tooltipThemeFor(custom, "badges");

  const badgesNode =
    badges.length > 0 ? (
      <div
        className={`inline-flex flex-wrap items-center gap-1.5 px-3 py-1.5 ${
          badgesCfg?.backgroundColor || badgesCfg?.borderWidth === 0
            ? ""
            : badgesCfg
              ? "bg-white/5"
              : "border border-white/10 bg-white/5"
        }`}
        style={{
          borderRadius: `${badgesCfg?.borderRadius ?? 9999}px`,
          ...(badgesCfg?.backgroundColor
            ? { backgroundColor: badgesCfg.backgroundColor }
            : badgesCfg
              ? {}
              : { backgroundColor: "rgba(255, 255, 255, 0.05)" }),
          // outline draws outward — a thicker border never shrinks the pills
          outline:
            badgesCfg && badgesCfg.borderWidth === 0
              ? "none"
              : badgesCfg
                ? `${
                    badgesCfg.borderWidth ?? 1
                  }px solid ${badgesCfg?.borderColor ?? "rgba(255, 255, 255, 0.1)"}`
                : undefined,
        }}
      >
        {badges.map((badge) => (
          <Tooltip
            key={badge.id}
            label={badge.name}
            placement="top"
            background={badgeTheme.background}
            border={badgeTheme.border}
            color={badgeTheme.text}
            className="cursor-default"
          >
            <span
              className="relative inline-flex items-center justify-center p-0.5 transition hover:bg-white/10"
              style={{
                width: `${badgeBoxSize}px`,
                height: `${badgeBoxSize}px`,
                borderRadius: `${Math.round(badgeBoxSize * 0.3)}px`,
              }}
            >
              <BadgeIcon
                prefix={badge.iconPrefix}
                name={badge.iconName}
                url={badge.iconUrl ?? undefined}
                style={{
                  color: badgeIconColor,
                  width: `${badgeIconSize}px`,
                  height: `${badgeIconSize}px`,
                }}
              />
            </span>
          </Tooltip>
        ))}
      </div>
    ) : null;

  /* ---------------- element: bio ---------------- */
  const bioCfg = cfg("bio");
  const bioNode = bio ? (
    <p
      className="whitespace-pre-wrap"
      style={{
        color: bioCfg?.color ?? withAlpha(textColor, 0.92),
        fontSize: `${bioCfg?.fontSize ?? 15}px`,
        fontWeight: 500,
        lineHeight: 1.5,
      }}
    >
      {bio}
    </p>
  ) : null;

  /* ---------------- element: description ---------------- */
  const descriptionCfg = cfg("description");
  const descriptionNode = description ? (
    <p
      className="max-w-lg text-base"
      style={{
        color: descriptionCfg?.color ?? withAlpha(textColor, 0.6),
        ...(descriptionCfg?.fontSize
          ? { fontSize: `${descriptionCfg.fontSize}px` }
          : {}),
      }}
    >
      {description}
    </p>
  ) : null;

  /* ---------------- element: meta (occupation/location) ---------------- */
  const metaCfg = cfg("meta");
  const metaNode = occupation || location ? (
    <div
      className={`flex flex-col gap-1 text-sm ${
        isCentered ? "items-center" : "items-start"
      }`}
      style={{
        color: metaCfg?.color ?? withAlpha(textColor, 0.4),
        ...(metaCfg?.fontSize ? { fontSize: `${metaCfg.fontSize}px` } : {}),
      }}
    >
      {occupation && (
        <span
          className="font-medium"
          style={{
            color: metaCfg?.color ?? withAlpha(textColor, 0.6),
          }}
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
  ) : null;

  /* ---------------- element: socials ---------------- */
  const socialsCfg = cfg("socials");
  const socialSize = socialsCfg?.size ?? 24;
  const socialTheme = tooltipThemeFor(custom, "socials");

  const socialsNode =
    socials.length > 0 ? (
      <div
        className={`flex items-center gap-4 ${isCentered ? "justify-center" : ""}`}
      >
        {socials.map((social) => {
          const platform = String(social.platform).trim().toLowerCase();
          const icon = socialIcons[platform];

          if (!icon && !(platform === "custom" && social.iconUrl)) return null;

          return (
            <Tooltip
              key={social.id}
              label={getPlatformName(platform)}
              placement="top"
              background={socialTheme.background}
              border={socialTheme.border}
              color={socialTheme.text}
            >
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform}
                onClick={blockPreviewClick}
                className="flex items-center justify-center overflow-hidden transition-opacity hover:opacity-75"
                style={{
                  width: `${socialSize}px`,
                  height: `${socialSize}px`,
                  color: socialsCfg?.color ?? socialAccent,
                  borderRadius: `${socialsCfg?.borderRadius ?? 6}px`,
                  ...(socialsCfg?.backgroundColor
                    ? { backgroundColor: socialsCfg.backgroundColor }
                    : {}),
                  ...(socialsCfg && socialsCfg.borderWidth
                    ? {
                        outline: `${socialsCfg.borderWidth}px solid ${
                          socialsCfg.borderColor || "rgba(255, 255, 255, 0.25)"
                        }`,
                      }
                    : {}),
                }}
              >
                {platform === "custom" && social.iconUrl ? (
                  <img
                    src={social.iconUrl}
                    alt={platform}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="block"
                    style={{
                      width: `${socialSize}px`,
                      height: `${socialSize}px`,
                    }}
                  >
                    <path d={icon} />
                  </svg>
                )}
              </a>
            </Tooltip>
          );
        })}
      </div>
    ) : null;

  /* ---------------- element: links ---------------- */
  const linksCfg = cfg("links");
  const linkTheme = tooltipThemeFor(custom, "links");

  const idleLinkStyle: CSSProperties = {
    color: linksCfg?.color ?? textColor,
    backgroundColor: linksCfg?.backgroundColor ?? withAlpha(backgroundColor, 0.2),
    borderRadius: `${linksCfg?.borderRadius ?? 12}px`,
    // outline draws outward — the border never eats into the button text
    outline: `${linksCfg?.borderWidth ?? 1}px solid ${
      linksCfg?.borderColor ?? linkBorder
    }`,
    ...(linksCfg?.fontSize ? { fontSize: `${linksCfg.fontSize}px` } : {}),
  };

  const linksNode =
    links.length > 0 ? (
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <Tooltip
            key={link.id}
            label={link.url || link.title}
            placement="top"
            background={linkTheme.background}
            border={linkTheme.border}
            color={linkTheme.text}
          >
            <a
              href={`/api/click?id=${link.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={blockPreviewClick}
              className={`flex items-center gap-4 px-5 py-3.5 font-medium transition ${
                isCentered ? "justify-center" : ""
              }`}
              style={idleLinkStyle}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor =
                  withAlpha(linkHoverAccent, 0.15);
                event.currentTarget.style.outlineColor =
                  withAlpha(linkHoverAccent, 0.35);
                event.currentTarget.style.color = linkHoverAccent;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor =
                  idleLinkStyle.backgroundColor as string;
                event.currentTarget.style.outline = idleLinkStyle.outline as string;
                event.currentTarget.style.color = idleLinkStyle.color as string;
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
    ) : null;

  /* ---------------- element: views ---------------- */
  const viewsCfg = cfg("views");
  const viewsTheme = tooltipThemeFor(custom, "views");

  const viewsNode = showViews ? (
    <Tooltip
      label={viewCount.toLocaleString()}
      placement="top"
      background={viewsTheme.background}
      border={viewsTheme.border}
      color={viewsTheme.text}
      className="cursor-default"
    >
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${
          viewsCfg?.backgroundColor || viewsCfg?.borderWidth === 0
            ? ""
            : viewsCfg
              ? "bg-white/5"
              : "border border-white/10 bg-white/5"
        }`}
        style={{
          borderRadius: `${viewsCfg?.borderRadius ?? 8}px`,
          color: viewsCfg?.color ?? withAlpha(textColor, 0.7),
          fontSize: viewsCfg?.fontSize ? `${viewsCfg.fontSize}px` : undefined,
          ...(viewsCfg?.backgroundColor
            ? { backgroundColor: viewsCfg.backgroundColor }
            : viewsCfg
              ? {}
              : { backgroundColor: "rgba(255, 255, 255, 0.05)" }),
          // outline draws outward — a thicker border never shrinks the pill
          outline:
            viewsCfg && viewsCfg.borderWidth === 0
              ? "none"
              : viewsCfg
                ? `${
                    viewsCfg.borderWidth ?? 1
                  }px solid ${viewsCfg?.borderColor ?? "rgba(255, 255, 255, 0.1)"}`
                : undefined,
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
  ) : null;

  /* ---------------- assembly ---------------- */
  const headerFlow: ReactNode[] = [];
  let linksItem: ReactNode = null;
  const absoluteItems: ReactNode[] = [];

  const place = (
    key: ElementKey,
    node: ReactNode | null,
    options?: { marginTop?: number; extra?: CSSProperties; links?: boolean }
  ) => {
    if (!node || isHidden(key)) return;

    const position = positionOf(key);

    if (position === "flow") {
      const element = wrap(
        key,
        node,
        options?.marginTop ?? FLOW_MARGIN[key],
        options?.extra
      );

      if (options?.links) linksItem = element;
      else headerFlow.push(element);
    } else {
      absoluteItems.push(wrap(key, node));
    }
  };

  place("avatar", avatarNode, { marginTop: 0 });

  // name row: username (+ badges when they sit next to the name)
  const badgesNext =
    badgesPlacement === "next" ||
    (badgesPlacement !== "below" && !isCentered);

  const nameChildren: ReactNode[] = [];

  if (!isHidden("username")) {
    if (positionOf("username") === "flow") {
      nameChildren.push(wrap("username", usernameNode));
    } else {
      absoluteItems.push(wrap("username", usernameNode));
    }
  }

  if (badgesNode && !isHidden("badges")) {
    const badgesPosition = positionOf("badges");

    if (badgesPosition === "flow" && badgesNext) {
      nameChildren.push(wrap("badges", badgesNode));
    } else if (badgesPosition === "flow") {
      headerFlow.push(wrap("badges", badgesNode, FLOW_MARGIN.badges));
    } else {
      absoluteItems.push(wrap("badges", badgesNode));
    }
  }

  if (nameChildren.length > 0) {
    headerFlow.push(
      <div
        key="name"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          justifyContent: isCentered ? "center" : "flex-start",
          marginTop: `${FLOW_MARGIN.username}px`,
        }}
      >
        {nameChildren}
      </div>
    );
  }

  place("bio", bioNode, { marginTop: FLOW_MARGIN.bio });
  place("description", descriptionNode, { marginTop: FLOW_MARGIN.description });
  place("meta", metaNode, { marginTop: FLOW_MARGIN.meta });
  place("socials", socialsNode, { marginTop: FLOW_MARGIN.socials });

  if (viewsNode) {
    place("views", viewsNode, {
      marginTop: FLOW_MARGIN.views,
      extra: positionOf("views") === "flow" && isCentered
        ? { textAlign: "center" }
        : undefined,
    });
  }

  place("links", linksNode, { marginTop: FLOW_MARGIN.links, links: true });

  /* ---------------- card ---------------- */
  const customCardStyle: CSSProperties = {};

  if (useCustom && custom) {
    const cardLayout = custom.card;

    if (cardLayout.width != null) customCardStyle.width = `${cardLayout.width}px`;
    if (cardLayout.radius != null) {
      customCardStyle.borderRadius = `${cardLayout.radius}px`;
    }
    if (cardLayout.borderWidth != null) {
      customCardStyle.outlineWidth = `${cardLayout.borderWidth}px`;
    }
    if (cardLayout.borderColor) customCardStyle.outlineColor = cardLayout.borderColor;
    if (cardLayout.backgroundColor || cardLayout.opacity != null) {
      customCardStyle.backgroundColor = withAlpha(
        cardLayout.backgroundColor || backgroundColor,
        (cardLayout.opacity ?? cardOpacity) / 100
      );
    }
    if (cardLayout.paddingX != null) {
      customCardStyle.paddingLeft = `${cardLayout.paddingX}px`;
      customCardStyle.paddingRight = `${cardLayout.paddingX}px`;
    }
    if (cardLayout.paddingY != null) {
      customCardStyle.paddingTop = `${cardLayout.paddingY}px`;
      customCardStyle.paddingBottom = `${cardLayout.paddingY}px`;
    }

    customCardStyle.minHeight = `${cardLayout.minHeight ?? 320}px`;

    if (cardLayout.x != null || cardLayout.y != null) {
      customCardStyle.transform = `translate(${cardLayout.x ?? 0}px, ${
        cardLayout.y ?? 0
      }px)`;
    }
  }

  const cardStyle: CSSProperties = {
    position: "relative",
    borderRadius: `${borderRadius}px`,
    backgroundColor: cardBackground,
    // outline instead of border: drawn outward, so the configured width
    // never shrinks the content inside the card
    outlineStyle: "solid",
    outlineWidth: `${borderWidth}px`,
    outlineColor: cardBorder,
    width: `${cardWidth}px`,
    maxWidth: "100%",
    color: textColor,
    ...(cardBlurEnabled
      ? {
          backdropFilter: `blur(${cardBlur}px)`,
          WebkitBackdropFilter: `blur(${cardBlur}px)`,
        }
      : {}),
    ...customCardStyle,
  };

  const cardClass = `w-full px-8 py-10 shadow-2xl shadow-black/50 ${
    cardBlurEnabled ? "backdrop-blur-2xl" : ""
  } ${isCentered ? "text-center" : ""}`;

  /* Halo (or any template with a full-card component) renders itself —
     the card wrapper below only exists for the custom free-move canvas. */
  if (!useCustom && template.Component) {
    const TemplateComponent = template.Component;

    return (
      <ParallaxLayer depth={0} z={0}>
        <TemplateComponent
          user={user}
          profile={profile}
          badges={badges}
          socials={socials}
          links={links}
          viewCount={viewCount}
          preview={preview}
          feedback={feedback}
        />
      </ParallaxLayer>
    );
  }

  const flowContent = (
    <>
      {headerFlow}
      {linksItem}
      {absoluteItems}
    </>
  );

  return (
    <ParallaxLayer depth={0} z={0}>
      <div className={cardClass} style={cardStyle} data-card-root>
        {flowContent}
      </div>
    </ParallaxLayer>
  );
}
