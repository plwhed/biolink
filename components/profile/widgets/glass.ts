import type { CSSProperties } from "react";
import { resolveColor, withAlpha } from "@/lib/color";
import type { ProfileCardProfile } from "../profile-card";

export interface WidgetGlass {
  /** Backdrop blur radius in px (0 = off). */
  blur: number;
  /** Translucent card fill. */
  fill: string;
  /** Page background photo to frost a copy of (null = none). */
  bgUrl: string | null;
}

/**
 * The exact frost the Halo card uses, so widgets always match it:
 * same blur radius, same background tint scaled by card opacity.
 * Pure — safe for server and client components alike.
 */
export function cardGlass(
  profile: ProfileCardProfile | null
): WidgetGlass {
  const cardOpacity = profile?.cardOpacity ?? 100;
  const cardBlurEnabled = profile?.cardBlurEnabled ?? 1;
  const cardBlur = profile?.cardBlur ?? 2;

  return {
    blur: cardBlurEnabled ? Math.min(Math.max(cardBlur, 0), 60) : 0,
    fill: withAlpha(
      resolveColor(profile?.backgroundColor, "#000000"),
      0.45 * (Math.min(Math.max(cardOpacity, 0), 100) / 100)
    ),
    bgUrl: profile?.backgroundUrl ?? null,
  };
}

/** Panel style for a frosted widget card (null blur = flat fill). */
export function glassPanelStyle(glass: WidgetGlass | null | undefined): CSSProperties {
  if (!glass) return {};
  return {
    backgroundColor: glass.fill,
    ...(glass.blur > 0
      ? {
          backdropFilter: `blur(${glass.blur}px) saturate(185%) brightness(1.06)`,
          WebkitBackdropFilter: `blur(${glass.blur}px) saturate(185%) brightness(1.06)`,
        }
      : {}),
  };
}
