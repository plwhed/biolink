"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faCrown,
  faGem,
  faShield,
  faHeart,
  faFire,
  faBolt,
  faRocket,
  faGlobe,
  faCode,
  faMusic,
  faPaintBrush,
  faCamera,
  faGamepad,
  faHeadphones,
  faMicrophone,
  faPen,
  faTrophy,
  faAward,
  faMedal,
  faCheck,
  faCircleCheck,
  faCertificate,
  faDiamond,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import {
  faDiscord,
  faGithub,
  faTwitter,
  faYoutube,
  faTwitch,
  faTiktok,
  faInstagram,
  faReddit,
} from "@fortawesome/free-brands-svg-icons";

const solidIcons: Record<string, typeof faStar> = {
  "fa-star": faStar,
  "fa-crown": faCrown,
  "fa-gem": faGem,
  "fa-shield": faShield,
  "fa-heart": faHeart,
  "fa-fire": faFire,
  "fa-bolt": faBolt,
  "fa-rocket": faRocket,
  "fa-globe": faGlobe,
  "fa-code": faCode,
  "fa-music": faMusic,
  "fa-paint-brush": faPaintBrush,
  "fa-camera": faCamera,
  "fa-gamepad": faGamepad,
  "fa-headphones": faHeadphones,
  "fa-microphone": faMicrophone,
  "fa-pen": faPen,
  "fa-trophy": faTrophy,
  "fa-award": faAward,
  "fa-medal": faMedal,
  "fa-check": faCheck,
  "fa-circle-check": faCircleCheck,
  "fa-certificate": faCertificate,
  "fa-diamond": faDiamond,
  "fa-wand-magic-sparkles": faWandMagicSparkles,
};

const brandIcons: Record<string, typeof faDiscord> = {
  "fa-discord": faDiscord,
  "fa-github": faGithub,
  "fa-twitter": faTwitter,
  "fa-youtube": faYoutube,
  "fa-twitch": faTwitch,
  "fa-tiktok": faTiktok,
  "fa-instagram": faInstagram,
  "fa-reddit": faReddit,
};

export const SOLID_BADGE_ICONS = Object.keys(solidIcons);

export const BRAND_BADGE_ICONS = Object.keys(brandIcons);

/** FontAwesome definition for a badge, or null when it has none. */
export function resolveBadgeIcon(prefix: string, name: string) {
  const key = name.trim();
  if (!key) return null;
  if (prefix === "brand") return brandIcons[key] ?? null;
  return solidIcons[key] ?? null;
}

export default function BadgeIcon({
  prefix,
  name,
  url,
  style,
}: {
  prefix: string;
  name: string;
  url?: string;
  style?: React.CSSProperties;
}) {
  // FontAwesome wins over uploaded images — images are only a fallback
  // for badges without a known icon.
  const icon = resolveBadgeIcon(prefix, name ?? "");

  if (icon) {
    return <FontAwesomeIcon icon={icon} className="h-2 w-2" style={style as React.CSSProperties} />;
  }

  if (url) {
    // Image badges use a squircle shape (square with slightly rounded
    // corners) instead of a full circle.
    const { borderRadius = "30%", ...rest } = style ?? {};

    return (
      <img
        src={url}
        alt={name}
        className="h-2 w-2 object-cover"
        style={{ ...rest, borderRadius } as React.CSSProperties}
      />
    );
  }

  return null;
}
